import Vue from 'vue';
import Router from 'vue-router';
import Home from '../views/Home';
import Projects from '../views/Projects';
import Project from '../views/Project';
import Log from '../views/Log';

Vue.use(Router);

const router =  new Router({
  mode: 'hash',
  routes: [
    {
      path: '/',
      component: Home,
      meta: {
        title: '统一上线平台'
      }
    },
    {
      path: '/projectList',
      component: Projects,
      meta: {
        title: '统一上线平台 - 项目列表'
      }
    },
    {
      path: '/projectList/:id',
      component: Projects,
      children: [
        {
          path: '',
          component: Project
        }
      ],
      meta: {
        title: '统一上线平台 - 项目详情'
      }
    },
    {
      path: '/logs',
      component: Log,
      meta: {
        title: '统一上线平台 - 操作日志'
      }
    },
  ]
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '统一上线平台';
  next();
});

export default router;