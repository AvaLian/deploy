import fse from 'fs-extra';
import path from 'path';
import shelljs from 'shelljs';

import Project from './project.model.js';
import config from '../../config';


export async function getAllProjects (ctx) {
  try {
    const projects = await Project.find({}).sort({createTime: 'desc'});
    ctx.body = { errCode: 0, errMsg: 'success', data: projects };
  } catch (err) {
    ctx.throw(422, err.message);
  }
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
  ctx.body = { errCode: 0, errMsg: 'success' };
};

export async function getProjectById (ctx) {
  let id = ctx.params.id;
  try {
    const project = await Project.findById(id);
    ctx.body = { errCode: 0, errMsg: 'success', data: project };
  } catch (err) {
    ctx.throw(422, err.message);
  }
};

export async function buildProjectById (ctx) {
  let id = ctx.params.id;
  try {
    const project = await Project.findById(id);
    const sourceRepo = project.sourceRepo;
    const repoDir = path.join(config.root, config.repoDir);
    if (!fse.ensureDirSync(repoDir)) {
      fse.mkdirpSync(repoDir);
    }
    const projectPath = path.join(repoDir, project.name);
    fse.removeSync(projectPath);
    // 先拉取git项目
    const gitClone = shelljs.exec(`git clone ${sourceRepo} ${projectPath}`, { silent: true, async: false });
    const cd = shelljs.cd(projectPath);
    // 执行ath编译
    const athBuild = shelljs.exec(`ath build --release`, { silent: true });
    shelljs.cd(config.root);
    ctx.body = {
      errCode: 0,
      errMsg: 'success',
      data: {
        log: athBuild.stdout
      }
    };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}