import fse from 'fs-extra';
import path from 'path';
import shelljs from 'shelljs';
import simpleGit from 'simple-git';
import jsBeautify from 'js-beautify';
import hljs from 'highlight.js';

import Project from './project.model.js';
import { addBuildRecord } from '../build/build.controller.js';
import { findDirDiffByBuildId, changeDirDiffByBuildId } from '../dirDiff/dirDiff.controller.js';
import { findFileDiffByBuildId, changeFileDiffByBuildId } from '../fileDiff/fileDiff.controller.js';
import config from '../../config';
import { regexps, transform2DataURI, checksum, readJsonFile } from '../../utils';

async function getNewestRepo (repo, repoPath) {
  let res = 0; // 0 表示拉取成功
  if (fse.existsSync(repoPath) && fse.existsSync(path.join(repoPath, '.git'))) { // 是一个git项目
    await new Promise((resolve, reject) => {
      simpleGit(repoPath).fetch({'--all': true}, err => {  // 更新所有分支代码
        if (err) {
          res = 1; // 失败
          return reject(err);
        }
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
    }).catch((err) => console.log(err));
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
      simpleGit(sourceRepoPath).log((err, log) => {
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
    const appConf = require(path.join(sourceRepoPath, 'app-conf.js'));
    const moduleList = appConf.moduleList;
    let sourceMap = {};
    moduleList.forEach(item => {
      const mPath = path.join(sourceRepoPath, item);
      const mapJsonPath = path.join(mPath, 'dist', 'map.json');
      const mapJson = readJsonFile(mapJsonPath);
      sourceMap[item] = mapJson
    });
    sourceMap = JSON.stringify(sourceMap);

    const buildEndTime = new Date().getTime();
    const buildRecord = {
      record: buildLog,
      status: buildStatus,
      errorLine: errorLine,
      operator: '',
      sourceMap,
      project: project._id
    };
    const newBuild = await addBuildRecord(buildRecord);
    project.lastBuildDate = new Date;
    project.buildDuration = buildEndTime - buildStartTime;
    project.buildCount = isNaN(project.buildCount) ? 0 : project.buildCount;
    project.buildStatus = buildStatus;
    project.buildCount++;
    project.lastBuildId = newBuild._id;
    await project.save();
    // 编译完后需要移出到根目录
    shelljs.cd(config.root);
    ctx.body = {
      errCode: 0,
      errMsg: 'success',
      data: newBuild
    };
  } catch (err) {
    ctx.throw(422, err.message);
  }
}

function getFileInfo (fileName, filePath) {
  let fileContent = '';
  let fileInfo = {};
  fileInfo.exists = false;
  if (fileName && fse.existsSync(filePath) && fse.statSync(filePath).isFile()) { // 編譯后的文件中有此文件
    fileInfo.exists = true;
    let fileType = path.extname(filePath).replace(/^\./, '');
    if (regexps.images.test(fileType)) { // 是图片
      fileContent = checksum(fse.readFileSync(filePath), 16);
      fileInfo.type = 'image';
    } else if (regexps.media.test(fileType)) { // 是其他多媒体文件
      fileContent = checksum(fse.readFileSync(filePath), 16);
      fileInfo.type = 'media';
    } else {
      const beautifyOptions = { indent_size: 2 };
      fileContent = getBeautifyMethod(fileType)(String(fse.readFileSync(filePath)), beautifyOptions);
      fileContent = hljs.highlight(fileType, fileContent, true).value;
      fileInfo.type = 'normal';
    }
  }
  fileInfo.content = fileContent;
  return fileInfo;
}

export async function getOnlineDiff (ctx) {
  const id = ctx.params.id;
  const query = ctx.query;
  try {
    let project = await Project.findById(id);
    const onlineRepo = project.onlineRepo;
    const buildId = project.lastBuildId;
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
    // 判断diff的是文件还是项目目录
    if ('left' in query || 'right' in query) {
      const left = query.left || ''; // 左側文件
      const right = query.right || ''; // 右側文件
      const compareFile = left || right || '';
      const fileDiffFromMemory = await findFileDiffByBuildId(buildId, left || right);
      let diffInfo = {
        total: 0
      };
      let diffSet = [];
      if (!fileDiffFromMemory) {
        const leftFilePath = path.join(lastBuildResultDir, left);
        const rightFilePath = path.join(onlineRepoDir, right);
        const leftFileInfo = getFileInfo(left, leftFilePath);
        const rightFileInfo = getFileInfo(right, rightFilePath);
        const leftFileContent = leftFileInfo.content;
        const rightFileContent = rightFileInfo.content;
        if (!leftFileInfo.exists && !rightFileInfo.exists) {
          ctx.body = {
            errCode: 101,
            errMsg: '傳入的文件地址有誤，請檢查！'
          };
          return;
        }
        // 比较普通文件
        if (leftFileInfo.type === 'normal' || rightFileInfo.type === 'normal') {
          const jsdiff = require('diff');
          diffSet = jsdiff.diffLines(rightFileContent, leftFileContent);
          // 处理一下diff结果
          for (let i = 0; i < diffSet.length; i++) {
            const current = diffSet[i];
            const next = diffSet[i + 1];
            const prev = diffSet[i - 1];
            let charsDiff;
            if (current.added && !current.both) {
              if (!prev || !prev.removed) {
                diffInfo.total += 1;
              }
              if (next && next.removed) {
                current.both = true;
                next.both = true;
                if (current.count === next.count) {
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
              }
            } else if (current.removed && !current.both) {
              diffInfo.total += 1;
              if (next && next.added) {
                current.both = true;
                next.both = true;
                if (current.count === next.count) {
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
          }
        } else {
          const leftLength = leftFileContent.length;
          const rightLength = rightFileContent.length;
          let diffRet1 = {
            value: `${config.projectBuildStatic}/${id}/${path.join(`${id}_source`, '.temp', appConf.app, left)}`,
            count: 1
          };
          let diffRet2 = {
            value: `${config.projectBuildStatic}/${id}/${path.join(`${id}_online`, right)}`,
            count: 1
          };
          if (leftLength === 0) {
            diffRet2.removed = true;
            diffRet2.type = rightFileInfo.type;
            diffSet.push(diffRet2);
            diffInfo.total = 1;
          } else if (rightLength === 0) {
            diffRet1.added = true;
            diffRet1.type = leftFileInfo.type;
            diffSet.push(diffRet1);
            diffInfo.total = 1;
          } else if (leftFileContent !== rightFileContent) {
            diffRet1.added = true;
            diffRet2.removed = true;
            diffRet1.type = leftFileInfo.type;
            diffRet2.type = rightFileInfo.type;
            diffSet.push(diffRet1);
            diffSet.push(diffRet2);
            diffInfo.total = 1;
          } else if (leftFileContent === rightFileContent) {
            diffRet1.type = leftFileInfo.type;
            diffSet.push(diffRet1);
          }
        }
        // 将文件diff差异个数写入dirDiff中
        const dirDiffFromMemory = await findDirDiffByBuildId(buildId);
        if (dirDiffFromMemory) {
          const dirDiffSet = JSON.parse(dirDiffFromMemory.diff);
          dirDiffSet.forEach(item => {
            if (item.fullname === (left || right)) {
              item.fileDiffCount = diffInfo.total;
            }
          });
          await changeDirDiffByBuildId(buildId, JSON.stringify(dirDiffSet));
        }
        await changeFileDiffByBuildId(buildId, left || right, JSON.stringify(diffSet), JSON.stringify(diffInfo));
      } else {
        diffSet = JSON.parse(fileDiffFromMemory.diff);
        diffInfo = JSON.parse(fileDiffFromMemory.info);
      }
      ctx.body = {
        errCode: 0,
        errMsg: 'success',
        data: {
          diffSet,
          diffInfo
        }
      };
    } else {
      const dirDiffFromMemory = await findDirDiffByBuildId(buildId);
      let diffSet;
      if (!dirDiffFromMemory) {
        const dirCompare = require('dir-compare');
        const options = {
          compareContent: true,
          excludeFilter: '.git,node_modules,.DS_Store'
        };
        const compareResult = dirCompare.compareSync(lastBuildResultDir, onlineRepoDir, options);
        diffSet = compareResult.diffSet;
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
        await changeDirDiffByBuildId(buildId, JSON.stringify(diffSet));
      } else {
        diffSet = JSON.parse(dirDiffFromMemory.diff);
      }
      
      ctx.body = {
        errCode: 0,
        errMsg: 'success',
        data: {
          diffSet: diffSet
        }
      };
    }
  } catch (err) {
    ctx.throw(422, err.message);
  }
}