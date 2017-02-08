import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const BuildSchema = new Schema({
  record: String,
  errorLine: Number,
  status: Number, // 编译状态，0 - 编译中；1 - 编译成功；2 - 编译失败
  time: Date,
  operator: String,
  project: { type: Schema.Types.ObjectId, ref: 'Project' }
});

export default mongoose.model('Build', BuildSchema);