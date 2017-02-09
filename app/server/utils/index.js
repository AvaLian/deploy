import path from 'path';
import fs from 'fs';
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
    uri = 'data:image/' + path.extname(filename).substr(1) + ';base64,' + fs.readFileSync(filename).toString('base64');
  } catch (e) {
    uri = filename;
  }
  return uri;
}