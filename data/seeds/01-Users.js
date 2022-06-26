const db = require('../dbConfig')

exports.seed = async function(knex) {
  // Deletes ALL existing entries
  return db('users').truncate()
    .then(()=>{
      return db('users').insert([
        {
          username:'Eric',
          password:'$2a$12$dHPdn6kQUKFj70bvTFa1aODXDkjLASo1bEPaG55x6TeEmk4FoxWLq'
        }
      ])
    })
};
