const router = require('express').Router();
const authModel = require('./auth-model')
const {validateUser, uniqueUser, login} = require('../middleware/auth-middleware')

router.post('/register', validateUser, uniqueUser, (req, res,next) => {
  authModel.register(req.newUser)
    .then(result => res.json(result))
    .catch(next)  
});

router.post('/login',validateUser, login, (req, res) => {
  res.status(200).send(req.userLoggedIn)
});

module.exports = router;
