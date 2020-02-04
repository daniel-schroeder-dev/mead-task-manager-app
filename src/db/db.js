const mongoose = require('mongoose');
const User = require('../models/user');
const Task = require('../models/task');
const ResponseError = require('../utils/responseError');

const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, connectionOptions);
  } catch (e) {
    console.log(e);
  }
})();

mongoose.connection.on('connected', () => {
  // console.log('Connected to db!');
});

const isBoolean = (val) => val === "true" || val === "false";

exports.create = async (modelToCreate, doc) => {

  const Model = modelToCreate === 'task' ? Task : User;

  const model = new Model(doc);

  try {
    await model.save();
  } catch(e) {
    throw new ResponseError(400, e.message);
  }
    
  return model;
  
};

exports.readAllTasks = async (owner, query) => {

  try {

    const filter = { owner };

    if (query.completed && isBoolean(query)) filter.completed = query;

    let tasks = await Task.find(filter);

    if (query.numResults) {
      const startIndex = +query.skip || 0;
      tasks = tasks.slice(startIndex, +query.numResults + startIndex);
    }

    if (query.sortBy) {
      query.desc ? tasks.sort((a, b) => b[query.sortBy] - a[query.sortBy]) : tasks.sort((a, b) => a[query.sortBy] - b[query.sortBy]);
    }
    
    return {
      statusCode: 200,
      tasks,
    };

  } catch (e) {
    return {
      statusCode: 500,
      msg: e,
    };
  }
};

exports.readTask = async (taskId, ownerId) => {
  
  try {
  
    const task = await Task.findOne({ _id: taskId, owner: ownerId });
  
    if (!task) {
      return {
        statusCode: 404,
        msg: 'Task not found',
      };
    }
  
    return {
      statusCode: 200,
      task,
    };

  } catch (e) {
    return {
      statusCode: 500,
      msg: e,
    };
  }
};

exports.updateUser = async (id, updateOperations) => {

  const updatePaths = Object.keys(updateOperations);
  // ensures that we only allow user to update Schema paths that we set. The _id and __v paths are set by mongoose, and we don't want the user to touch those. Could create this whitelist by hard-coding it if we wanted to filter out certain paths we created as well.
  const allowedUpdatePaths = Object.keys(User.schema.paths).filter((key) => key[0] !== '_' );

  if (!updatePaths.every((updatePath) => allowedUpdatePaths.includes(updatePath))) {
    return {
      statusCode: 400,
      msg: 'Invalid update options',
    };
  }

  const updateOptions = {
    new: true,
    runValidators: true,
  };

  try {

    // need to load in doc to update and perform update operations at the application-level so we can run mongoose pre('save') middleware.
    const user = await User.findById(id);

    updatePaths.forEach((path) => user[path] = updateOperations[path]);

    await user.save();

    if (!user) {
      return {
        statusCode: 404,
        msg: 'User not found',
      };
    }

    return {
      statusCode: 200,
      user,
    };
    
  } catch (e) {
    return {
      statusCode: 400,
      msg: e.message,
    };
  }
};

exports.updateTask = async (id, ownerId, updateOperations) => {

  const updatePaths = Object.keys(updateOperations);
  // ensures that we only allow user to update Schema paths that we set. The _id and __v paths are set by mongoose, and we don't want the user to touch those. Could create this whitelist by hard-coding it if we wanted to filter out certain paths we created as well.
  const allowedUpdatePaths = Object.keys(Task.schema.paths).filter((key) => key[0] !== '_' );

  if (!updatePaths.every((updatePath) => allowedUpdatePaths.includes(updatePath))) {
    return {
      statusCode: 400,
      msg: 'Invalid update options',
    };
  }

  const updateOptions = {
    new: true,
    runValidators: true,
  };

  try {

    // need to load in doc to update and perform update operations at the application-level so we can run mongoose pre('save') middleware.
    const task = await Task.findOne({ _id: id, owner: ownerId });

    if (!task) {
      return {
        statusCode: 404,
        msg: 'Task not found',
      };
    }

    updatePaths.forEach((path) => task[path] = updateOperations[path]);

    await task.save();

    return {
      statusCode: 200,
      task,
    };
    
  } catch (e) {
    return {
      statusCode: 400,
      msg: e.message,
    };
  }
};

exports.deleteTask = async (id, ownerId) => {
  
  try {

    const task = await Task.findOne({ _id: id, owner: ownerId });

    if (!task) {
      return {
        statusCode: 404,
        msg: 'Task not found',
      };
    }
    
    await task.remove();

    return {
      statusCode: 200,
      task,
    };

  } catch (e) {
    return {
      statusCode: 500,
      msg: e.message,
    };
  }
};