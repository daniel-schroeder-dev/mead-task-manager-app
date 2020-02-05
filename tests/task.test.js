const app = require('../app');

/*
*   Ensures you don't have to call request(app).method().etc... everytime you 
*   use supertest.
*/
const request = require('supertest')(app);
const User = require('../src/models/user');
const Task = require('../src/models/task');
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

describe('Task creation routes', () => {



});