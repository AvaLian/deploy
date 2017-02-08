import DirDiff from './dirDiff.model.js';
import config from '../../config';

export async function getDirDiffByBuildId (ctx) {
  const build = ctx.params.id;
  const dirDiff = await findDirDiffByBuildId(build);
  ctx.body = { errCode: 0, errMsg: 'success', data: dirDiff };
}

export async function findDirDiffByBuildId (build) {
  let dirDiff = null;
  try {
    dirDiff = await DirDiff.findOne({ build });
  } catch (err) {
    dirDiff = null;
  }
  return dirDiff;
}

export async function changeDirDiffByBuildId (build, diff) {
  try {
    let dirDiff = await DirDiff.findOne({ build });
    if (!dirDiff) {
      dirDiff = new DirDiff({ build, diff });
    } else {
      dirDiff.diff = diff;
    }
    await dirDiff.save();
    return true;
  } catch (err) {
    return false;
  }
}