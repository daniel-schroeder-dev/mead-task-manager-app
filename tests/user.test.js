const app = require('../app');

/*
*   Ensures you don't have to call request(app).method().etc... everytime you 
*   use supertest.
*/
const request = require('supertest')(app);
const User = require('../src/models/user');
const mongoose = require('mongoose');

const existingUser = {
  name: 'existing',
  email: 'existingUser@gmail.com',
  password: 'myPass123',
};

beforeEach(async () => {
  await User.deleteMany();
  await User.create(existingUser);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User signup routes', () => {
  
  test('Should signup a new user', async () => {
    
    const newUser = {
      name: 'Daniel',
      email: 'daniel@gmail.com',
      password: 'myPass123',
    };
    
    const res = await request.post('/users').send(newUser);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe(newUser.email);
  
  });

  test('Should fail to signup a new user', async () => {
    
    const res = await request.post('/users').send({ invalid: 'Data' });
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatch(/^User validation failed/);
  
  });

});

describe('User login routes', () => {
  
  test('Should login existing user', async () => {
    
    const res = await request.post('/users/login').send(existingUser);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(existingUser.email);
  
  });

  test('Should not login nonexistent user', async () => {
    
    const invalidUser = {
      email: 'nope@gmail.com',
      password: 'nonsuchpass',
    };

    const res = await request.post('/users/login').send()
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toBe('Login failed');
  
  });
  
});

describe('User profile routes', () => {
  
  test('Should get user\'s profile', async () => {

    const [ user ] = await User.find({ email: existingUser.email });
    authToken = user.authTokens.pop().token;

    const res = await request.get('/users/me').set('Authorization', `Bearer ${authToken}`);

    expect(res.body.email).toBe(existingUser.email);

  });

  test('Should not get user\'s profile for unauthenticated user', async () => {
    
    const res = await request.get('/users/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch('Invalid authentication token');

  });

});

