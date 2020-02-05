const express = require('express');
const auth = require('../middleware/auth');
const db = require('../db/db');
const Task = require('../models/task');
const ResponseError = require('../utils/responseError');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res, next) => {
  const dbResponse = await db.readAllTasks(req.user._id, req.query);
  res.status(dbResponse.statusCode).json(dbResponse);
});

router.post('/', async (req, res, next) => {
  req.body.owner = req.user._id; 
  const task = await Task.create(req.body);
  res.status(201).json(task);
});

router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });
    if (!task) throw new ResponseError(404, 'Task not found');
    res.status(200).json(task);
  } catch (e) {
    res.status(e.status).json(e.message);
  }
});

router.patch('/:id', async (req, res, next) => {
  const dbResponse = await db.updateTask(req.params.id, req.user._id, req.body);
  res.status(dbResponse.statusCode).json(dbResponse);
});

router.delete('/:id', async (req, res, next) => {
  const dbResponse = await db.deleteTask(req.params.id, req.user._id);
  res.status(dbResponse.statusCode).json(dbResponse);
});

module.exports = router;
