import Router from 'koa-router';

import * as controller from './deploy.controller.js';

const router = new Router();

router.get('/:id', controller.getDeplyInfoById);
router.get('/project/:id', controller.getDeplyInfoByProjectId);
router.post('/project/:id', controller.addDeployInfoByProjectId);
router.get('/project/:pid/build/:bid', controller.getDeplyInfoByProjectAndBuildId);

export default router;