const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Task = require('./models/Task');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- JWT AUTH MIDDLEWARE ---
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// --- REGISTRATION ROUTE ---
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// --- PROTECTED TASK ROUTES ---

// Get Tasks
app.get('/api/tasks/:username', authMiddleware, async (req, res) => {
  if (req.user.username !== req.params.username) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const tasks = await Task.find({ username: req.params.username });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Add Task
app.post('/api/tasks', authMiddleware, async (req, res) => {
  const { text } = req.body;
  const username = req.user.username;
  try {
    const newTask = await Task.create({ username, text });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Toggle Task
app.put('/api/tasks/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task && task.username === req.user.username) {
      task.completed = !task.completed;
      await task.save();
      res.json(task);
    } else {
      res.status(404).json({ message: 'Task not found or forbidden' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete Task
app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task && task.username === req.user.username) {
      await Task.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Task deleted' });
    } else {
      res.status(404).json({ message: 'Task not found or forbidden' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
