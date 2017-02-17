import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  password: String,
  email: String,
  phone: String
});

export default mongoose.model('User', UserSchema);