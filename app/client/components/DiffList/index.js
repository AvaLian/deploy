import './index.css';

export default {
  name: 'diff-list',
  props: {
    diffSet: Array
  },
  methods: {
    onFileClick (entry) {
      this.$emit('fileClick', entry);
    }
  },
  render (h) {
    const diffSet = this.diffSet || [];
    const items = diffSet.map(entry => {
      if (entry.state !== 'equal' && (entry.type1 === 'file' || entry.type2 === 'file')) {
        const state = {
          'left' : '新增',
          'right' : '删除',
          'distinct' : '修改'
        }[entry.state];
        const txt = `${state}文件${entry.fullname}`;
        return (
          <li class="file_diff_item"><a href="javascript:;" onClick={this.onFileClick.bind(this, entry)}>{txt}</a></li>
        );
      }
    }).filter(item => typeof item !== 'undefined');
    return (
      <ul class="file_diff">
        {items}
      </ul>
    );
  }
};