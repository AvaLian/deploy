import './index.css';

import router from '../../router';

export default {
  name: 'build-record',
  data () {
    return {
      currentHighlight: 0
    }
  },
  props: {
    buildRecord: {
      type: Object
    }
  },
  methods: {
    changeHighlight (i, e) {
      const lineNum = i + 1;
      router.replace({ query: { L: lineNum }});
      this.setHighlight(lineNum)
    },

    setHighlight (lineNum) {
      this.currentHighlight = lineNum;
    }
  },
  mounted () {
    const lineNum = parseInt(this.$route.query.L, 10);
    this.setHighlight(lineNum);
  },
  render (h) {
    const recordLog = (this.buildRecord.record || '').split('\n');
    const items = recordLog.map((item, i) => {
      return (
        <p class={{ build_record_line: true, highlight: (this.currentHighlight === (i + 1)), error: this.buildRecord.errorLine === i }}><a href="javascript:;" onClick={this.changeHighlight.bind(null, i)} class="build_record_line_num"></a>{item}</p>
      );
    });
    return (
      <div class="build_record">
        {items}
      </div>
    );
  }
};