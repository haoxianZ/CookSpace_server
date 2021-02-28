CREATE EXTENSION IF NOT EXISTS pgcrypto ;

CREATE TABLE users (
        serialid INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY UNIQUE,
        id UUID  UNIQUE DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        email TEXT,
        password TEXT,
        resetPasswordToken TEXT
);
