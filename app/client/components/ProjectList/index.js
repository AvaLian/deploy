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
        <li class='project_list_item'>
          {item.name}
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