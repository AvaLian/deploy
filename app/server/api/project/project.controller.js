import fse from 'fs-extra';
import path from 'path';
import shelljs from 'shelljs';
import simpleGit from 'simple-git';
import jsBeautify from 'js-beautify';
import hljs from 'highlight.js';

import Project from './project.model.js';
import { addBuildRecord } from '../build/build.controller.js';
import config from '../../config';

async function getNewestRepo (repo, repoPath) {
  let res = 0; // 0 表示拉取成功
  if (fse.existsSync(repoPath) && fse.existsSync(path.join(repoPath, '.git'))) { // 是一个git项目
    await new Promise((resolve, reject) => {
      simpleGit(repoPath).fetch({'--all': true}, err => {  // 更新所有分支代码
        if (err) {
          res = 1; // 失败
          return reject(err);
        }
        resolve();
      }).reset(['--hard', 'origin/master'], err => {
        if (err) {
          res = 1; // 失败
          return reject(err);
        }
        resolve();
      });
    });
  } else {
    fse.removeSync(repoPath);
    await new Promise((resolve, reject) => {
      simpleGit().clone(repo, repoPath, err => {
        if (err) {
          res = 1; // 失败
          return reject(err);
        }
        resolve();
      });
    }).catch(function (err) {
      console.log(err);
    });
  }
  return res;
}

