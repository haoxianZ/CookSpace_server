const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')
const NotesService = require('../notes-service')
const usersRouter = express.Router()
const jsonParser = express.json()
const bcrypt = require('bcrypt')
const serializeUser = user =>({
    id: user.id,
    username:xss(user.username),
    email: xss(user.email),
    password:user.password,
    serialid:user.serialid
})

usersRouter.route('/').get((req,res,next)=>{
    const knexInstance = req.app.get('db')
    const username = req.query.username;
    const email = req.query.email;
    const password = req.query.password;
    if(username){
        UsersService.getByUsername(knexInstance,username)
    .then(user=>{
        console.log(user)
        if(!user){
            return res.status(401).json({
                error:{message:'Check you info again, it is case sensitive'}
            })
        }
        if(!bcrypt.compareSync(password,user.password)) {
            return res.status(401).json({
                error:{message:'Wrong Password'}
            })
        }
        res.json(serializeUser(user))})
    .catch(next)
    }
    else {UsersService.getAllUsers(knexInstance)
    .then(users=>{res.json(users.map(serializeUser))})
    .catch(next)}
    
}).post(jsonParser,async (req,res,next)=>{
    try{
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password,salt);
        console.log(salt, hashedPassword)
        const newUser = { username:req.body.username, email:req.body.email, password:hashedPassword };
        console.log(newUser)
        console.log(bcrypt.compareSync(req.body.password, hashedPassword))
        for(const [key,value] of Object.entries(newUser)){
        if(value == null){
            return res.status(400).json({
                error:{message:`Missing '${key}' in request body`}
            })
        };  
        UsersService.insertUser(req.app.get('db'), newUser)
    .then(user=>{
        res.status(201)
        .location(path.posix.join(req.originalUrl,`/${user.id}`))
        .json(serializeUser(user))
    }).catch(next)
    }
    }
catch{res.status(500).send()}    
})


usersRouter.route('/:user_id').all((req,res,next)=>{
    UsersService.getById(req.app.get('db'),
    req.params.user_id).then(user=>{
        if(!user){
            return res.status(404).json({
                error:{message:`User doesn't exist`}
            })
        }
        //validation by email


        res.user = user
        next()
    }).catch(next)
}).get((req,res,next)=>{
    res.json(serializeUser(res.user))
}).delete((req,res,next)=>{
    UsersService.deleteUser(req.app.get('db'),
    req.params.user_id).then(numRowsAffected=>{
        res.status(204).end()
    }).catch(next)
}).patch(jsonParser, (req,res,next)=>{
    const { username, email} = req.body
    const userToUpdate = { username, email }
    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if(numberOfValues ===0){
        return res.status(400).json({
            error:{message:'Request must contain username or email'}
        })
    }
    UsersService.updateUser(req.app.get('db'),req.params.user_id,userToUpdate)
    .then(numRowsAffected=>{
        res.status(204).end()
    }).catch(next)
})

usersRouter.route('/:user_id/notes').get((req,res,next)=>{
    NotesService.getNoteforUser(req.app.get('db'),req.params.user_id)
    .then(notes=>{
        res.json(notes)
    }).catch(next)
})

module.exports = usersRouter