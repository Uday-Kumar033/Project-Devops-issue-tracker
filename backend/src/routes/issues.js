const express = require("express");
const { pool } = require("../db");

const router = express.Router();
const VALID_STATUSES = new Set(["open", "in-progress", "resolved"]);
const VALID_PRIORITIES = new Set(["low", "medium", "high"]);

function validateIssue(body, partial = false) {
  const errors = [];
  if (!partial || Object.hasOwn(body, "title")) {
    if (typeof body.title !== "string" || !body.title.trim()) errors.push("Title is required.");
    else if (body.title.trim().length > 120) errors.push("Title must be 120 characters or fewer.");
  }
  if (Object.hasOwn(body, "description") &&
      (typeof body.description !== "string" || body.description.length > 2000)) {
    errors.push("Description must be a string of 2000 characters or fewer.");
  }
  if (Object.hasOwn(body, "assignee") &&
      (typeof body.assignee !== "string" || body.assignee.trim().length > 80)) {
    errors.push("Assignee must be a string of 80 characters or fewer.");
  }
  if (Object.hasOwn(body, "priority") && !VALID_PRIORITIES.has(body.priority)) {
    errors.push("Priority must be low, medium, or high.");
  }
  if (Object.hasOwn(body, "status") && !VALID_STATUSES.has(body.status)) {
    errors.push("Status must be open, in-progress, or resolved.");
  }
  if (!partial) {
    if (body.priority === undefined) body.priority = "medium";
    if (body.status === undefined) body.status = "open";
    if (body.description === undefined) body.description = "";
    if (body.assignee === undefined) body.assignee = "";
  }
  return errors;
}

function mapIssue(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    assignee: row.assignee,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT id, title, description, priority, status, assignee, created_at, updated_at FROM issues ORDER BY created_at DESC"
    );
    res.json(result.rows.map(mapIssue));
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Request body must be a JSON object." });
    }
    const errors = validateIssue(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(" ") });

    const { title, description, priority, status, assignee } = req.body;
    const result = await pool.query(
      `INSERT INTO issues (title, description, priority, status, assignee)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, priority, status, assignee, created_at, updated_at`,
      [title.trim(), description.trim(), priority, status, assignee.trim()]
    );
    res.status(201).json(mapIssue(result.rows[0]));
  } catch (error) { next(error); }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Issue ID must be a positive integer." });
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).json({ error: "Request body must be a JSON object." });
    }
    const errors = validateIssue(req.body, true);
    if (errors.length) return res.status(400).json({ error: errors.join(" ") });

    const allowed = ["title", "description", "priority", "status", "assignee"];
    const updates = allowed.filter((key) => Object.hasOwn(req.body, key));
    if (!updates.length) return res.status(400).json({ error: "Provide at least one field to update." });

    const values = updates.map((key) => typeof req.body[key] === "string" && ["title", "description", "assignee"].includes(key)
      ? req.body[key].trim() : req.body[key]);
    const assignments = updates.map((key, index) => `${({ title: "title", description: "description", priority: "priority", status: "status", assignee: "assignee" })[key]} = $${index + 1}`);
    values.push(id);
    const result = await pool.query(
      `UPDATE issues SET ${assignments.join(", ")}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, title, description, priority, status, assignee, created_at, updated_at`,
      values
    );
    if (!result.rowCount) return res.status(404).json({ error: "Issue not found." });
    res.json(mapIssue(result.rows[0]));
  } catch (error) { next(error); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Issue ID must be a positive integer." });
    const result = await pool.query("DELETE FROM issues WHERE id = $1 RETURNING id", [id]);
    if (!result.rowCount) return res.status(404).json({ error: "Issue not found." });
    res.status(204).end();
  } catch (error) { next(error); }
});

module.exports = router;