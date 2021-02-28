CREATE TABLE ingredients (
    ingredient_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id UUID REFERENCES users(id),
    ingredient TEXT 
);