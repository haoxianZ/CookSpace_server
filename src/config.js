require('dotenv').config()
module.exports = {
  PORT: process.env.PORT || 8000,
  user:process.env.user,
  pass:process.env.pass,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
  API_ENDPOINT:process.env.API_ENDPOINT,
  recipeSearchAPIid:process.env.recipeSearchAPIid,
  recipeSearchAPIkey:process.env.recipeSearchAPIkey,
}

