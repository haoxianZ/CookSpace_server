CREATE TABLE recipe_of_the_day (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    recipes JSON
);

INSERT INTO recipe_of_the_day (recipes)
VALUES ('{}')