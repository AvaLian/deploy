import path from 'path';
import fse from 'fs-extra';
import crypto from 'crypto';

export const regexps = {
  images: /\.?(jpeg|jpg|gif|png|webp|ico)$/,
  media: /\.?(mp3|mp4|oog|wav|eot|svg|ttf|woff)$/
};

export function checksum (buf, length) {
  if (!Buffer.isBuffer(buf)) {
    buf = new Buffer(buf);
  }
  return crypto.createHash('md5').update(buf).digest('hex').slice(0, length || 8);
}

export function transform2DataURI (filename) {
  let uri;
  try {
    uri = 'data:image/' + path.extname(filename).substr(1) + ';base64,' + fse.readFileSync(filename).toString('base64');
  } catch (e) {
    uri = filename;
  }
  return uri;
}

export function readJsonFile (fPath) {
  let json = {};
  if (fse.existsSync(fPath)) {
    try {
      json = JSON.parse(fse.readFileSync(fPath));
    } catch (ex) {
      console.log(chalk.red('读取文件' + fPath + '失败...！文件可能不存在，或有语法错误，请检查！'));
      json = {};
    }
  }
  return json;
}