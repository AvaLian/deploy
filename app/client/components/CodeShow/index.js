import './index.css';

export default {
  name: 'code-show',
  props: {
    codeData: Array
  },
  methods: {
    check (item) {
      item.checked = !item.checked;
    }
  },
  render (h) {
    const codeData = this.codeData || [];
    const text = codeData.map(item => {
      item.checked = false;
      const checkButton = item.different ? <input type="checkbox" class="code_show_check" domPropsChecked={ item.checked } onClick={ this.check.bind(this, item) } /> : '';
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