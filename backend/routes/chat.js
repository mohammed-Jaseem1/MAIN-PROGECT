const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

// Create a new chat session
router.post('/new', async (req, res) => {
    try {
        const { studentId } = req.body;
        const newChat = new Chat({
            studentId,
            messages: [{ role: 'assistant', content: 'Hello! I am your AI Coach. How can I help you today?' }]
        });
        await newChat.save();
        res.status(201).json(newChat);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create new chat', details: err.message });
    }
});

// Get all chats for a student
router.get('/student/:studentId', async (req, res) => {
    try {
        const chats = await Chat.find({ studentId: req.params.studentId }).sort({ updatedAt: -1 });
        res.json(chats);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chats', details: err.message });
    }
});

// Update a chat (add messages)
router.post('/:chatId/message', async (req, res) => {
    try {
        const { role, content } = req.body;
        const chat = await Chat.findById(req.params.chatId);
        if (!chat) return res.status(404).json({ error: 'Chat not found' });

        chat.messages.push({ role, content });
        chat.updatedAt = Date.now();

        // Update title if it's still 'New Chat' and we have a user message
        if (chat.title === 'New Chat' && role === 'user') {
            chat.title = content.substring(0, 30) + (content.length > 30 ? '...' : '');
        }

        await chat.save();
        res.json(chat);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update chat', details: err.message });
    }
});

// Delete a chat
router.delete('/:chatId', async (req, res) => {
    try {
        await Chat.findByIdAndDelete(req.params.chatId);
        res.json({ message: 'Chat deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete chat' });
    }
});

module.exports = router;
