require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); // Allows the server to read JSON in request bodies
app.use(cors({
  origin: 'https://mern-todo-njik.vercel.app' // Removed trailing slash
}));         // Allows your React frontend to talk to this server

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => {
        console.error("❌ MongoDB connection error:", err);
        // Do not crash, but log the error clearly
    });

// --- DATABASE MODEL (The Blueprint) ---
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
});

const Task = mongoose.model('Task', taskSchema);

// --- ROUTES (API Endpoints) ---

// 1. GET all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. POST a new task
app.post('/tasks', async (req, res) => {
    try {
        const newTask = new Task({
            title: req.body.title
        });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. PUT (Update) a task by ID
app.put('/tasks/:id', async (req, res) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Returns the updated document instead of the old one
        );
        if (!updatedTask) return res.status(404).send("Task not found");
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. DELETE a task by ID
app.delete('/tasks/:id', async (req, res) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);
        if (!deletedTask) return res.status(404).send("Task not found");
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000; // Use the server's port or 3000 locally
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));