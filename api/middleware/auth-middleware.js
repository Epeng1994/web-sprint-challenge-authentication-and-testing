const db = require('../../data/dbConfig')
const authModel = require('../auth/auth-model')
const bcrypt = require('bcryptjs')
const secret = require('../auth/secrets')
const jwt = require('jsonwebtoken')
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
  
async function validateUser(req,res,next){
    const {username, password} = req.body //destructure variables
    if(username === undefined || username.trim() === '' || typeof username.trim() !== 'string' || password === undefined || password.trim() === ''){
        next({status:400, message:"username and password required"})
        return
    }else{
        next()
    } //check for valid entries
}

async function uniqueUser(req,res,next){
    const {username, password} = req.body
    const check = await db('users').where({username})
    if(check.length > 0){
        next({status:400, message:"username taken"})
        return
    }else{ //return new user under req.newUser
        req.newUser = {
            username:username,
            password: bcrypt.hashSync(password, 12) //hash password
        }
        next()
    }
}

/*
IMPLEMENT
You are welcome to build additional middlewares to help with the endpoint's functionality.

1- In order to log into an existing account the client must provide `username` and `password`:
    {
    "username": "Captain Marvel",
    "password": "foobar"
    }

2- On SUCCESSFUL login,
    the response body should have `message` and `token`:
    {
    "message": "welcome, Captain Marvel",
    "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
    }

3- On FAILED login due to `username` or `password` missing from the request body,
    the response body should include a string exactly as follows: "username and password required".

4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
    the response body should include a string exactly as follows: "invalid credentials".
*/

async function login(req,res,next){
    const {username, password} = req.body
    const userCheck = await authModel.findUser(username)
    if(userCheck == null || bcrypt.compareSync(password, userCheck.password) === false){
        next({status:401, message: "invalid credentials"})
        return
    }else{
        const token = generateToken(username)
        req.userLoggedIn = {
            message: `welcome, ${username}`,
            token: token
        }
        next()
    }
}

function generateToken(user){ //generate token upon valid login
    //payload, secret, options
    const payload = {
        subject: user.user_id, 
        username: user.username
    }
    const options = {
        expiresIn: '1d'
    }
    return jwt.sign(payload, secret, options)
}

module.exports = {
    validateUser, uniqueUser, login
}   