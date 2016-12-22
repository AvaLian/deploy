import './index.css';

import { fomatDate } from '../../filters';

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
          <div class="project_item_info">
            <h4 class="project_item_title"><span class="project_item_status"></span><router-link to={`/projectList/${item._id}`} exact>{item.name}</router-link></h4>
            <p class="project_item_buildtime">编译时间:{fomatDate(item.lastBuildDate) || '-'}</p>
            <p class="project_item_buildduration">编译耗时:{item.buildDuration || '-'}</p>
          </div>
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