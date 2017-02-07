import Router from 'koa-router';

import * as controller from './mark.controller.js';

const router = new Router();

router.get('/build/:id', controller.getMarksByBuildId);
router.post('/build/:id', controller.changeMarksByBuildId);

export default router;