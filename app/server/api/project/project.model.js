import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  type: String,
  name: { type: String, required: true },
  alias: String,
  desciption: String,
  createTime: Date,
  sourceRepo: { type: String, required: true },
  onlineRepo: { type: String, required: true }, // 上线资源池
  lastBuildDate: Date,
  buildDuration: Number,
  buildCount: Number,
  buildStatus: Number // 编译状态，0 - 编译中；1 - 编译成功；2 - 编译失败
});

export default mongoose.model('Project', ProjectSchema);