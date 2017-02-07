import Router from 'koa-router';
import projectRouter from './api/project';
import buildRouter from './api/build';
import markRouter from './api/mark';

const router = new Router();

router.use('/api/projects', projectRouter.routes(), projectRouter.allowedMethods());
router.use('/api/builds', buildRouter.routes(), buildRouter.allowedMethods());
router.use('/api/marks', markRouter.routes(), markRouter.allowedMethods());

export default router;