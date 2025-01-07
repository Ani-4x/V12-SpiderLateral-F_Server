import mongoose from "mongoose";



const GoogleUserSchema = new mongoose.Schema({
    googleId: String,
    name: String,
    email: String,
    photo: String,
  });
  
  const GoogleUser = mongoose.model('GoogleUser', GoogleUserSchema);

  export default GoogleUser;