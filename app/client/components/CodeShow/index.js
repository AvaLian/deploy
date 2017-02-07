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
      this.$emit('toggleMask', item.checked, i);
    }
  },
  render (h) {
    const codeData = this.codeData || [];
    const codeMark = this.codeMark || [];
    let lastLineType = '';
    const text = codeData.map((item, i) => {
      item.checked = codeMark.indexOf(i) >= 0 ? true : false;
      const checkButton = (item.different && lastLineType !== item.type) ? <input type="checkbox" class="code_show_check" domPropsChecked={ item.checked } onClick={ this.check.bind(this, item, i) } /> : '';
      lastLineType = item.type;
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