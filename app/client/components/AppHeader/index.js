import './index.css';

export default {
  name: 'app-header',
  props: [
    'activeNav'
  ],
  data() {
    return {
      nav: [
        {
          type: 'home',
          link: '/',
          name: '首页',
          exact: true
        },
        {
          type: 'projectList',
          link: '/projectList',
          name: '项目',
          exact: false
        },
        {
          type: 'logs',
          link: '/logs',
          name: '操作日志',
          exact: false
        }
      ]
    }
  },
  render(h) {
    const items = this.nav.map(item => {
      return (
        <li class={{header_nav_item: true}}>
          <router-link to={item.link} active-class="active" class="header_nav_link" exact={item.exact}>
            {item.name}
          </router-link>
        </li>
      );
    });
    return (
      <header class="header">
        <h1 class="header_title"><router-link to="/" class="header_title_link" exact>统一上线平台</router-link></h1>
        <nav class="header_nav">
          <ul class="header_nav_list">
            {items}
          </ul>
        </nav>
      </header>
    )
  }
};