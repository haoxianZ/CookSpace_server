require('dotenv').config();
const express = require('express')
const recipesService = require('./recipes-service')
const { API_ENDPOINT, recipeSearchAPIid,recipeSearchAPIkey } = require('./config')
const recipesRouter = express.Router()
const jsonParser = express.json()
const path = require('path')
const xss = require('xss')
recipesRouter.route('/').get((req,res,next)=>{
    recipesService.getAll(req.app.get('db'))
    .then(recipes=>{
        res.json(recipes)
    }).catch(next)
}).post(jsonParser,(req,res,next)=>{
    const { api_id,comment,liked, user_id} = req.body
    const newRecipe = { api_id,comment,liked, user_id }
    for (const [key, value] of Object.entries(newRecipe)){
      if (value == null){
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
    })}}
    recipesService.insertRecipe(
      req.app.get('db'),
      newRecipe
    )
      .then(recipe => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl,`/${recipe.id}` ) )
          .json(recipe)
      })
      .catch(next)
})

recipesRouter.route('/recipeOfTheDay').get((req,res,next)=>{
    recipesService.getRecipeOfTheDay(req.app.get('db')).
    then(recipe=>{
        res.status(200).json(recipe)

    })
})
recipesRouter.route('/popularRecipes').get((req,res,next)=>{
    recipesService.getPopularRecipe(req.app.get('db')).
    then(recipes=>{
        res.status(200).json(recipes)

    })
})
const serializeinfo = {
    spoonApi:process.env.spoonAPI
}
recipesRouter.route('/api').get((req,res,next)=>{
    res.status(200).json(serializeinfo)
})


recipesRouter.route('/:recipe_id')
.all((req,res,next)=>{
    const knexInstance = req.app.get('db')
    recipesService.getById(knexInstance,req.params.recipe_id)
    .then(recipe=>{
        if (!recipe){
            return res.status(404).json({
                error:{message: 'Recipe not exist'}
            })
        }
        res.recipe = recipe
        next()
    }).catch(next)})
    .get((req,res,next)=>{
        res.json({
            id:res.recipe.id,
            content: xss(res.recipe.content),
            liked:recipe.liked
        })
    }       
).delete((req,res,next)=>{
    recipesService.deleteById(req.app.get('db'),req.params.recipe_id)
    .then(()=>{
        res.status(204).json({message:'Recipe deleted'}).end()
    }).catch(next)
}).patch(jsonParser,(req,res,next)=>{
    const {content, user_id, liked} = req.body
    const recipeToUpdate = {content, user_id, liked}
    const numberOfValues = Object.values(recipeToUpdate).filter(Boolean).length
      if (numberOfValues === 0) {
          return res.status(400).json({
              error:{message: `Request body must contain 'content'`}
          })
      }
    recipesService.updateRecipe(
        req.app.get('db'),
        req.params.recipe_id,
        recipeToUpdate
        ).then(recipe => {
            res
              .status(200)
              .json(recipe)
          }).catch(next)
})
recipesRouter.route('/:api_id/comment').get((req,res,next)=>{
    const knexInstance = req.app.get('db')
    recipesService.getComments(knexInstance,req.params.api_id)
    .then(comment=>{
        if (!comment){
            return res.status(404).json({
                error:{message: 'comment not exist'}
            })
        }
        console.log(comment)
        res.status(200).json(comment)
    }).catch(next)
})
module.exports = recipesRouter