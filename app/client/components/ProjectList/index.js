import './index.css';

export default {
  name: 'project-list',
  props: {
    projectList: {
      type: Array
    }
  },
  render(h) {
    let projectList = this.projectList || [];
    const items = projectList.map(item => {
      return (
        <li class='project_item'>
          <el-card class="project_item_wrapper">
            <div slot="header" class="clearfix">
              <span>{item.name}</span>
              <router-link to={'/projectList/' + item._id} exact>查看详情</router-link>
            </div>
            <section class="project_item_main">
              <h3 class="project_item_main_alias">{item.alias}</h3>
              <div class="project_item_main_info">

              </div>
            </section>
          </el-card>
        </li>
      );
    });

    return (
      <ul class="project_list">
        {items}
      </ul>
    );
  }
}