import express from 'express';

import {   Login ,Signup, Users} from '../constroller/User-controller.js';


const  Route = express.Router();

Route.post('/Login', Login)

Route.get('/users' , Users)

Route.post('/Signup', Signup)

// Route.post('/SendMessage', SendMessage)

// Route.get('/fetchMessages' , fetchMessages)




export default Route;