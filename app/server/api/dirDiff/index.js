import Router from 'koa-router';

import * as controller from './dirDiff.controller.js';

const router = new Router();

router.get('/build/:id', controller.getDirDiffByBuildId);

export default router;