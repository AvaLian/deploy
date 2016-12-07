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
        <el-card class="project_item_wrapper">
          <li class='project_item'>
            {item.name}
          </li>
        </el-card>
      );
    });

    return (
      <ul class="project_list">
        {items}
      </ul>
    );
  }
}