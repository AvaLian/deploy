import FileDiff from './fileDiff.model.js';
import config from '../../config';

export async function getFileDiffByBuildId (ctx) {
  const build = ctx.params.id;
  const file = ctx.query.file;
  const fileDiff = await findFileDiffByBuildId(build, file);
  ctx.body = { errCode: 0, errMsg: 'success', data: fileDiff };
}

export async function findFileDiffByBuildId (build, file) {
  let fileDiff = [];
  try {
    fileDiff = await FileDiff.find({ build }).where('file').equals(file);
  } catch (err) {
    fileDiff = [];
  }
  return fileDiff[0];
}

export async function changeFileDiffByBuildId (build, file, diff, info) {
  try {
    let fileDiff = await FileDiff.find({ build }).where('file').equals(file);
    if (!fileDiff || fileDiff.length === 0) {
      fileDiff = new FileDiff({ build, file, diff, info });
    } else {
      fileDiff = fileDiff[0];
      fileDiff.diff = diff;
      fileDiff.info = info;
    }
    await fileDiff.save();
    return true;
  } catch (err) {
    return false;
  }
}