import fse from 'fs-extra';
import path from 'path';
import shelljs from 'shelljs';
import simpleGit from 'simple-git';

import Project from './project.model.js';
import { addBuildRecord } from '../build/build.controller.js';
import config from '../../config';


export async function getAllProjects (ctx) {
  try {
    const projects = await Project.find({}).sort({createTime: 'desc'});
    ctx.body = { errCode: 0, errMsg: 'success', data: projects };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}

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
}

export async function getProjectById (ctx) {
  const id = ctx.params.id;
  try {
    const project = await Project.findById(id);
    ctx.body = { errCode: 0, errMsg: 'success', data: project };
  } catch (err) {
    ctx.throw(422, err.message);
  }
};

export async function getSourceRepoInfoById (ctx) {
  const params = ctx.params;
  const query = ctx.query;
  const id = params.id;
  const name = query.name;
  const sourceRepo = query.sourceRepo;
  try {
    const repoDir = path.join(config.root, config.repoDir, id);
    fse.ensureDirSync(repoDir);
    const sourceRepoPath = path.join(repoDir, `${id}_source`);
    if (fse.existsSync(sourceRepoPath) && fse.existsSync(path.join(sourceRepoPath, '.git'))) { // 是一个git项目
      await simpleGit(sourceRepoPath).pull(); // 更新所有分支代码
    } else {
      fse.removeSync(sourceRepoPath);
      await simpleGit().clone(sourceRepo, sourceRepoPath);
    }
    const log = await new Promise((resolve, reject) => {
      simpleGit(sourceRepoPath).log(function (err, log) {
        if (err) {
          return reject(err);
        }
        resolve(log);
      });
    }).catch(function (err) {
      console.log(err);
    });
    let lastCommit = {};
    if (log) {
      const latest = log.latest;
      lastCommit.message = latest.message;
      lastCommit.author = latest.author_name;
      lastCommit.date = latest.date;
      lastCommit.hash = latest.hash;
    }
    const result = {
      _id: id,
      name: name,
      sourceRepo: sourceRepo,
      lastCommit: lastCommit
    };
    ctx.body = { errCode: 0, errMsg: 'success', data: result };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}

export async function getOnlineRepoInfoById (ctx) {
  // TODO
}

export async function buildProjectById (ctx) {
  const id = ctx.params.id;
  try {
    let project = await Project.findById(id);
    let buildStatus = 0; // 开始build
    const sourceRepo = project.sourceRepo;
    const repoDir = path.join(config.root, config.repoDir, id);
    fse.ensureDirSync(repoDir);
    const sourceRepoPath = path.join(repoDir, `${id}_source`);
    const buildStartTime = new Date().getTime();
    // 保证代码最新
    if (fse.existsSync(sourceRepoPath) && fse.existsSync(path.join(sourceRepoPath, '.git'))) { // 是一个git项目
      await await new Promise((resolve, reject) => {
        simpleGit(sourceRepoPath).pull(function (err) {  // 更新所有分支代码
          if (err) {
            buildStatus = 2; // 失败
            return reject(err);
          }
          resolve();
        });
      });
    } else {
      fse.removeSync(sourceRepoPath);
      await new Promise((resolve, reject) => {
        simpleGit().clone(sourceRepo, sourceRepoPath, function (err) {
          if (err) {
            buildStatus = 2; // 失败
            return reject(err);
          }
          resolve();
        });
      }).catch(function (err) {
        console.log(err);
      });
    }
    const cd = shelljs.cd(sourceRepoPath);
    // 执行ath编译
    const athBuild = shelljs.exec(`ath build --release`, { silent: true });
    const buildLog = athBuild.stdout;
    const buildLogArr = buildLog.split('\n');
    let errorLine = -1;
    buildStatus = 1;
    buildLogArr.forEach((item, i) => {
      if (/JS_Parse_Error|Error|TypeError|Uncaught SyntaxError/.test(item)) {
        buildStatus = 2;
        errorLine = i;
      }
    });
    const buildEndTime = new Date().getTime();
    const buildRecord = {
      record: buildLog,
      status: buildStatus,
      errorLine: errorLine,
      operator: '',
      project: project._id
    };
    await addBuildRecord(buildRecord);
    project.lastBuildDate = new Date;
    project.buildDuration = buildEndTime - buildStartTime;
    project.buildCount = isNaN(project.buildCount) ? 0 : project.buildCount;
    project.buildStatus = buildStatus;
    project.buildCount++;
    await project.save();
    // 编译完后需要移出到根目录
    shelljs.cd(config.root);
    ctx.body = {
      errCode: 0,
      errMsg: 'success',
      data: buildRecord
    };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}

export async function getOnlineDiff (ctx) {
  const id = ctx.params.id;
  const query = ctx.query;
  const onlineRepo = query.onlineRepo;
  try {
    const repoDir = path.join(config.root, config.repoDir, id);
    const sourceRepo = path.join(repoDir, `${id}_source`);
    const appConf = require(path.join(sourceRepo, 'app-conf.js'));
    const lastBuildResultDir = path.join(sourceRepo, '.temp', appConf.app);
    const onlineRepoDir = path.join(repoDir, `${id}_online`);
    // 先拉取一下onlineRepo的最新代码
    if (fse.existsSync(onlineRepoDir) && fse.existsSync(path.join(onlineRepoDir, '.git'))) { // 是一个git项目
      await simpleGit(onlineRepoDir).pull(); // 更新所有分支代码
    } else {
      fse.removeSync(onlineRepoDir);
      await simpleGit().clone(onlineRepo, onlineRepoDir);
    }
    const dirCompare = require('dir-compare');
    const options = {
      compareContent: true,
      excludeFilter: '.git,node_modules,.DS_Store'
    };
    const compareResult = dirCompare.compareSync(lastBuildResultDir, onlineRepoDir, options);
    const diffSet = compareResult.diffSet;
    const lastBuildDirInfo = [];
    const onlineRepoDirInfo = [];
    function generateLastBuildDirInfo (infoArr, entry, different) {
      if (entry.level === 0) {
        infoArr.push({
          name: entry[`name${different}`],
          type: entry[`type${different}`],
          relative: entry.relativePath,
          children: []
        });
      } else {
        (function iterateThrough (arr, obj) {
          arr.forEach((item) => {
            if (item.type === 'directory') {
              if (`${item.relative}/${item.name}` === obj.relativePath) {
                item.children.push({
                  name: obj[`name${different}`],
                  type: obj[`type${different}`],
                  relative: obj.relativePath,
                  children: []
                });
              } else {
                iterateThrough(item.children, obj);
              }
            }
          });
        })(infoArr, entry);
      }
    }
    diffSet.forEach((entry) => {
      switch (entry.state) {
        case 'left':  // 只有左边有
          generateLastBuildDirInfo(lastBuildDirInfo, entry, '1');
          break;
        case 'right':
          generateLastBuildDirInfo(onlineRepoDirInfo, entry, '2');
          break;
        case 'equal':
        case 'distinct':
          generateLastBuildDirInfo(lastBuildDirInfo, entry, '1');
          generateLastBuildDirInfo(onlineRepoDirInfo, entry, '2');
          break;
      }
    });
    ctx.body = {
      errCode: 0,
      errMsg: 'success',
      data: {
        left: lastBuildDirInfo,
        right: onlineRepoDirInfo,
        diffSet: diffSet
      }
    };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}