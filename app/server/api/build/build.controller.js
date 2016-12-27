import Build from './build.model.js';
import config from '../../config';

export async function getAllBuildRecords (ctx) {
  try {
    const builds = await Build.find({}).populate('project').sort({time: 'desc'});
    ctx.body = { errCode: 0, errMsg: 'success', data: builds };
  } catch (err) {
    ctx.throw(422, err.message);
  }
};

export async function getBuildRecordByProjectId (ctx) {
  try {
    const projectId = ctx.params.id;
    const build = await Build.find({ project: projectId }).sort({time: 'desc'});
    ctx.body = { errCode: 0, errMsg: 'success', data: build };
  } catch (err) {
    ctx.throw(422, err.message);
  }
};

export async function addBuildRecord (buildRecord) {
  buildRecord.time = new Date();
  return await Build.create(buildRecord);
};