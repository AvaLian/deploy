import Router from 'koa-router';

import * as controller from './project.controller.js';

const router = new Router();

router.get('/', controller.getAllProjects);
router.post('/add', controller.addProject);

export default router;