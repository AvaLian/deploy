import './index.css';

export default {
  name: 'code-show',
  props: {
    codeData: Array
  },
  render (h) {
    const codeData = this.codeData || [];
    const text = codeData.map(item => {
      return (
        <div class={{ 'highlight': item.different, 'code_show_line': true }} domPropsInnerHTML={ item.code }>
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