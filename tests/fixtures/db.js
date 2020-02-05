const User = require('../../src/models/user');

const testUserData = {
  name: 'test',
  email: 'testUser@gmail.com',
  password: 'myPass123',
};

const populateDB = async () => {
  await User.deleteMany({});
  const testUser = await User.create(testUserData);
  const authToken = testUser.authTokens.pop().token;
  return { testUser, authToken };
};

module.exports = {
  testUserData,
  populateDB,
};