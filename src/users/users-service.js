const UsersService = {
    getAllUsers(knex) {
      return knex.select('*').from('users')
    },
  
    insertUser(knex, newUser) {
      return knex
        .insert(newUser)
        .into('users')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    insertUserFriend(knex, newFriend) {
      return knex
        .insert(newFriend)
        .into('friends')
        .returning('*')
    },
    getById(knex, id) {
      return knex
        .from('users')
        .select('*')
        .where('id', id)
        .first()
    },
    getByserialId(knex, id) {
      return knex
        .from('users')
        .select('*')
        .where('serialid', id)
        .first()
    },
    getByEmail(knex,email){
      return knex
      .from('users')
      .select('*')
      .where('email', email)
      .first()
    },
    getByUsername(knex, username) {
      return knex.from('users').select('*')
      .where('username','like',username)
      .first()
    },
    deleteUser(knex, id) {
      return knex('users')
        .where({ id })
        .delete()
    },
    deleteUserFriend(knex,id){
      return knex('friends').where('friend_id',id).delete()
  },
    updateUser(knex, id, newUserFields) {
      return knex('users')
        .where({id})
        .update(newUserFields)
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
    getUserFriends(knex,id){
      return knex('friends').join('users','users.id','=','friends.friends').select('friends','email','username').where('friends.user_id',id).distinctOn('friends')
    },
    getUserBookmarks(knex,user_id){
      return knex.from('bookmarks').select('*').where('user_id',user_id)
    },
    getABookmark(knex,id){
      return knex.from('bookmarks').select('*').where('bookmakr_id',id)
    },
    insertBookmarks(knex, newRecipe){
      return knex.insert(newRecipe).into('bookmarks').returning('*').then(rows => {return rows[0]})
  },
  deleteBookmarks(knex,id){
      return knex('bookmarks').where('bookmakr_id',id).delete()
  },
  updateBookmarks(knex,id, updateBookmarks){
      return knex('bookmarks').where('bookmakr_id',id).update(updateBookmarks).returning('*').then(rows => {return rows[0]})
  },
    getUserIngredients(knex,id){
      return knex.from('ingredients').select('*').where('user_id',id)
    },
    
    insertIngredients(knex, newIngredient){
      return knex.insert(newIngredient).into('ingredients').returning('*').then(rows => {return rows[0]})
  },
  deleteIngredients(knex,id){
      return knex('ingredients').where('ingredient_id',id).delete()
  },
  updateRecipe(knex,id, updateIngredient){
      return knex('ingredients').where('ingredient_id',id).update(updateIngredient).returning('*').then(rows => {return rows[0]})
  }
  }
  
  module.exports = UsersService