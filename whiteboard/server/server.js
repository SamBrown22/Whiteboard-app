var app = require('express')();
var http = require('http').createServer(app);
var mongoose = require('mongoose');
var io = require('socket.io')(http, {
    pingTimeout: 90000, // 90 seconds - Configuring Socket.IO options
    pingInterval: 25000, // 25 seconds - Configuring Socket.IO options
});

// Define the Mongoose model outside the try block
const CanvasDB = mongoose.model('CanvasObjects', new mongoose.Schema({
    type: String,
    properties: mongoose.Schema.Types.Mixed,
}));

// Attempt to Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mongo-webapp').then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Express route to retrieve all objects from the database
app.get('/get-all-objects', async (req, res) => {
    try {
        const allObjects = await CanvasDB.find({});
        res.json(allObjects);
    } catch (error) {
        console.error('Error retrieving objects from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Socket.IO event handling
io.on('connection', async (socket) => {
    console.log('User Connected: ', socket.id);
    try {
        const allObjects = await CanvasDB.find({});
        socket.emit('all-objects', allObjects);
    } catch (error) {
        console.error('Error emitting existing objects:', error);
    }

    /// Listen for 'last-object' event from clients
    socket.on('last-object', async (data) => {
        try {
            // Broadcast the 'last-object' data to other clients
            socket.broadcast.emit('last-object', data)

            // Parse the incoming data as JSON
            const jsonData = JSON.parse(data);

            // Ensure jsonData is an object
            if (typeof jsonData === 'object' && jsonData !== null) {
                // Save the 'last-object' data to MongoDB
                const newObject = new CanvasDB(jsonData);
                await newObject.save();
                console.log('SAVED')
            } else {
                console.error('Invalid JSON data received:', data);
            }
        } catch (error) {
            console.error('Error saving last-object to MongoDB:', error);
        }
    });

    // Listen for 'clear-canvas' event from clients and broadcast it to other clients
    socket.on('clear-canvas', async () => {
        try {
            // Broadcast the 'clear-canvas' event to other clients
            socket.broadcast.emit('clear-canvas');
    
            // Delete all objects from the MongoDB database (assuming 'CanvasDB' is your model)
            await CanvasDB.deleteMany({});
            console.log('Canvas cleared and database objects deleted');
        } catch (error) {
            console.error('Error handling clear-canvas:', error);
        }
    });

    // Handle disconnection of a socket
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

// Set up server to listen on a specified port
var server_port = process.env.YOUR_PORT || process.env.PORT || 5000;
http.listen(server_port, () => {
    console.log('Server started on port: ' + server_port);
});
