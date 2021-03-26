ALTER TABLE users
ADD COLUMN bio TEXT,
ADD cooking_level TEXT,
ADD if not exists profile_pic TEXT
;