function getBeautifyMethod (type) {
  if (/css/.test(type)) {
    return jsBeautify.css;
  } else if (/js/.test(type)) {
    return jsBeautify;
  } else if (/html/.test(type)) {
    return jsBeautify.html;
  } else {
    return function (str) {
      return str;
    }
  }
}

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
    let getNewResult = await getNewestRepo(sourceRepo, sourceRepoPath);
    if (getNewResult === 1) {
      ctx.body = {
        errCode: 100,
        errMsg: '代码拉取错误，请重试！'
      };
      return;
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
    let getNewResult = await getNewestRepo(sourceRepo, sourceRepoPath);
    if (getNewResult === 1) {
      buildStatus = 2;
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
  try {
    let project = await Project.findById(id);
    const onlineRepo = project.onlineRepo;
    const repoDir = path.join(config.root, config.repoDir, id);
    const sourceRepo = path.join(repoDir, `${id}_source`);
    const appConf = require(path.join(sourceRepo, 'app-conf.js'));
    const lastBuildResultDir = path.join(sourceRepo, '.temp', appConf.app);
    const onlineRepoDir = path.join(repoDir, `${id}_online`);
    // 先拉取一下onlineRepo的最新代码
    let getNewResult = await getNewestRepo(onlineRepo, onlineRepoDir);
    if (getNewResult === 1) {
      ctx.body = {
        errCode: 100,
        errMsg: '代码拉取错误，请重试！'
      };
      return;
    }
    if ('left' in query || 'right' in query) {
      const left = query.left || ''; // 左側文件
      const right = query.right || ''; // 右側文件
      const leftFilePath = path.join(lastBuildResultDir, left);
      const rightFilePath = path.join(onlineRepoDir, right);
      let leftFileContent = '';
      let rightFileContent = '';
      const beautifyOptions = { indent_size: 2 };
      if (left && fse.existsSync(leftFilePath) && fse.statSync(leftFilePath).isFile()) { // 編譯后的文件中有此文件
        let fileType = path.extname(leftFilePath).replace(/^\./, '');
        leftFileContent = getBeautifyMethod(fileType)(String(fse.readFileSync(leftFilePath)), beautifyOptions);
        leftFileContent = hljs.highlight(fileType, leftFileContent, true).value;
      }
      if (right && fse.existsSync(rightFilePath) && fse.statSync(rightFilePath).isFile()) { // 基線版本中沒有此文件
        let fileType = path.extname(rightFilePath).replace(/^\./, '');
        rightFileContent = getBeautifyMethod(fileType)(String(fse.readFileSync(rightFilePath)), beautifyOptions);
        rightFileContent = hljs.highlight(fileType, rightFileContent, true).value;
      }
      
      if (leftFileContent.length === 0 && rightFileContent === 0) {
        ctx.body = {
          errCode: 101,
          errMsg: '傳入的文件地址有誤，請檢查！'
        };
        return;
      }
      const jsdiff = require('diff');
      const diffResult = jsdiff.diffLines(rightFileContent, leftFileContent);
      // 处理一下diff结果
      for (let i = 0; i < diffResult.length; i++) {
        const current = diffResult[i];
        const next = diffResult[i + 1];
        let charsDiff;
        if (current.added && !current.both) {
          if (next && next.removed && current.count === next.count) {
            current.both = true;
            next.both = true;
            charsDiff = jsdiff.diffChars(next.value, current.value);
            let nextCharsCollection = [];
            let currentCharsCollection = [];
            charsDiff.forEach(s => {
              if (s.added) {
                currentCharsCollection.push(`<span class="char_highlight added">${s.value}</span>`);
              } else if (s.removed) {
                nextCharsCollection.push(`<span class="char_highlight removed">${s.value}</span>`);
              } else if (!s.added && !s.removed) {
                nextCharsCollection.push(s.value);
                currentCharsCollection.push(s.value);
              }
            });
            next.value = nextCharsCollection.join('');
            current.value = currentCharsCollection.join('');
          }
        } else if (current.removed && !current.both) {
          if (next && next.added && current.count === next.count) {
            current.both = true;
            next.both = true;
            charsDiff = jsdiff.diffChars(current.value, next.value);
            let nextCharsCollection = [];
            let currentCharsCollection = [];
            charsDiff.forEach(s => {
              if (s.added) {
                nextCharsCollection.push(`<span class="char_highlight added">${s.value}</span>`);
              } else if (s.removed) {
                currentCharsCollection.push(`<span class="char_highlight removed">${s.value}</span>`);
              } else if (!s.added && !s.removed) {
                nextCharsCollection.push(s.value);
                currentCharsCollection.push(s.value);
              }
            });
            next.value = nextCharsCollection.join('');
            current.value = currentCharsCollection.join('');
          }
        }
      }
      ctx.body = {
        errCode: 0,
        errMsg: 'success',
        data: {
          diffSet: diffResult
        }
      };
    } else {
      const dirCompare = require('dir-compare');
      const options = {
        compareContent: true,
        excludeFilter: '.git,node_modules,.DS_Store'
      };
      const compareResult = dirCompare.compareSync(lastBuildResultDir, onlineRepoDir, options);
      const diffSet = compareResult.diffSet;
      const lastBuildDirInfo = [];
      const onlineRepoDirInfo = [];
      function generateLastBuildDirInfo (infoArr, entry, different, pos) {
        entry.fullname = entry.relativePath + '/' + entry[`name${different}`];
        if (entry.level === 0) {
          infoArr.push({
            name: entry[`name${different}`],
            type: entry[`type${different}`],
            relative: entry.relativePath,
            pos,
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
                    pos,
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
      diffSet.forEach(entry => {
        switch (entry.state) {
          case 'left':  // 只有左边有
            generateLastBuildDirInfo(lastBuildDirInfo, entry, '1', 'left');
            break;
          case 'right':
            generateLastBuildDirInfo(onlineRepoDirInfo, entry, '2', 'right');
            break;
          case 'equal':
            generateLastBuildDirInfo(lastBuildDirInfo, entry, '1', 'equal');
            generateLastBuildDirInfo(onlineRepoDirInfo, entry, '2', 'equal');
            break;
          case 'distinct':
            generateLastBuildDirInfo(lastBuildDirInfo, entry, '1', 'distinct');
            generateLastBuildDirInfo(onlineRepoDirInfo, entry, '2', 'distinct');
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
    }
  } catch (err) {
    ctx.throw(422, err.message);
  }
}