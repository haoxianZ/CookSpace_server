require('dotenv').config();
const express = require('express')
const eventsService = require('./events-service')
const { API_ENDPOINT, recipeSearchAPIid,recipeSearchAPIkey } = require('./config')
const eventsRouter = express.Router()
const jsonParser = express.json()
const path = require('path')
const xss = require('xss')
eventsRouter.route('/').get((req,res,next)=>{
    eventsService.getAll(req.app.get('db'))
    .then(events=>{
        res.json(events)
    }).catch(next)
}).post(jsonParser,(req,res,next)=>{
    const { event_recipe_id, host_id, event_date, event_name} = req.body
    const newEvent = { event_recipe_id, host_id,event_date,event_name }
    for (const [key, value] of Object.entries(newEvent)){
      if (value == null){
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
    })}}
    eventsService.insertEvent(
      req.app.get('db'),
      newEvent
    )
      .then(event => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl,`/${event.id}` ) )
          .json(event)
      })
      .catch(next)
})
eventsRouter.route('/:userid').get((req,res,next)=>{
    eventsService.getEventsForHost(req.app.get('db'),req.params.userid)
    .then(events=>{
        res.json(events)
    }).catch(next)
})


eventsRouter.route('/event/:event_id')
.all((req,res,next)=>{
    const knexInstance = req.app.get('db')
    eventsService.getById(knexInstance,req.params.event_id)
    .then(event=>{
        if (!event){
            return res.status(404).json({
                error:{message: 'Event not exist'}
            })
        }
        res.event = event
        next()
    }).catch(next)})
    .get((req,res,next)=>{
        res.json(res.event)
    }       
).delete((req,res,next)=>{
    eventsService.deleteById(req.app.get('db'),req.params.event_id)
    .then(()=>{
        res.status(204).json({message:'Event deleted'}).end()
    }).catch(next)
}).put(jsonParser,(req,res,next)=>{
    const {event_date, host_id, event_recipe_id,event_name} = req.body
    console.log(req.body)
    const eventToUpdate = {event_date, host_id, event_recipe_id,event_name}
    const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length
      if (numberOfValues === 0) {
          return res.status(400).json({
              error:{message: `Request body must contain content`}
          })
      }
    eventsService.updateEvents(
        req.app.get('db'),
        req.params.event_id,
        eventToUpdate
        ).then(recipe => {
            res
              .status(200)
              .json(recipe)
          }).catch(next)
})

module.exports = eventsRouter