import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const DirDiffSchema = new Schema({
  diff: String,
  build: { type: Schema.Types.ObjectId, ref: 'Build' }
});

export default mongoose.model('DirDiff', DirDiffSchema);