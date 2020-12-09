require('dotenv').config()
module.exports = {
  PORT: process.env.PORT || 8000,
  user:process.env.user,
  pass:process.env.pass,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL ||'postgres://akjnomghadmqke:95ff7414d603b551503af49d212df1d9e44bf270e8ec84459530b89f1406edda@ec2-54-163-47-62.compute-1.amazonaws.com:5432/dc22p045vlhe00',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin@localhost/WhatMake'
}

