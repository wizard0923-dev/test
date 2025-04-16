const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Track active users
const activeUsers = new Set();

io.on('connection', (socket) => {
    console.log('A new user is connected:', socket.id);

    // Add user to active users list
    activeUsers.add(socket.id);
    io.emit('active users', Array.from(activeUsers)); // Send updated list to all clients

    // Handle incoming messages
    socket.on('message', (msg) => {
        console.log('Message:', msg, 'from:', socket.id);
        socket.broadcast.emit('incoming message', { id: socket.id, message: msg }); // Broadcast to all clients
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        activeUsers.delete(socket.id); // Remove user from active users list
        io.emit('active users', Array.from(activeUsers)); // Send updated list to all clients
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});