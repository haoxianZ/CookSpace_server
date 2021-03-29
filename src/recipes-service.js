const recipesService = {
    getAll(knex){
        return knex('recipes').join('users','users.id','=','recipes.user_id').select('user_id','username','api_id','liked','comment','recipes.id')

    },
    insertRecipe(knex, newRecipe){
        return knex.insert(newRecipe).into('recipes').returning('*').then(rows => {return rows[0]})
    },
    getComments(knex, api_id){
        return knex('recipes').join('users','users.id','=','recipes.user_id').select('user_id','username','api_id','liked','comment','recipes.id').where('api_id', api_id)
    },
    getById(knex,id){
        return knex.select('*').from('recipes').where('id',id).first()
    },
    getRecipeforUser(knex, user_id){
        return knex.select('*').from('recipes').where('user_id', user_id)
    },
    deleteById(knex,id){
        return knex('recipes').where({id}).delete()
    },
    updateRecipe(knex,id, updateRecipe){
        return knex('recipes').where({id}).update(updateRecipe).returning('*').then(rows => {return rows[0]})
    },
    getRecipeOfTheDay(knex){
        return knex.select('*').from('recipe_of_the_day').then(rows => {return rows[0]})
    },
    updateRecipeOfTheDay(knex,id,newRecipe){
        return knex('recipe_of_the_day').where({id}).update({recipes: JSON.stringify(newRecipe)}).returning('*').then(rows => {return rows[0]})
    },
    getPopularRecipe(knex){
        return knex.select('*').from('popular_recipes')
    },
    insertPopularRecipe(knex, newRecipe){
        return knex.insert({recipe: JSON.stringify(newRecipe)}).into('popular_recipes').returning('*').then(rows => {return rows[0]})
    },

}
module.exports =  recipesService