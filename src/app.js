
require('dotenv').config();
const cron = require('node-cron')
const fetch = require('node-fetch')
const recipesService = require('./recipes-service')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const recipesRouter = require('./recipes-router')
const app = express()
const usersRouter = require('./users/users-router')
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
app.use(helmet())
app.use(cors());
app.get('/', (req, res) => {
       res.send('Hello, world!')
     })


const morganOption = (NODE_ENV === 'production')? 'tiny': 'common';
var session = require("express-session"),
    bodyParser = require("body-parser");
const { json } = require('body-parser');
const eventsRouter = require('./events-router');

app.use(express.static("public"));
app.use(session({ secret: "thinkfulProject" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
app.post('/login', (req, res) =>{
  passport.authenticate('local', { successRedirect: '/',
  failureRedirect: '/login'})
  console.log('running')
}
  
);
cron.schedule('0 11 * * *', function() {
  console.log('running a task every minute');
  const requestOptions = {
    method: 'GET'
  };
  fetch("https://api.spoonacular.com/recipes/random?number=1&apiKey=98357eb101bf42e59128466b70bf6fea", requestOptions)
  .then(response => response.json())
  .then(result => {console.log(result) 
    recipesService.updateRecipeOfTheDay(app.get('db'),1,result)
    if(result.veryPopular){
      console.log(result,'popular one')
      recipesService.insertPopularRecipe(app.get('db'),result)
    }
  })
  .catch(error => console.log('error', error));
});

cron.schedule('0 11 * * *', function() {
  const requestOptions = {
    method: 'GET'
  };
  fetch("https://api.spoonacular.com/recipes/random?number=10&apiKey=98357eb101bf42e59128466b70bf6fea", requestOptions)
  .then(response => response.json())
  .then(results => {
    results.recipes.forEach(result=>{

      if(result.veryPopular){
        console.log(result,'popular one')
        recipesService.insertPopularRecipe(app.get('db'),result)
      }
      })

    }) 
  .catch(error => console.log('error', error));
});
app.use('/recipes',recipesRouter)
app.use('/users', usersRouter)
app.use('/events', eventsRouter )
var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: '178221624097174',
    clientSecret: '202997af919fa1683855dd25479d3113',
    callbackURL: "http://www.example.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // User.findOrCreate(..., function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
  }
));
// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/login' }));
app.use(morgan(morganOption))
app.use(function errorHandler(error, req, res, next) {
         let response
         if (process.env.NODE_ENV === 'production') {
           response = { error: { message: 'server error' } }
         } else {
           console.error(error)
           response = { message: error.message, error }
         }
         res.status(500).json(response)
       })
app.get('/xss', (req, res) => {
        res.cookie('secretToken', '1234567890');
        res.sendFile(__dirname + '/xss-example.html');
      });
module.exports = app
