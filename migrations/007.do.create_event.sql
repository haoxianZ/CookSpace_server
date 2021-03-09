CREATE TABLE events (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    host_id UUID REFERENCES users(id),
    event_recipe_id JSON NOT NULL,
    event_date TEXT

);

