const db = require('../../data/dbConfig')

async function findUser(username){
    return await db('users').where('username', username).first()
}

async function register(user){
    await db('users').insert(user)
    return findUser(user.username)
}


module.exports = {
    register,
    findUser
}