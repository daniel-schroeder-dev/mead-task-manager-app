const app = require('../app');

/*
*   Ensures you don't have to call request(app).method().etc... everytime you 
*   use supertest.
*/
const request = require('supertest')(app);
const User = require('../src/models/user');
const Task = require('../src/models/task');
const db = require('./fixtures/db');

let testUser;
let authToken;
let testTask;

const testTaskData = {
  description: 'Test task',
  completed: false,
};

beforeEach(async () => {
  const dbResponse = await db.populateDB();
  testUser = dbResponse.testUser;
  authToken = dbResponse.authToken;
  testTaskData.owner = testUser._id;
  await Task.deleteMany({});
  testTask = await Task.create(testTaskData);
});

describe('Task creation routes', () => {

  test('Should create a task', async () => {
    
    const res = await request.post('/tasks').set('Authorization', `Bearer ${authToken}`).send(testTaskData);

    expect(res.statusCode).toBe(201);
    expect(res.body.description).toBe(testTaskData.description);

  });

});

describe('Task read routes', () => {

  test('Should retrieve a task', async () => {
  
    const res = await request.get(`/tasks/${testTask._id}`).set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toMatch(testTask._id.toString());

  });

  test('Should retrieve all tasks for user', async () => {
    
    testTaskData.description = 'another task';

    await Task.create(testTaskData);

    const res = await request.get('/tasks').set('Authorization', `Bearer ${authToken}`);

    expect(res.body.tasks.length).toBe(2);
    expect(res.statusCode).toBe(200);

  });

});

describe('Task delete routes', () => {

  test('Should NOT allow user to delete another user\'s tasks', async () => {
    
    const userData = {
      name: 'Bob',
      email: 'bob@aol.com',
      password: 'myPass123',
    };

    const user = await User.create(userData);

    const res = await request.delete(`/tasks/${testTask._id}`).set('Authorization', `Bearer ${user.authTokens.pop().token}`);

    expect(res.statusCode).toBe(404);

    const task = await Task.findById(testTask._id);

    expect(task).not.toBeNull();

  });

});