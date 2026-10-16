require("dotenv").config();
const app = require("./app");
const { pool } = require("./db");

const port = Number(process.env.PORT || 5000);

async function start() {
  try {
    await pool.query("SELECT 1");
    app.listen(port, "0.0.0.0", () => {
      console.log(`IssueFlow API listening on http://localhost:${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Unable to connect to PostgreSQL. Check DATABASE_URL and ensure the database is running.");
    console.error(error.message);
    process.exit(1);
  }
}

start();

async function shutdown(signal) {
  console.log(`${signal} received; closing database pool...`);
  try {
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Error while closing database pool:", error.message);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));