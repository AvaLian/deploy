import './index.css';

export default {
  name: 'build-record',
  props: {
    buildRecord: {
      type: Object
    }
  },
  render(h) {
    let recordLog = this.buildRecord.record || '';
    let htmlStr = '';
    recordLog = recordLog.split('\n');
    recordLog.forEach(function (item) {
      htmlStr += `<p class="build_record_line">${item}</p>`;
    });
    return (
      <div class="build_record" domPropsInnerHTML={htmlStr}>
      </div>
    );
  }
};