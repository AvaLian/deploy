import LogModel from './log.model';

export async function createLog (project, type, info) {
  try {
    const obj = {
      project,
      type,
      info,
      time: new Date
    };
    const log = new LogModel(obj);
    await log.save();
    return log;
  } catch (err) {
    return false;
  }
}

export async function getAllLogs (ctx) {
  try {
    const logs = await LogModel.find().populate('user').sort({'time': 'desc'});
    ctx.body = { errCode: 0, errMsg: 'success', data: logs };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}

export async function getProjectLogs (ctx) {
  const project = ctx.params.pid;
  try {
    const logs = await LogModel.find({ project }).populate('user').sort({'time': 'desc'});
    ctx.body = { errCode: 0, errMsg: 'success', data: logs };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}