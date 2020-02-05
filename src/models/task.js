const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

taskSchema.statics.create = async function(newTask) {

    const task = new this(newTask);

    try {
      await task.save();
      return task;
    } catch(e) {
      throw new ResponseError(400, e.message);
    }

};

module.exports = mongoose.model('Task', taskSchema);