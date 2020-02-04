const request = require('supertest');
const app = require('../app');
const User = require('../src/models/user');
const mongoose = require('mongoose');

const existingUser = {
  name: 'existing',
  email: 'existingUser@gmail.com',
  password: 'myPass123',
};

beforeAll(async () => {
  await User.deleteMany();
  await new User(existingUser).save();
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
    
    const res = await request(app).post('/users').send(newUser);
    
    expect(res.statusCode).toBe(201);
    expect(res.body.email).toBe(newUser.email);
  
  });

  test('Should fail to signup a new user', async () => {
    
    const res = await request(app).post('/users').send({ invalid: 'Data' });
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatch(/^User validation failed/);
  
  });

});

describe('User login routes', () => {
  
  test('Should login existing user', async () => {
    
    const res = await request(app).post('/users/login').send(existingUser);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(existingUser.email);
  
  });

  test('Should not login nonexistent user', async () => {
    
    const invalidUser = {
      email: 'nope@gmail.com',
      password: 'nonsuchpass',
    };

    const res = await request(app).post('/users/login').send()
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toBe('Login failed');
  
  });
  
});

