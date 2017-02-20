import Router from 'koa-router';

import * as controller from './log.controller.js';

const router = new Router();

router.get('/', controller.getAllLogs);
router.get('/project/:pid', controller.getProjectLogs);

export default router;