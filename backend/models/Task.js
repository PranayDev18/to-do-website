const mongoose = require('mongoose');
const TaskSchema = new mongoose.Schema({
  username: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
});
module.exports = mongoose.model('Task', TaskSchema);
