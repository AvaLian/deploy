import fse from 'fs-extra';
import path from 'path';
import shelljs from 'shelljs';
import simpleGit from 'simple-git';

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
  body.buildCount = 0;
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
    const sourceRepo = project.sourceRepo;
    const repoDir = path.join(config.root, config.repoDir);
    if (!fse.ensureDirSync(repoDir)) {
      fse.mkdirpSync(repoDir);
    }
    const projectPath = path.join(repoDir, project.name);
    fse.removeSync(projectPath);
    await simpleGit().clone(sourceRepo, projectPath);
    const log = await new Promise((resolve, reject) => {
      simpleGit(projectPath).log(function (err, log) {
        if (err) {
          reject(err);
          return;
        }
        resolve(log);
      });
    });
    let lastCommit = {};
    if (log) {
      const latest = log.latest;
      lastCommit.message = latest.message;
      lastCommit.author = latest.author_name;
      lastCommit.date = latest.date;
      lastCommit.hash = latest.hash;
    }
    let projectClone = Object.assign({}, project.toObject());
    projectClone.lastCommit = lastCommit;
    ctx.body = { errCode: 0, errMsg: 'success', data: projectClone };
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
    const buildStartTime = new Date().getTime();
    // 先拉取git项目
    const gitClone = shelljs.exec(`git clone ${sourceRepo} ${projectPath}`, { silent: true, async: false });
    const cd = shelljs.cd(projectPath);
    // 执行ath编译
    const athBuild = shelljs.exec(`ath build --release`, { silent: true });
    const buildEndTime = new Date().getTime();
    project.lastBuildDate = new Date;
    project.buildDuration = buildEndTime - buildStartTime;
    project.buildCount = isNaN(project.buildCount) ? 0 : project.buildCount;
    project.buildCount++;
    await project.save();
    // 编译完后需要移出到根目录
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