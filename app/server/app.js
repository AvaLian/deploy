import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import convert from 'koa-convert';
import logger from 'koa-logger';
import mongoose from 'mongoose';
import mount from 'koa-mount';
import serve from 'koa-static';
import cors from 'kcors';

import config from './config';
import { errorMiddleware } from './middleware';
import router from './routes';

const app = new Koa();

app.keys = [config.session];

mongoose.Promise = global.Promise
mongoose.connect(config.database);

app.use(cors());
app.use(convert(logger()));
app.use(bodyParser());
app.use(errorMiddleware());

app.use(convert(mount('/docs', serve(`${process.cwd()}/docs`))));

app.use(router.routes());

app.listen(config.port, () => {
  console.log(`Server started on ${config.port}`);
});