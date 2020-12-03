const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeNotesArray } = require('./notes.fixtures')
const { makeUsersArray } = require('./users.fixtures')

describe('Notes Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE notes, users, liked_notes, notes_creators RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE notes, users, liked_notes, notes_creators RESTART IDENTITY CASCADE'))

  describe(`GET /notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/notes')
          .expect(200, [])
      })
    })

    context('Given there are notes in the database', () => {
      const testNotes = makeNotesArray()
      const testUsers = makeUsersArray();

      beforeEach('insert notes', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {return db
          .into('notes')
          .insert(testNotes)} 
      )})

      it('responds with 200 and all of the notes', () => {
        return supertest(app)
          .get('/notes')
          .expect(200, testNotes)
      })
    })
  })

  describe(`GET /notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const articleId = 123456
        return supertest(app)
          .get(`/notes/${articleId}`)
          .expect(404, { error: { message: `Note not exist` } })
      })
    })

    context('Given there are notes in the database', () => {
      const testUsers = makeUsersArray();
      const testNotes = makeNotesArray();
      
      beforeEach('insert notes', () => {
        return db
          .into('users')
          .insert(testUsers)
          .then(() => {return db
          .into('notes')
          .insert(testNotes)} 
      )
      })

      it('responds with 200 and the specified article', () => {
        const articleId = 2
        const expectedNote = testNotes[articleId - 1]
        return supertest(app)
          .get(`/notes/${articleId}`)
          .expect(200, expectedNote)
      })
    })
    context(`Given an XSS attack note`, () => {
      const testUsers = makeUsersArray();
      const testNotes = makeNotesArray();
           const maliciousNote = {
             id: 911,
             content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
           }
      
           beforeEach('insert malicious note', () => {
            return db
            .into('users')
            .insert(testUsers)
            .then(() => {return db
            .into('notes')
            .insert(maliciousNote)} 
        )
           })
      
           it('removes XSS attack content', () => {
             return supertest(app)
               .get(`/notes/${maliciousNote.id}`)
               .expect(200)
               .expect(res => {
                 expect(res.body.content).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
               })
           })
    })
  })

  describe('Post /notes',()=>{
    const testUsers = makeUsersArray();
    beforeEach('insert malicious note', () => {
      return db
        .into('users')
        .insert(testUsers)
    })
  it('creastes an article and respond it',()=>{
    this.retries(3)
    const newNote = {
      content:'testing new article'
    }
    return supertest(app).post('/notes')
    .send(newNote).expect(201).expect(res=>{
      expect(res.body.content).to.eql(newNote.content)
      expect(res.body).to.have.property('id')
      expect(res.headers.location).to.eql(`/notes/${res.body.id}`)
    }).then(postRes=>
      supertest(app).get(
        `/notes/${postRes.body.id}`
      ).expect(postRes.body))
  })
  const requiredFileds = ['content' ]
  requiredFileds.forEach(field=>{
    const newNote = {
      content:'testing new note'
    }
  it(`respond with 400 error when miss a field`,()=>{
    delete newNote[field]
    return supertest(app).post('/notes')
    .send(newNote).expect(400,{error: {message:`Missing '${field}' in request body`}})
  })  
  })
})

describe(`Delete /notes/:note_id`,()=>{
  context('Given there are notes',()=>{
    const testUsers = makeUsersArray();
    const testNotes = makeNotesArray()
    beforeEach('insert notes', () => {
      return db
        .into('users')
        .insert(testUsers)
        .then(() => {
          return db
            .into('notes')
            .insert(testNotes)
        })
    })
    it('respond with 204 and remove',()=>{
      const idRemove = 2;
      const expectNotes = testNotes.filter(note=> note.id !==idRemove)
      return supertest(app).delete(`/notes/${idRemove}`)
      .expect(204).then(res=> supertest(app).get('/notes').expect(expectNotes))
    })
    })
    
  })
  context('Given no note',()=>{
    it('respond with 404',()=>{
      return supertest(app).delete('/notes/123')
      .expect(404,{error:{message:'Note not exist'}})
    })
  })

  describe(`PATCH /notes/:note_id`,()=>{
    context('Given no note',()=>{
      it('respond with 404',()=>{
        const articleId = 123456
        return supertest(app).patch(`/notes/${articleId}`)
        .expect(404, {error:{message: 'Note not exist'}})
  
      })
    })
    context('Given there is data',()=>{
      const testUsers = makeUsersArray();
      const testNotes = makeNotesArray()
      beforeEach('insert notes', () => {
        return db
            .into('users')
            .insert(testUsers)
            .then(() => {
              return db
                .into('notes')
                .insert(testNotes)
            })
      })
      it('respond with 204 and remove',()=>{
        const idUpdated = 2;
        const updateNote={
          content: 'test'
        }
        //not understand line187-189, tgat replace the target?
        const expectedNote = {
          ...testNotes[idUpdated-1],
          ...updateNote
        }
        return supertest(app).patch(`/notes/${idUpdated}`)
        .send(updateNote).expect(204)
        .then(res=> supertest(app).get(`/notes/${idUpdated}`)
        .expect(expectedNote))
      })
      it('respond with 400 when required field is missing',()=>{
        const idToUpdate = 2
        return supertest(app).patch(`/notes/${idToUpdate}`)
        .send({ irrelevantField: 'foo' }).expect(400, 
        {error:
          {message: `Request body must contain 'content'`}
        }
      )
    })
    it(`responds with 204 when updating only a subset of fields`, () => {
            const idToUpdate = 2
            const updateNote = {
              content: 'updated article title',
            }
            const expectedNote = {
              ...testNotes[idToUpdate - 1],
              ...updateNote
            }
      
            return supertest(app)
              .patch(`/notes/${idToUpdate}`)
              .send({
                ...updateNote,
                fieldToIgnore: 'should not be in GET response'
              })
              .expect(204)
              .then(res =>
                supertest(app)
                  .get(`/notes/${idToUpdate}`)
                  .expect(expectedNote)
              )
          })
  })
  })
  
})
