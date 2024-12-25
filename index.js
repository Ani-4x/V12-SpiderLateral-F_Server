import express from 'express';
import Connection from './database/DB.js';
import Route from './routes/Route.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import {Server} from 'socket.io'
import User from './user-model/User.js';
import { createServer } from "http";
import Message from './user-model/Message.js';
import { SendMessage } from './constroller/User-controller.js';


const  send = express.Router();


const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});



const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({extended :true}));
app.use(bodyParser.urlencoded({ extended:true}));
app.use('/', Route);
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).send('Something went wrong!');
  });
 
Connection();



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

/// send message to db

app.post('/SendMessage', async (req, res) => {
  const { msg} = req.body;
  if (!msg) {
      return res.send({ error: 'Missing required fields' });
  }
  
  try {
    const newMessage = new Message({  msg });
    await newMessage.save();
    res.json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.json({ error: "Failed to save message" });
  }
});


app.get("/messages/:senderId/:receiverId", async (req, res) => {
  const { receiverId, senderId } = req.params;

  // fetch conversation between two users
  const messages = await Message.find({senderId , receiverId}).sort({ timestamp: 1 });

  res.json(messages);
});








const PORT = 5000;

app.listen(`${PORT}`, '192.168.1.5', () => console.log(`Server is running on Port ${PORT}`))