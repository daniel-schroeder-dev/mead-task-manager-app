const app = require('../app');

/*
*   Ensures you don't have to call request(app).method().etc... everytime you 
*   use supertest.
*/
const request = require('supertest')(app);
const User = require('../src/models/user');
const mongoose = require('mongoose');

const testUserData = {
  name: 'test',
  email: 'testUser@gmail.com',
  password: 'myPass123',
};

let testUser;
let authToken;

beforeEach(async () => {
  await User.deleteMany();
  testUser = await User.create(testUserData);
  authToken = testUser.authTokens.pop().token;
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
    
    const res = await request.post('/users/login').send(testUserData);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);

    const user = await User.findById(res.body._id);

    expect(user.authTokens.length).toBe(2);
  
  });

  test('Should not login nonexistent user', async () => {
    
    const invalidUserData = {
      email: 'nope@gmail.com',
      password: 'nonsuchpass',
    };

    const res = await request.post('/users/login').send(invalidUserData);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toBe('Login failed');
  
  });
  
});

describe('User profile routes', () => {
  
  test('Should get user\'s profile', async () => {

    const res = await request.get('/users/me').set('Authorization', `Bearer ${authToken}`);

    expect(res.body.email).toBe(testUser.email);

  });

  test('Should not get user\'s profile for unauthenticated user', async () => {
    
    const res = await request.get('/users/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch('Invalid authentication token');

  });

});

describe('User delete routes', () => {
  
  test('Should delete account for user', async () => {
    
    const res = await request.delete('/users/me').set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);

    const user = await User.findById(res.body._id);

    expect(user).toBeNull();

  });

  test('Should not deleted account for unauthenticated user', async () => {
    
    const res = await request.delete('/users/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch('Invalid authentication token');

  });

});

describe('Upload image routes', () => {

  test('Should upload profile image', async () => {

    const imagePath = 'tests/fixtures/pug.jpg';
  
    const res = await request.post('/users/me/avatar').attach('avatar', imagePath).set('Authorization', `Bearer ${authToken}`);

    expect(res.body.msg).toBe('File uploaded');

    const user = await User.findById(res.body.user._id);

    expect(user).toHaveProperty('avatar');
    expect(user.avatar).toBeInstanceOf(Buffer);

  });

});

describe('User update routes', () => {

  test('Should update valid user fields', async () => {
    
    const res = await request.patch('/users/me').set('Authorization', `Bearer ${authToken}`).send({ name: 'UpdatedNameBro' });

    expect(res.body.name).toBe('UpdatedNameBro');

  });

  test('Should not update invalid user fields', async () => {
  
    const res = await request.patch('/users/me').set('Authorization', `Bearer ${authToken}`).send({ invalidField: 'invalidValue' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toMatch('Invalid update options');

  });

});

