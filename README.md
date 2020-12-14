# What Should I Make?

An app that allows you to write some encouragement for others and in exchange you receive a note from others. 

## Motivation

I tend to just buy what is on sale from the supermarket, so sometime I ends up with ingredients I don't really know what to do with. Now I can find new recipes for myself and try them!

## Screenshots
Examples:

![Example](./ScreenshotHomepage.png)

![Example](./ScreenshotUserpage.png)

## Features

* Log and update what is in your fridge
* select combinaions of ingredients and perform recipes search
* filter result with different filters 

## Demo

- [Live Demo](https://what-should-i-make-client.vercel.app/)

## API endpoint

- [Link](https://fast-scrubland-35677.herokuapp.com)

## Schema

### User

```js
{"id":"2000effb-903f-4a57-9c02-b91ba825b509","username":"testa","email":"test1@test.com","serialid":1}
```

### Note

```js
{"id":3,"content":"pork","user_id":1}
```
## API Overview

```text
/
.
├── /users
│   └── GET
│   └── GET /:id
│   └── DELETE /:id
│   └── GET /reset-password
│   └── PATCH /reset-password
│   └── PATCH /forget-password
│   └── POST
│   └── PUT
│ 
├── /notes
│   └── GET
│   └── GET /:id    
│   └── Post
│   └── Patch /:id
│   └── Delete /:id
│    
```
### GET `/users/:id` or `/notes/:id`

```js
// req.params
{
  id: ID
}
```
### DELETE `/users/:id` or `/notes/:id`

```js
// req.params
{
  id: ID
}
```
### PUT `/users`

```js
// req.body
{
  password: String,
  username: String
}

// res.body
{
  id: uuid,
  email: String,
  username: String,
  serialid: integer
}
```
### POST `/users`

```js
// req.body
{
  password: String,
  username: String
}

// res.body
{
  id: uuid,
  email: String,
  username: String,
  serialid: integer
}
```
### PATCH `/users/forget-password`

```js
// req.body
{
  email: String
}

// res.body
{
  'recovery mail sent'
}
```
### GET `/users/reset-password`

```js
//req.body
{
  user_id: string
}

```
### PATCH `/users/reset-password`

```js
//res.query
{
  code: string,
  user_id, string
}
// res.body
{
  id: uuid,
  email: String,
  username: String,
  serialid: integer
}
```
### POST `/notes`

```js
// req.body
{
  content: String,
  user_id: Integer
}

// res.body
{
  id: uuid,
  content: String,
  user_id: Integer,
}
```
## Built With

* HTML
* CSS
* Postgres
* Express
* React
* Node

## Author

* **Haoxian Zhang** 