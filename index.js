import express from 'express';
import Connection from './database/DB.js';
import Route from './routes/Route.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Server } from 'socket.io'
import User from './user-model/User.js';
import { createServer } from "http";
import Message from './user-model/Message.js';
// import { SendMessage } from './constroller/User-controller.js';
import { createClient } from 'redis';

import redis from "redis";
import GoogleUser from './user-model/GoogleUser.js';


const client = redis.createClient();

client.connect();






const send = express.Router();


const httpServer = createServer();

const io = new Server(5001, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"]
  }
});


const rooms = {};


const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', Route);
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).send('Something went wrong!');
});

Connection();





// Google Sign-In Route
app.post('/auth/google', async (req, res) => {
  const { idToken, user } = req.body;

  try {
    let existingUser = await GoogleUser.findOne({ googleId: user.id });
    if (!existingUser) {
      existingUser = new GoogleUser({
        googleId: user.id,
        name: user.name,
        email: user.email,
        photo: user.photo,
      });
      await existingUser.save();
    }

    const token = jwt.sign({ userId: existingUser._id }, 'your_jwt_secret');
    res.json({ token, name: existingUser.name });
  } catch (err) {
    res.status(500).json({ error: 'Error signing in' });
  }
});


app.get('/currentUser', async (req, res) => {
  const user = await User.findOne();  ///find logged in users
  res.json(user);
});


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (userId) => {
    socket.join(userId);  // get user-id
    console.log(`User ${userId} joined their room`);
  });

  //send message socket

  socket.on('/SendMessage', async (data) => {
    const { senderId, receiverId, message } = data;
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();

    io.to(receiverId).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

//  fetch users
app.get('/users', async (req, res) => {
  const users = await User.find({});
  res.json(users);
});





///rEDIS

const redisClient = createClient();
redisClient.connect().catch(console.error);

// Store messages in Redis cache
const cacheMessages = async (userId, messages) => {
  const key = `messages:${userId}`;
  await redisClient.set(key, JSON.stringify(messages));
  await redisClient.expire(key, 3600); // Cache expires in 1 hour
};

// Fetch messages from Redis cache
const getCachedMessages = async (userId) => {
  const key = `messages:${userId}`;
  const data = await redisClient.get(key);
  return data ? JSON.parse(data) : null;
};


// Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join user room for one-on-one chat
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  // Send message
  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    const msg = { senderId, receiverId, message, timestamp: new Date() };

    // Save to MongoDB
    const savedMessage = await Message.create(msg);

    const receiverSocketId = userSocketMap[receiverId]

    // Send message to receiver's room
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", savedMessage)
    }
    console.log(`Sending message to socket: ${receiverSocketId}`);


  });

  // Fetch old messages
  socket.on("fetchMessages", async ({ userId, receiverId }, callback) => {
    // Check Redis cache first
    const cachedMessages = await getCachedMessages(userId);
    if (cachedMessages) {
      return callback(cachedMessages.filter(
        (msg) => (msg.senderId === userId && msg.receiverId === receiverId) ||
          (msg.senderId === receiverId && msg.receiverId === userId)
      ));
    }

    // If not in Redis, fetch from MongoDB
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 });

    // Cache the fetched messages
    await cacheMessages(userId, messages);

    callback(messages);
  });

  // Disconnect
  socket.on("disconnect", () => {
    const userId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );
    if (userId) {
      delete userSocketMap[userId];
      console.log(`User ${userId} disconnected`);
    }
  });
});














const PORT = 5000;

app.listen(`${PORT}`, '192.168.56.1', () => console.log(`Server is running on Port ${PORT}`))