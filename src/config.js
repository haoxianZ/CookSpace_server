require('dotenv').config()
module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL ||'postgres://yhzksdvxtvaagw:0359c3f00f14ebe5c73dce97b4ff0e4d5e6c138d87585feda599f2f6f4f0b3ef@ec2-54-160-18-230.compute-1.amazonaws.com:5432/d87ktv3fnv548u'
}
