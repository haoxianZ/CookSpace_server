CREATE TABLE event_attendance (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    attendee_id TEXT REFERENCES users(id),
    event_id INTEGER REFERENCES events(id)

);

