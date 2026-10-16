import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertCircle, ArrowDownUp, CheckCircle2, CirclePlus, Clock3,
  Filter, Github, LayoutDashboard, LoaderCircle, RefreshCw, Search,
  ShieldAlert, Sparkles, Trash2, X
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const statusLabels = {
  open: "Open",
  "in-progress": "In progress",
  resolved: "Resolved",
};
const priorityLabels = { low: "Low", medium: "Medium", high: "High" };

function formatDate(value) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
}

function App() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium", status: "open", assignee: ""
  });

  const loadIssues = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/issues`);
      if (!response.ok) throw new Error("Could not load issues. Please try again.");
      const data = await response.json();
      setIssues(data);
      setApiOnline(true);
    } catch (err) {
      setApiOnline(false);
      setError(err.message || "Cannot connect to the API. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadIssues(); }, [loadIssues]);

  const stats = useMemo(() => ({
    total: issues.length,
    open: issues.filter((issue) => issue.status === "open").length,
    progress: issues.filter((issue) => issue.status === "in-progress").length,
    resolved: issues.filter((issue) => issue.status === "resolved").length,
  }), [issues]);

  const filteredIssues = useMemo(() => {
    const term = search.trim().toLowerCase();
    return issues.filter((issue) => {
      const matchesSearch = !term || [issue.title, issue.description, issue.assignee, issue.id]
        .some((value) => String(value || "").toLowerCase().includes(term));
      return matchesSearch
        && (statusFilter === "all" || issue.status === statusFilter)
        && (priorityFilter === "all" || issue.priority === priorityFilter);
    });
  }, [issues, search, statusFilter, priorityFilter]);

  async function createIssue(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create issue.");
      setIssues((current) => [data, ...current]);
      setForm({ title: "", description: "", priority: "medium", status: "open", assignee: "" });
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Could not create issue.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(issue, status) {
    try {
      const response = await fetch(`${API_BASE}/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update issue.");
      setIssues((current) => current.map((item) => item.id === issue.id ? data : item));
    } catch (err) {
      setError(err.message || "Could not update issue.");
    }
  }

  async function deleteIssue(issue) {
    if (!window.confirm(`Delete "${issue.title}"? This cannot be undone.`)) return;
    try {
      const response = await fetch(`${API_BASE}/issues/${issue.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Could not delete issue.");
      }
      setIssues((current) => current.filter((item) => item.id !== issue.id));
    } catch (err) {
      setError(err.message || "Could not delete issue.");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="IssueFlow home">
          <span className="brand-mark"><Activity size={21} strokeWidth={2.6} /></span>
          <span>issue<span className="brand-light">flow</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <button className="nav-item active"><LayoutDashboard size={18} /> Overview</button>
        <button className="nav-item" onClick={() => { setStatusFilter("open"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <AlertCircle size={18} /> Open issues <span className="nav-count">{stats.open}</span>
        </button>
        <button className="nav-item" onClick={() => setStatusFilter("in-progress")}><Clock3 size={18} /> In progress</button>
        <button className="nav-item" onClick={() => setStatusFilter("resolved")}><CheckCircle2 size={18} /> Resolved</button>
        <div className="sidebar-bottom">
          <div className="learning-card">
            <span className="learning-icon"><Sparkles size={17} /></span>
            <strong>DevOps learning lab</strong>
            <p>Build it, ship it, monitor it. Learn one step at a time.</p>
            <div className="learning-progress"><span /></div>
            <small>Day 1 of 10 · Developer app</small>
          </div>
          <div className="profile">
            <div className="avatar">DL</div>
            <div><strong>DevOps Learner</strong><small>Local workspace</small></div>
            <button className="icon-button profile-more" title="Workspace information" onClick={() => alert("IssueFlow local learning workspace")}>···</button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-right">
            <span className={`connection ${apiOnline ? "online" : "offline"}`}><span /> API {apiOnline ? "connected" : "disconnected"}</span>
            <button className="icon-button" title="Refresh issues" onClick={loadIssues}><RefreshCw size={17} /></button>
            <div className="avatar avatar-small">DL</div>
          </div>
        </header>

        <section className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> YOUR PROJECT WORKSPACE</div>
              <h1>Issue overview <span className="wave">✳</span></h1>
              <p className="page-subtitle">Track work, solve bugs, and keep your team moving forward.</p>
            </div>
            <button className="primary-button" onClick={() => setShowForm(true)}><CirclePlus size={18} /> Create issue</button>
          </div>

          {error && <div className="error-banner" role="alert"><ShieldAlert size={18} /><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}

          <div className="stats-grid">
            <StatCard label="Total issues" value={stats.total} note="All tracked work" icon={<LayoutDashboard size={19} />} tone="violet" />
            <StatCard label="Open" value={stats.open} note="Waiting to start" icon={<AlertCircle size={19} />} tone="orange" />
            <StatCard label="In progress" value={stats.progress} note="Currently being worked on" icon={<Clock3 size={19} />} tone="blue" />
            <StatCard label="Resolved" value={stats.resolved} note="Successfully completed" icon={<CheckCircle2 size={19} />} tone="green" />
          </div>

          <section className="issues-panel">
            <div className="panel-heading">
              <div><h2>All issues <span className="issue-count">{filteredIssues.length}</span></h2><p>Manage and prioritize your team's work.</p></div>
              <button className="secondary-button" onClick={loadIssues}><RefreshCw size={15} /> Refresh</button>
            </div>
            <div className="filters">
              <label className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search issues..." aria-label="Search issues" /></label>
              <label className="filter-select"><Filter size={15} /><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status"><option value="all">All statuses</option><option value="open">Open</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option></select></label>
              <label className="filter-select"><ArrowDownUp size={15} /><select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} aria-label="Filter by priority"><option value="all">All priorities</option><option value="high">High priority</option><option value="medium">Medium priority</option><option value="low">Low priority</option></select></label>
            </div>

            <div className="issue-table-wrap">
              <table className="issue-table">
                <thead><tr><th>ISSUE</th><th>PRIORITY</th><th>STATUS</th><th>ASSIGNEE</th><th>CREATED</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan="6" className="table-message"><LoaderCircle className="spin" size={22} /> Loading issues...</td></tr>
                    : filteredIssues.length === 0 ? <tr><td colSpan="6" className="table-message"><div className="empty-icon"><Search size={22} /></div><strong>No issues found</strong><span>Create an issue or change your filters.</span></td></tr>
                    : filteredIssues.map((issue) => (
                      <tr key={issue.id}>
                        <td className="issue-title-cell"><div className="issue-symbol">#</div><div><strong>{issue.title}</strong><small>{issue.id} · {issue.description || "No description provided"}</small></div></td>
                        <td><span className={`priority priority-${issue.priority}`}><span />{priorityLabels[issue.priority] || issue.priority}</span></td>
                        <td><select className={`status-pill status-${issue.status}`} value={issue.status} onChange={(e) => updateStatus(issue, e.target.value)} aria-label={`Update status for ${issue.title}`}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
                        <td><div className="assignee"><span className="assignee-avatar">{(issue.assignee || "U").trim().charAt(0).toUpperCase()}</span>{issue.assignee || "Unassigned"}</div></td>
                        <td className="date-cell">{formatDate(issue.createdAt)}</td>
                        <td><button className="delete-button" title={`Delete ${issue.title}`} onClick={() => deleteIssue(issue)}><Trash2 size={16} /></button></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="panel-footer"><span>Showing <strong>{filteredIssues.length}</strong> of <strong>{issues.length}</strong> issues</span><span className="footer-live"><span /> Live from your local API</span></div>
          </section>
          <footer className="page-footer"><span>IssueFlow <span className="footer-dot">·</span> Developer learning project</span><span><Github size={14} /> Built for your DevOps journey</span></footer>
        </section>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
        <section className="issue-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-heading"><div><span className="modal-kicker">NEW WORK ITEM</span><h2 id="modal-title">Create an issue</h2><p>Add the details so work can get moving.</p></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X size={19} /></button></div>
          <form onSubmit={createIssue}>
            <label className="form-label">Issue title <span>*</span><input autoFocus required maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Fix login page validation" /></label>
            <label className="form-label">Description<textarea maxLength={2000} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What needs to be done?" /></label>
            <div className="form-row">
              <label className="form-label">Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label>
              <label className="form-label">Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="open">Open</option><option value="in-progress">In progress</option><option value="resolved">Resolved</option></select></label>
            </div>
            <label className="form-label">Assignee<input maxLength={80} value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} placeholder="e.g. Uday (optional)" /></label>
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving && <LoaderCircle className="spin" size={16} />}{saving ? "Creating..." : "Create issue"}</button></div>
          </form>
        </section>
      </div>}
    </div>
  );
}

function StatCard({ label, value, note, icon, tone }) {
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></article>;
}

export default App;