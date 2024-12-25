import { application } from 'express';
import bcrypt from 'bcrypt';

import User from '../user-model/User.js';
import Message from '../user-model/Message.js';

// Login
export const Login = async (req, res) => {
  const { email, password } = req.body;

  
  if (!email || !password) {
    return res.json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: 'User not found.' })
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ error: 'Invalid password' })
    }

    res.json({
      message: 'Login successful',
      user: { name: user.name, email: user.email }
    })

  } catch (error) {
    console.error('Login error', error);
    res.json({ error: 'Server error' })
  }
};

export const Signup = async (req, res) => {

  const { name, email, password } = req.body;

  //if given fileds are filled
  if (!name || !email || !password) {
    return res.json({ error: 'Email and password are required.' });
  }

  try {
    // check if user exist in db
    let user = await User.findOne({ name, email, password });

    if (user) {
      return res.json({ message: 'User logged in successfully!', user });
    } else {
      // c
      // reate a new user and store in db
      user = new User({ email, password: await bcrypt.hash(password, 10), name });
      await user.save();

      return res.json({ message: 'User registered successfully!', user });
    }
  } catch (err) {
    console.error(err);
    res.json({ error: 'Server error' });
  }
};



export const Users = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);  // Send data as json
  } catch (error) {
    res.json({ message: error.message });
  }
};

//send message
export const SendMessage = async (req, res) => {
  const { senderId , receiverId, message} = req.body;
  
  
  try {
    const newMessage = new Message({  senderId , receiverId, message });
    await newMessage.save();
    res.json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.json({ error: "Failed to save message" });
  }
};


  

