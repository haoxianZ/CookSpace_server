require('dotenv').config();

const crypto = require('crypto');
const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')
const recipesService = require('../recipes-service')
const usersRouter = express.Router()
const jsonParser = express.json()
const bcrypt = require('bcrypt')
const serializeUser = user =>({
    id: user.id,
    username:xss(user.username),
    email: xss(user.email),
    serialid:user.serialid,
    bio: xss(user.bio),
    cooking_level: xss(user.cooking_level),
    profile_pic:xss(user.profile_pic)
})
const nodemailer = require('nodemailer');
const { user } = require('../config');


usersRouter.route('/login').post((req, res) =>{
    console.log('being called')

  passport.authenticate('local', function(req, res) {
      console.log('log in')
    const username=req.user.username
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    if(username){
        UsersService.getByUsername(req.app.get('db'),username)
        .then(user=>{
            res.json(serializeUser(user))
        })
    }
  })

}
  
);
usersRouter.route('/').get(jsonParser,(req,res,next)=>{
    UsersService.getAllUsers(req.app.get('db')).then(users=>{
        res.json(users)
    })
}).put(jsonParser,(req,res,next)=>{
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
}).post(jsonParser, (req,res,next)=>{
        UsersService.getByEmail(req.app.get('db') ,req.body.email).then(async user=>{
        if(user){
            return res.status(405).json({
            error:{message:`You have signed up with this email`}
        })
        }
            try{

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password,salt);
        console.log(salt, hashedPassword)
        let newUser = { username:req.body.username, email:req.body.email, password:hashedPassword };
        console.log(newUser)
        console.log(bcrypt.compareSync(req.body.password, hashedPassword))
        for(const [key,value] of Object.entries(newUser)){
        if(value == null){
            return res.status(400).json({
                error:{message:`Missing '${key}' in request body`}
            })
        };
        const token=crypto.randomBytes(3).toString('hex');
        const salt = await bcrypt.genSalt();
                const hashedToken = await bcrypt.hash(token,salt);
                //should not store the code directly, run it through bcrypt

        newUser = { username:req.body.username,
            verification_token:hashedToken, 
            email:req.body.email, password:hashedPassword, bio:req.body.bio, 
            cooking_level:req.body.cooking_level, profile_pic:req.body.profile_pic };

        UsersService.insertUser(req.app.get('db'), newUser)
    .then(user=>{
        const email =user.email;
        UsersService.getByEmail(req.app.get('db'),email)
        .then(async user=>{
            if(!user){
                return res.status(404).json({
                    error:{message:`User doesn't exist`}
                })
            }
            try{
                console.log(user)
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
                    subject: 'Verification Code',
                    text:`Here is the code to verify your email.\n\n`+
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
        res.status(201)
        .location(path.posix.join(req.originalUrl,`/${user.id}`))
        .json(serializeUser(user))
    }).catch(next)
    }
    }
catch{res.status(500).send()}  

        })
  
})

usersRouter.route('/forget-password').put(jsonParser,(req,res,next)=>{
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
        const token=crypto.randomBytes(3).toString('hex');
        try{
            console.log(user)
            const salt = await bcrypt.genSalt();
            const hashedToken = await bcrypt.hash(token,salt);
            //should not store the code directly, run it through bcrypt
            const userToUpdate = {resetpasswordtoken:hashedToken}
            UsersService.updateUser(req.app.get('db'),user.id,userToUpdate)
            .then(user=>{
                res.status(200).json(user)
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
                text:`Here is the Code to reset your password for your CookSpace account.\n\n`+
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
usersRouter.route('/verify').get(jsonParser,(req,res,next)=>{
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
            if(!bcrypt.compareSync(code, user.verification_token)){
                   return res.status(401).json({
                        error:{message:`Verification code does not match`}
                    })
            }
            res.status(200).json(serializeUser(user));
        })
})
usersRouter.route('/reset-password').get(jsonParser,(req,res,next)=>{
        const code =req.query.code;
        const user_id = req.query.user_id;
        console.log(code,user_id)
        UsersService.getById(req.app.get('db'),
            user_id).then(user=>{
                if(!user){
                    console.log(user)
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
}).put(jsonParser,async (req,res,next)=>{
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
    const { username, email, cooking_level, bio, profile_pic} = req.body
    let userToUpdate = { username, email }
    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if(numberOfValues ===0){
        return res.status(400).json({
            error:{message:'Request must contain username or email'}
        })
    }
    userToUpdate={ username, email, cooking_level, bio, profile_pic}
    UsersService.updateUser(req.app.get('db'),req.params.user_id,userToUpdate)
    .then(numRowsAffected=>{
        res.status(204).end()
    }).catch(next)
})

usersRouter.route('/:user_id/notes').get((req,res,next)=>{
    recipesService.getNoteforUser(req.app.get('db'),req.params.user_id)
    .then(notes=>{
        res.json(notes)
    }).catch(next)
})

usersRouter.route('/:user_id/friends').get((req,res,next)=>{
    UsersService.getUserFriends(req.app.get('db'),req.params.user_id)
    .then(friends=>{
        res.json(friends)
    }).catch(next)
}).post(jsonParser,(req,res,next)=>{
    UsersService.getByUsername(req.app.get('db'),req.body.username).then(
        user=>{
            if(!user){
                return res.status(401).json({
                    error:{message:'Check you info again, it is case sensitive'}
                })
            }
            return user
        }
    ).then(user=>{
    const friend= serializeUser(user)
    const newFriend = {user_id:req.body.user_id, friends:friend.serialid};
    for(const [key,value] of Object.entries(newFriend)){
    if(value == null){
        return res.status(400).json({
            error:{message:`Missing '${key}' in request body`}
        })
    };  
    UsersService.insertUserFriend(req.app.get('db'), newFriend)
.then(friend=>{
    UsersService.getUserFriends(req.app.get('db'),friend.user_id)
    .then(friends=>{
        res.json(friends).status(201)
    })
    
}).catch(next)
}
    })

})
usersRouter.route('/:user_id/friends/:friend_id').delete((req,res,next)=>{
    const deleteFriend = req.params.friend_id;
    console.log(deleteFriend)
    UsersService.deleteUserFriend(req.app.get('db'),deleteFriend)
    .then(numRowsAffected=>{
        res.status(204).end()
    }).catch(next)
})
usersRouter.route('/:user_id/bookmarks').get((req,res,next)=>{
    UsersService.getUserBookmarks(req.app.get('db'),req.params.user_id)
    .then(bookmarks=>{
        res.json(bookmarks)
    }).catch(next)
}).post(jsonParser,(req,res,next)=>{
    const newBookmark = {user_id:req.body.user_id, api_recipe:req.body.api_recipe};
    for(const [key,value] of Object.entries(newBookmark)){
    if(value == null){
        return res.status(400).json({
            error:{message:`Missing '${key}' in request body`}
        })
    };}
    UsersService.insertBookmarks(req.app.get('db'), newBookmark)
.then(recipe=>{
    res.status(201)
    .json({api_recipe:recipe})
})
.catch(next)

})
usersRouter.route('/:user_id/bookmarks/:bookmark_id').delete((req,res,next)=>{
    const deleteRecipe = req.params.bookmark_id;

    UsersService.deleteBookmarks(req.app.get('db'),deleteRecipe)
    .then(numRowsAffected=>{
        res.status(204).end()
    }).catch(next)
})

usersRouter.route('/:user_id/ingredients').get((req,res,next)=>{
    UsersService.getUserIngredients(req.app.get('db'),req.params.user_id)
    .then(ingredients=>{
        res.json(ingredients)
    }).catch(next)
}).post(jsonParser,(req,res,next)=>{
    const newIngredient = {user_id:req.params.user_id, ingredient:req.body.ingredient};
    for(const [key,value] of Object.entries(newIngredient)){
    if(value == null){
        return res.status(400).json({
            error:{message:`Missing '${key}' in request body`}
        })
    };  }
    UsersService.insertIngredients(req.app.get('db'), newIngredient)
.then(ingredient=>{
    res.status(201)
    .json({ingredient:ingredient})
}).catch(next)

})
usersRouter.route('/:user_id/ingredients/:ingredient_id').delete((req,res,next)=>{
    const deleteIngredient = req.params.ingredient_id;

    UsersService.deleteIngredients(req.app.get('db'),deleteIngredient).then(numRowsAffected=>{
        res.status(204).end()
    }).catch(next)
})


module.exports = usersRouter