const express = require('express')
const NotesService = require('./notes-service')
const notesRouter = express.Router()
const jsonParser = express.json()
const path = require('path')
const xss = require('xss')
notesRouter.route('/').get((req,res,next)=>{
    NotesService.getAll(req.app.get('db'))
    .then(notes=>{
        res.json(notes)
    }).catch(next)
}).post(jsonParser,(req,res,next)=>{
    const { content, user_id} = req.body
    const newNote = { content, user_id }
    for (const [key, value] of Object.entries(newNote)){
      if (value == null){
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
    })}}
    NotesService.insertNote(
      req.app.get('db'),
      newNote
    )
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl,`/${note.id}` ) )
          .json(note)
      })
      .catch(next)
})

notesRouter.route('/:note_id')
.all((req,res,next)=>{
    const knexInstance = req.app.get('db')
    NotesService.getById(knexInstance,req.params.note_id)
    .then(note=>{
        if (!note){
            return res.status(404).json({
                error:{message: 'Note not exist'}
            })
        }
        res.note = note
        next()
    }).catch(next)})
    .get((req,res,next)=>{
        res.json({
            id:res.note.id,
            content: xss(res.note.content),
            liked:note.liked
        })
    }       
).delete((req,res,next)=>{
    NotesService.deleteById(req.app.get('db'),req.params.note_id)
    .then(()=>{
        res.status(204).json({message:'Note deleted'}).end()
    }).catch(next)
}).patch(jsonParser,(req,res,next)=>{
    const {content, user_id, liked} = req.body
    const noteToUpdate = {content, user_id, liked}
    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
      if (numberOfValues === 0) {
          return res.status(400).json({
              error:{message: `Request body must contain 'content'`}
          })
      }
    NotesService.updateNote(
        req.app.get('db'),
        req.params.note_id,
        noteToUpdate
        ).then(note => {
            res
              .status(200)
              .json(note)
          }).catch(next)
})

module.exports = notesRouter