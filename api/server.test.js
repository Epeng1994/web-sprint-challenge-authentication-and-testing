// Write your tests here
const request = require('supertest')
const db = require('../data/dbConfig')
const server = require('./server')
const jwt = require('jsonwebtoken')
const authmodel = require('./auth/auth-model')
const secret = require('./auth/secrets')
const bcrypt = require('bcryptjs')

beforeAll(async()=>{
  await db.migrate.rollback()
  await db.migrate.latest()
  jest.setTimeout(10 * 1000)
})

beforeEach(async()=>{
  await db('users').truncate()
  await db.seed.run()
})

afterAll(async()=>{
  await db.destroy()
})

test('sanity', () => {
  expect(true).toBe(true)
})

describe('/api/auth tests',()=>{
  test('[1] POST /register Can register new user', async ()=>{
    const newUser = {username:'Eric2', password: '1234'}
    await request(server).post('/api/auth/register').send(newUser)
    const check = await db('users').where('username', 'Eric2')
    expect(check).toHaveLength(1)
  })
  test('[2] POST /register Password is hashed upon register',async()=>{
    const newUser = {username:'Peng', password: '1234'}
    const res = await request(server).post('/api/auth/register').send(newUser)
    expect(res.body.password).not.toEqual('1234')
  })
  test('[3] POST /register returns error when username is taken', async()=>{
    const newUser2 = {username:'Eric', password: '4321'}
    const res = await request(server).post('/api/auth/register').send(newUser2)
    expect(res.body.message).toEqual('username taken')
  })
  test('[4] POST /login Registered User can log in and returns message/token',async()=>{
    const newUser = {username:'Eric', password: '1234'}
    const check = await request(server).post('/api/auth/login').send(newUser)
    const res = await db('users').where('username', 'Eric').first()
    expect(bcrypt.compareSync(newUser.password, res.password)).toBeTruthy()
    expect(check.body).toHaveProperty("message")
    expect(check.body).toHaveProperty("token")
  })
  test('[5] /login fails with incorrect credentials',async()=>{
    const fakeUser = {username:'EricClone', password: '12345'}
    const check = await request(server).post('/api/auth/login').send(fakeUser)
    expect(check.body.message).toEqual("invalid credentials")
  })
})
describe('/api/jokes tests', ()=>{
  test('[6] GET /jokes fails when no token provided', async()=>{
    const res = await request(server).get('/api/jokes')
    expect(res.body.message).toEqual('token required')
  })
  test('[7] GET /jokes succeeds with valid token', async()=>{
    const newUser = {username:'Eric', password: '1234'}
    let res = await request(server).post('/api/auth/login').send(newUser)
    res = await request(server).get('/api/jokes').set('Authorization', res.body.token)
    expect(res.body).toHaveLength(3)
  })
})
