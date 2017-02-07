import Mark from './mark.model.js';
import config from '../../config';

export async function getMarksByBuildId (ctx) {
  const build = ctx.params.id;
  try {
    const mark = await Mark.findOne({ build });
    ctx.body = { errCode: 0, errMsg: 'success', data: mark };
  } catch (err) {
    ctx.body = { errCode: 0, errMsg: 'success', data: {} };
  }
}

export async function changeMarksByBuildId (ctx) {
  const build = ctx.params.id;
  const body = ctx.request.body;
  const file = body.file;
  const info = body.info;
  try {
    let mark = await Mark.findOne({ build });
    if (!mark) {
      let param = {
        build,
        files: ''
      };
      let files = {};
      files[file] = info;
      param.files = JSON.stringify(files);
      mark = new Mark(param);
    } else {
      let files = JSON.parse(mark.files);
      files[file] = info;
      mark.files = JSON.stringify(files);
    }
    await mark.save();
    ctx.body = { errCode: 0, errMsg: 'success', data: mark };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}