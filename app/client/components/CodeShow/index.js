import './index.css';

export default {
  name: 'code-show',
  props: {
    codeData: Array,
    codeMark: Array
  },
  methods: {
    check (item, i) {
      item.checked = !item.checked;
      this.$emit('addMask', item.checked, i);
    }
  },
  render (h) {
    const codeData = this.codeData || [];
    const codeMark = this.codeMark || [];
    const text = codeData.map((item, i) => {
      item.checked = codeMark.indexOf(i) >= 0 ? true : false;
      const checkButton = item.different ? <input type="checkbox" class="code_show_check" domPropsChecked={ item.checked } onClick={ this.check.bind(this, item, i) } /> : '';
      return (
        <div class={{ 'highlight': item.different, 'code_show_line': true, [item.type]: true }}>
          {checkButton}
          <span class="code_show_line_num"></span><span domPropsInnerHTML={ item.code }></span>
        </div>
      );
    });

    return (
      <pre class="code_show">
        <code>{text}</code>
      </pre>
    );
  }
}