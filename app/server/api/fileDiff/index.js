import Router from 'koa-router';

import * as controller from './fileDiff.controller.js';

const router = new Router();

router.get('/build/:id', controller.getFileDiffByBuildId);

export default router;