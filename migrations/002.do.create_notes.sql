CREATE TABLE recipes  (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    api_id TEXT,
    comment TEXT,
    Liked INTEGER,
    user_id UUid REFERENCES users(id) ON DELETE CASCADE
);