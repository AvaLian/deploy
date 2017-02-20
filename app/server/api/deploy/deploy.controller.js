import fse from 'fs-extra';
import path from 'path';
import shelljs from 'shelljs';
import simpleGit from 'simple-git';
import Deploy from './deploy.model';
import Project from '../project/project.model';
import { createLog } from '../log/log.controller';
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
    const deploys = await Deploy.find({ project: pid }).populate('build').sort({ time: 'desc' });
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
      const fullname = item.fullname;
      const filePath = path.join(lastBuildResultDir, fullname);
      const onlineFilePath = path.join(onlineRepoDir, fullname);
      if (fse.existsSync(filePath)) {
        fse.copySync(filePath, path.join(onlineRepoDir, fullname));
        return item;
      }
    }).filter(item => item);
    const deployFilePaths = deployFiles.map(item => {
      const fullname = item.fullname;
      return path.join(onlineRepoDir, fullname);
    });
    let res = 0;
    // 源码池最新提交
    const sourceLog = await new Promise((resolve, reject) => {
      simpleGit(sourceRepo).log((err, log) => {
        if (err) {
          return reject(err);
        }
        resolve(log);
      });
    }).catch(err => console.log(err));
    let lastCommit = {};
    let message = '[Commit from deploy-manage]';
    if (sourceLog && sourceLog.latest) {
      const latest = sourceLog.latest;
      lastCommit.message = latest.message;
      lastCommit.author = latest.author_name;
      lastCommit.date = latest.date;
      lastCommit.hash = latest.hash;
      message = `[Commit from deploy-manage]${lastCommit.message}`;
    }
    // 提交上线池，并打上tag
    const deployLog = await new Promise((resolve, reject) => {
      simpleGit(onlineRepoDir).add(deployFilePaths, err => {
        if (err) {
          res = 1;
          return reject(err);
        }
      }).commit(message, err => {
        if (err) {
          res = 1;
          return reject(err);
        }
      }).push('origin', 'master', err => {
        if (err) {
          res = 1;
          return reject(err);
        }
      }).log((err, log) => {
        if (err) {
          return reject(err);
        }
        resolve(log);
      });
    }).catch(err => console.log(err));
    let commitId = '';
    if (deployLog && deployLog.latest) {
      commitId = deployLog.latest.hash;
    }
    if (res !== 0) {
      // 上线操作写入操作日志中
      await createLog(pid, 'deploy', JSON.stringify({
        record: [],
        status: res
      }));
      ctx.body = { errCode: 2, errMsg: '内部出错，请重试！' };
      return;
    }
    
    const deploy = new Deploy({
      build: bid,
      project: pid,
      time: new Date(),
      commitId,
      message,
      files: deployFiles
    });
    deploy.save();
    // 上线操作写入操作日志中
    await createLog(pid, 'deploy', JSON.stringify({
      record: deployFiles,
      status: res
    }));
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