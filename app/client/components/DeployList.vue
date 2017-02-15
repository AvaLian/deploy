<template>
  <el-collapse v-model="activeNames">
    <el-collapse-item v-for="(item, i) in list" :name="i" class="deploy_item">
      <template slot="title">
        {{item.message}}<span class="deploy_item_time">{{item.time | fomatDate}}</span>
      </template>
      <div class="deploy_item_info">
        <div><span class="deploy_item_info_operator">操作人：{{item.operator}}</span><span>md5：<a :href="project.onlineRepo" target="_blank">{{item.commitId}}</a></span></div>
        <div v-show="item.files.length">
          <p>改动文件：</p>
          <ul>
            <li v-for="file in item.files">{{ stateTypes[file.state] }}文件：{{file.fullname}}</li>
          </ul>
        </div>
      </div>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
  export default {
    name: 'deploy-list',
    props: ['list', 'project'],
    data () {
      return {
        activeNames: ['1'],
        stateTypes: {
          'left' : '新增',
          'right' : '删除',
          'distinct' : '修改'
        }
      }
    }
  };
</script>

<style>
  .deploy_item_time {
    float: right;
    margin-right: 20px;
    color: #999;
    font-size: 12px;
  }
  .deploy_item_info_operator {
    margin-right: 60px;
  }
</style>