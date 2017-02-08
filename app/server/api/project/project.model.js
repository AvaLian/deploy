import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  type: String,
  name: { type: String, required: true },
  alias: String,
  desciption: String,
  createTime: Date,
  sourceRepo: { type: String, required: true },
  onlineRepo: { type: String, required: true }, // 上线资源池
  lastBuildId: { type: Schema.Types.ObjectId, ref: 'Build' },
  lastBuildDate: Date,
  excludeDirs: Array,  // diff时可以忽略的目录
  buildDuration: Number,
  buildCount: Number,
  buildStatus: Number // 编译状态，0 - 编译中；1 - 编译成功；2 - 编译失败
});

export default mongoose.model('Project', ProjectSchema);