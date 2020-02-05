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

beforeEach(async () => {
  const dbResponse = await db.populateDB();
  testUser = dbResponse.testUser;
  authToken = dbResponse.authToken;
});

describe('Task creation routes', () => {

  test('Should create a task', async () => {

    const testTaskData = {
      description: 'Test task',
      completed: false,
    };
    
    const res = await request.post('/tasks').set('Authorization', `Bearer ${authToken}`).send(testTaskData);

    expect(res.statusCode).toBe(201);
    expect(res.body.description).toBe(testTaskData.description);

  });

});