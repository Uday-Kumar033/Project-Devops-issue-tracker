CREATE TABLE IF NOT EXISTS issues (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(120) NOT NULL CHECK (length(trim(title)) > 0),
    description VARCHAR(2000) NOT NULL DEFAULT '',
    priority VARCHAR(10) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),
    status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in-progress', 'resolved')),
    assignee VARCHAR(80) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issues_created_at ON issues (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues (status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues (priority);

INSERT INTO issues (title, description, priority, status, assignee)
SELECT 'Set up CI pipeline', 'Create a workflow to run tests on every pull request.', 'high', 'in-progress', 'DevOps team'
WHERE NOT EXISTS (SELECT 1 FROM issues);

INSERT INTO issues (title, description, priority, status, assignee)
SELECT 'Document local setup', 'Write steps for running the frontend, API, and database.', 'medium', 'open', 'Uday'
WHERE (SELECT COUNT(*) FROM issues) = 1;