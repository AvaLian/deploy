import fse from 'fs-extra';
import path from 'path';
import shelljs from 'shelljs';
import simpleGit from 'simple-git';
import Deploy from './deploy.model.js';
import Project from '../project/project.model.js';
import config from '../../config';

export async function getDeplyInfoById (ctx) {
  try {
    const id = ctx.params.id;
    const deploy = await Deploy.findById(id);
    ctx.body = { errCode: 0, errMsg: 'success', data: deploy };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}

export async function getDeplyInfoByProjectId (ctx) {
  try {
    const pid = ctx.params.id;
    const deploys = await Deploy.find({ project: pid });
    ctx.body = { errCode: 0, errMsg: 'success', data: deploys };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}

export async function addDeployInfoByProjectId (ctx) {
  const pid = ctx.params.id;
  const body = ctx.request.body;
  const bid = body.buildId;
  const files = body.files;
  const repoDir = path.join(config.root, config.repoDir, pid);
  const sourceRepo = path.join(repoDir, `${pid}_source`);
  const appConf = require(path.join(sourceRepo, 'app-conf.js'));
  const lastBuildResultDir = path.join(sourceRepo, '.temp', appConf.app);
  const onlineRepoDir = path.join(repoDir, `${pid}_online`);
  if (!files || files.length === 0) {
    ctx.body = { errCode: 1, errMsg: '文件列表为空，上线失败' };
    return;
  }
  try {
    // 将文件拷贝到上线池中
    const deployFiles = files.map(item => {
      const filePath = path.join(lastBuildResultDir, item);
      const onlineFilePath = path.join(onlineRepoDir, item);
      if (fse.existsSync(filePath)) {
        fse.copySync(filePath, path.join(onlineRepoDir, item));
        return onlineFilePath;
      }
    }).filter(item => item);
    let res = 0;
    // 源码池最新提交
    const log = await new Promise((resolve, reject) => {
      simpleGit(sourceRepo).log(function (err, log) {
        if (err) {
          return reject(err);
        }
        resolve(log);
      });
    }).catch(err => console.log(err));
    let lastCommit = {};
    if (log) {
      const latest = log.latest;
      lastCommit.message = latest.message;
      lastCommit.author = latest.author_name;
      lastCommit.date = latest.date;
      lastCommit.hash = latest.hash;
    }
    // 提交上线池，并打上tag
    await new Promise((resolve, reject) => {
      simpleGit(onlineRepoDir).add(deployFiles, err => {
        if (err) {
          res = 1;
          return reject(err);
        }
        resolve();
      }).commit(`[Commit from deploy-manage]${lastCommit.message}`, err => {
        if (err) {
          res = 1;
          return reject(err);
        }
        resolve();
      }).push('origin', 'master', err => {
        if (err) {
          res = 1;
          return reject(err);
        }
        resolve();
      });
    }).catch(err => console.log(err));

    if (res !== 0) {
      ctx.body = { errCode: 2, errMsg: '内部出错，请重试！' };
      return;
    }
    
    const deploy = new Deploy({
      build: bid,
      project: pid,
      operator: '',
      time: new Date(),
      files: deployFiles
    });
    deploy.save();
    ctx.body = { errCode: 0, errMsg: 'success', data: deploy };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}

export async function getDeplyInfoByProjectAndBuildId (ctx) {
  try {
    const pid = ctx.params.pid;
    const bid = ctx.params.bid;
    const deploy = await Deploy.findOne({ project: pid, build: bid });
    ctx.body = { errCode: 0, errMsg: 'success', data: deploy };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}