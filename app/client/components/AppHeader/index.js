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
          name: '首页'
        },
        {
          type: 'projectList',
          link: '/projectList',
          name: '项目'
        },
        {
          type: 'records',
          link: '/records',
          name: '操作记录'
        }
      ]
    }
  },
  render(h) {
    const items = this.nav.map(item => {
      return (
        <li class={{header_nav_item: true}}>
          <router-link to={item.link} active-class="active" class="header_nav_link" exact>
            {item.name}
          </router-link>
        </li>
      );
    });
    return (
      <header class="header">
        <h1 class="header_title">统一上线平台</h1>
        <nav class="header_nav">
          <ul class="header_nav_list">
            {items}
          </ul>
        </nav>
      </header>
    )
  }
};