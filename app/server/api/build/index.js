import Router from 'koa-router';

import * as controller from './build.controller.js';

const router = new Router();

router.get('/', controller.getAllBuildRecords);
router.get('/project/:id', controller.getBuildRecordByProjectId);

export default router;