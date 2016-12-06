import Router from 'koa-router';
import projectRouter from './api/project';

const router = new Router();

router.use('/api/projects', projectRouter.routes(), projectRouter.allowedMethods());

export default router;