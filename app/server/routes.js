import Router from 'koa-router';
import projectRouter from './api/project';
import buildRouter from './api/build';
import markRouter from './api/mark';
import dirDiffRouter from './api/dirDiff';
import fileDiffRouter from './api/fileDiff';
import deployRouter from './api/deploy';

const router = new Router();

router.use('/api/projects', projectRouter.routes(), projectRouter.allowedMethods());
router.use('/api/builds', buildRouter.routes(), buildRouter.allowedMethods());
router.use('/api/marks', markRouter.routes(), markRouter.allowedMethods());
router.use('/api/dirDiffs', dirDiffRouter.routes(), dirDiffRouter.allowedMethods());
router.use('/api/fileDiffs', fileDiffRouter.routes(), fileDiffRouter.allowedMethods());
router.use('/api/deploys', deployRouter.routes(), deployRouter.allowedMethods());

export default router;