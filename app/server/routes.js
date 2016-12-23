import Router from 'koa-router';
import projectRouter from './api/project';
import buildRouter from './api/build';

const router = new Router();

router.use('/api/projects', projectRouter.routes(), projectRouter.allowedMethods());
router.use('/api/builds', buildRouter.routes(), buildRouter.allowedMethods());

export default router;