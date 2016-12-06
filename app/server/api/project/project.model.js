import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  type: String,
  name: { type: String, required: true },
  alias: String,
  desciption: String,
  createTime: Date,
  sourceRepo: { type: String, required: true }
});

export default mongoose.model('Project', ProjectSchema);