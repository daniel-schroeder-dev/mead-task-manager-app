const request = require('supertest');
const app = require('../app');
const User = require('../src/models/user');

const testUser = {
  name: 'test',
  email: 'testUser@gmail.com',
  password: 'myPass123',
};

beforeAll(async () => {
  await User.deleteMany();
  await new User(testUser).save();
});

test('Should signup a new user', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'Daniel',
      email: 'daniel@gmail.com',
      password: 'myPass123',
    })
    .expect(201);
});

test('Should login existing user', async () => {
  await request(app)
    .post('/users/login')
    .send(testUser)
    .expect(200);
});

test('Should not login nonexistent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'nope@gmail.com',
      password: 'nonsuchpass',
    })
    .expect(400);
});
