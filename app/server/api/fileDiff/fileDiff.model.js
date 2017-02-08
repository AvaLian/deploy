import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const FileDiffSchema = new mongoose.Schema({
  file: String,
  diff: String,
  info: String,
  build: { type: Schema.Types.ObjectId, ref: 'Build' }
});

export default mongoose.model('FileDiff', FileDiffSchema);