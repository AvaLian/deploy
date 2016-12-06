import Project from './project.model.js';

export async function getAllProjects (ctx) {
  const projects = await Project.find({}).sort({createTime: 'desc'});
  ctx.body = { errCode: 0, errMsg: 'success', data: projects };
};

export async function addProject (ctx) {
  let body = ctx.request.body;
  body.createTime = new Date();
  const project = new Project(body);
  try {
    await project.save();
  } catch (err) {
    ctx.throw(422, err.message);
  }
  ctx.body = {errCode: 0, errMsg: 'success'};
};