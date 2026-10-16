const test = require("node:test");
const assert = require("node:assert/strict");

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
  if (Object.hasOwn(body, "priority") && !["low", "medium", "high"].includes(body.priority)) {
    errors.push("Priority must be low, medium, or high.");
  }
  if (Object.hasOwn(body, "status") && !["open", "in-progress", "resolved"].includes(body.status)) {
    errors.push("Status must be open, in-progress, or resolved.");
  }
  return errors;
}

test("rejects a missing title", () => {
  assert.ok(validateIssue({}).includes("Title is required."));
});
test("accepts a valid issue", () => {
  assert.deepEqual(validateIssue({ title: "Fix login", priority: "high", status: "open" }), []);
});
test("rejects an unsupported priority", () => {
  assert.ok(validateIssue({ title: "Fix login", priority: "urgent" }).includes("Priority must be low, medium, or high."));
});
test("allows partial status updates without a title", () => {
  assert.deepEqual(validateIssue({ status: "resolved" }, true), []);
});
