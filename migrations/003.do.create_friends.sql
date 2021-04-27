CREATE TABLE friends (
    friend_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    friends TEXT REFERENCES users(id) ON DELETE CASCADE NOT NULL
);