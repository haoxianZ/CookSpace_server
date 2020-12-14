require('dotenv').config();

const crypto = require('crypto');


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
    serialid:user.serialid
})
const nodemailer = require('nodemailer');
const { user } = require('../config');
usersRouter.route('/').put(jsonParser,(req,res,next)=>{
    const username=req.body.username;
    const password=req.body.password;
    if(username){
        UsersService.getByUsername(req.app.get('db'),username)
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
    else res.status(404).json({
        error:{message:`User doesn't exist`}
    })
}).get((req,res,next)=>{
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

usersRouter.route('/forget-password').patch(jsonParser,(req,res,next)=>{
    const email =req.body.email;
    if(!email){
        return res.status(400).json({
            error:{message:`email is '${email}' in request body`}
        })
    }
    UsersService.getByEmail(req.app.get('db'),email)
    .then(async user=>{
        if(!user){
            return res.status(404).json({
                error:{message:`User doesn't exist`}
            })
        }
        const token=crypto.randomBytes(5).toString('hex');
        try{
            console.log(user)
            const salt = await bcrypt.genSalt();
            const hashedToken = await bcrypt.hash(token,salt);
            //should not store the code directly, run it through bcrypt
            const userToUpdate = {resetpasswordtoken:hashedToken}
            UsersService.updateUser(req.app.get('db'),user.id,userToUpdate)
            .then(numRowsAffected=>{
                res.status(204).end()
            }).catch(next);
            const transporter = nodemailer.createTransport({
                service:'gmail',
                auth:{
                    user:`${process.env.user}`,
                    pass:`${process.env.pass}`
                }
            });

            const mailOptions={
                from: `${process.env.user}`,
                to: user.email,
                subject: 'Code to reset Password',
                text:`Here is the Code to reset your password for 'What Should I Make' .\n\n`+
                `${token}`
            };
            transporter.sendMail(mailOptions,(err,resp)=>{
                if(err) console.error('there was an error',err)
                else{
                    console.log('response',resp)
                    res.status(200).json('recovery mail sent');
                }
            })
            
            
            next();
        }
        catch{res.status(500).send()}    

    }).catch(next)
});
usersRouter.route('/reset-password').get(jsonParser,(req,res,next)=>{
        const code =req.query.code;
        const user_id = req.query.user_id;
        console.log(code,user_id)
        UsersService.getById(req.app.get('db'),
            user_id).then(user=>{
                if(!user){
                    return res.status(404).json({
                          error:{message:`User doesn't exist`}
                    })
                }
                if(!bcrypt.compareSync(code, user.resetpasswordtoken)){
                       return res.status(401).json({
                            error:{message:`Reset code does not match`}
                        })
                }
                res.status(200).json(serializeUser(user));
            })
}).patch(jsonParser,async (req,res,next)=>{
    try{
        const user_id=req.body.user_id;
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password,salt);
        console.log(salt, hashedPassword)
        const updateUser = { password:hashedPassword, resetpasswordtoken:null };
        console.log(updateUser)

        UsersService.updateUser(req.app.get('db'), user_id,updateUser)
    .then(numRowsAffected=>{
        res.status(204).end()
    }).catch(next)
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