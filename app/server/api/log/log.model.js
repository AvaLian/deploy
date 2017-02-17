import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const LogSchema = new mongoose.Schema({
  operator: { type: Schema.Types.ObjectId, ref: 'User' },
  time: Date,
  type: String,
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  info: String
});

export default mongoose.model('Log', LogSchema);