import { useCallback, useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [issues, setIssues] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      const response = await fetch(`${API_URL}/api/issues?${params.toString()}`);
      if (!response.ok) throw new Error("Could not load issues");
      setIssues(await response.json());
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadIssues(); }, [loadIssues]);

  async function createIssue(event) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, priority }),
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.detail?.[0]?.msg || body.detail || "Create failed");
      }
      setTitle("");
      setDescription("");
      setPriority("medium");
      await loadIssues();
    } catch (err) {
      setError(err.message || "Could not create issue");
    }
  }

  async function changeStatus(issue, status) {
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Could not update issue");
      await loadIssues();
    } catch (err) {
      setError(err.message || "Update failed");
    }
  }

  async function deleteIssue(id) {
    if (!window.confirm("Delete this issue?")) return;
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/issues/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete issue");
      await loadIssues();
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  }

  const counts = {
    total: issues.length,
    open: issues.filter((i) => i.status === "open").length,
    progress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
  };

  return (
    <main className="container">
      <header>
        <p className="eyebrow">ENGINEERING WORKSPACE</p>
        <h1>Issue Tracker</h1>
        <p className="subtitle">Track bugs, manage priorities, and keep development moving.</p>
      </header>

      <section className="stats">
        <article><span>Total loaded</span><strong>{counts.total}</strong></article>
        <article><span>Open</span><strong>{counts.open}</strong></article>
        <article><span>In progress</span><strong>{counts.progress}</strong></article>
        <article><span>Resolved</span><strong>{counts.resolved}</strong></article>
      </section>

      <section className="panel">
        <h2>Create an issue</h2>
        <form onSubmit={createIssue}>
          <label>Issue title
            <input required minLength={3} maxLength={200} value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Login API returns an error" />
          </label>
          <label>Description
            <textarea maxLength={5000} value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem..." />
          </label>
          <label>Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option><option value="medium">Medium</option>
              <option value="high">High</option><option value="critical">Critical</option>
            </select>
          </label>
          <button type="submit">Create issue</button>
        </form>
      </section>

      <section className="issues-section">
        <div className="section-heading">
          <h2>Issues</h2>
          <select aria-label="Filter issues by status" value={filter}
            onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option><option value="open">Open</option>
            <option value="in_progress">In progress</option><option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {error && <p className="error" role="alert">{error}</p>}
        {loading && <p>Loading issues...</p>}
        {!loading && !error && issues.length === 0 &&
          <p className="empty">No issues found. Create your first issue.</p>}

        <div className="issue-list">
          {issues.map((issue) => (
            <article className="issue-card" key={issue.id}>
              <div className="issue-main">
                <h3>#{issue.id} — {issue.title}</h3>
                <p>{issue.description || "No description provided."}</p>
                <div className="metadata">
                  <span className={`priority ${issue.priority}`}>{issue.priority}</span>
                  <span>{new Date(issue.created_at).toLocaleString()}</span>
                </div>
              </div>
              <div className="issue-actions">
                <select aria-label={`Status for issue ${issue.id}`} value={issue.status}
                  onChange={(e) => changeStatus(issue, e.target.value)}>
                  <option value="open">Open</option><option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option><option value="closed">Closed</option>
                </select>
                <button className="danger" onClick={() => deleteIssue(issue.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <footer>DevOps Lab · Issue Tracker</footer>
    </main>
  );
}