const recipesService = {
    getAll(knex){
        return knex.select('*').from('recipes')
    },
    insertRecipe(knex, newRecipe){
        return knex.insert(newRecipe).into('recipes').returning('*').then(rows => {return rows[0]})
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
    }
}
module.exports =  recipesService