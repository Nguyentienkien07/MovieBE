const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
  },
  gender: {
    type: String,
  },
  cardId: {
    type: String
  },
  position: {
    type: String
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
module.exports = User;
