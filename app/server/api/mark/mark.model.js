import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MarkSchema = new mongoose.Schema({
  files: String,
  build: { type: Schema.Types.ObjectId, ref: 'Build' }
});

export default mongoose.model('Mark', MarkSchema);