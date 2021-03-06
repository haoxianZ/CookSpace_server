const eventsService = {
    getAll(knex){
        return knex.select('*').from('events')
    },
    insertEvent(knex, newEvent){
        return knex.insert(newEvent).into('events').returning('*').then(rows => {return rows[0]})
    },
    getById(knex,id){
        return knex('events').join('users','users.id','=','events.host_id').select('events.id','event_recipe_id','event_date','event_name','users.username','host_id').where('events.id',id).then(rows => {return rows[0]})
    },
    getEventsForHost(knex, host_id){
        return knex.select('*').from('events').where('host_id', host_id).whereNot('event_date','=','')
    },
    deleteById(knex,id){
        return knex('events').where({id}).delete()
    },
    updateEvents(knex,id, updateEvents){
        return knex('events').where({id}).update(updateEvents).returning('*').then(rows => {return rows[0]})
    }
}
module.exports =  eventsService