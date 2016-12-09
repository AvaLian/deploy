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
          <div class="project_info">
            <h4 class="project_title"><span class="project_status"></span><router-link to={`/projectList/${item._id}`} exact>{item.name}</router-link></h4>
            <p class="project_buildtime">编译时间:{item.lastBuildDate || '-'}</p>
            <p class="project_buildduration">编译耗时:{item.buildDuration || '-'}</p>
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