import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const BuildSchema = new Schema({
  record: String,
  errorLine: Number,
  status: Number, // 编译状态，0 - 编译中；1 - 编译成功；2 - 编译失败
  time: Date,
  operator: String,
  sourceMap: String, // 编译后文件的对应关系
  lastCommitHash: String, // 上一次提交md5校验码
  project: { type: Schema.Types.ObjectId, ref: 'Project' }
});

export default mongoose.model('Build', BuildSchema);