const NotesService = {
    getAll(knex){
        return knex.select('*').from('notes')
    },
    insertNote(knex, newNote){
        return knex.insert(newNote).into('notes').returning('*').then(rows => {return rows[0]})
    },
    getById(knex,id){
        return knex.select('*').from('notes').where('id',id).first()
    },
    getNoteforUser(knex, user_id){
        return knex.select('*').from('notes').where('user_id', user_id)
    },
    deleteById(knex,id){
        return knex('notes').where({id}).delete()
    },
    updateNote(knex,id, updateNote){
        return knex('notes').where({id}).update(updateNote).returning('*').then(rows => {return rows[0]})
    }
}
module.exports =  NotesService