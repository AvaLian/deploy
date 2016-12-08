import path from 'path';

export default {
  port: process.env.PORT || 5000,
  root: path.resolve(__dirname, '../../../../'),
  repoDir: '.repos'
}