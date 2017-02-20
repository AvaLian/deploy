<template>
  <div class="log_list">
    <el-card class="log_card" v-for="log in logs">
      <div slot="header" class="clearfix log_card_head">
        <p class="log_card_head_info">{{log.operator}}{{log.operate}}了项目<router-link class="log_card_head_project" :to="`/projectList/${log.project._id}`">{{log.project.name}}</router-link></p>
        <p class="log_card_head_time">于{{log.time | fomatDate}}</p>
      </div>
      <div class="log_card_body">
        {{log.message2}}
      </div>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'log-list',
    props: {
      logList: Array
    },
    data () {
      return {
        operateMap: {
          build: '编译',
          deploy: '上线'
        },
        buildStatusArr: ['编译中', '编译成功', '编译失败'],
        deployStatusArr: ['上线成功', '上线失败']
      }
    },
    computed: {
      logs () {
        return this.logList.map(log => {
          let item = {};
          item.operator = log.operator;
          item.operate = this.operateMap[log.type];
          item.project = log.project;
          item.time = log.time;
          const info = JSON.parse(log.info);
          item.record = info.record;
          switch (log.type) {
            case 'build':
              item.message1 = '编译结果：';
              item.message2 = this.buildStatusArr[info.status];
              break;
            case 'deploy':
              item.message1 = '影响了文件：';
              item.message2 = this.deployStatusArr[info.status];
              break;
          }
          return item;
        });
      }
    }
  };
</script>

<style>
  .log_card {
    margin-bottom: 12px;
  }
  .log_card_head_info {
    float: left;
  }
  .log_card_head_time {
    float: right;
    font-size: 12px;
  }
  .log_card_head_project {
    color: #20A0FF;
  }
</style>