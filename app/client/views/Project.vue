<template>
  <section class="project">
    <header class="project_header clearfix">
      <h3 class="project_title"><a :href="project.sourceRepo" target="_blank">{{project.name}}</a></h3>
      <el-button class="project_buildbtn" type="primary" @click="buildProjectById" :loading="isBuilding">编译项目</el-button>
    </header>
    <el-tabs class="project_tab" :active-name="activeTabName" @tab-click="changeTab">
      <el-tab-pane label="源码仓库" name="sourceRepo" v-loading="isSourceRepoInfoLoading" element-loading-text="拼命加载数据中">
        <div :class="{ project_info: true, passed: project.buildStatus === 1, failed: project.buildStatus === 2, building: project.buildStatus === 0 }">
          <div class="project_commit">
            <h4 class="project_commit_last">
              <span class="project_commit_last_txt">{{sourceRepoInfo.lastCommit.message}}</span>
            </h4>
            <ul class="project_commit_list">
              <li><a href="#">上次提交 {{sourceRepoInfo.lastCommit.hash}}</a></li>
              <li><span>提交作者 {{sourceRepoInfo.lastCommit.author}}</span></li>
              <li><span>提交时间 {{sourceRepoInfo.lastCommit.date}}</span></li>
            </ul>
          </div>
          <div class="project_build">
            <h4 class="project_build_time">#{{project.buildCount}}编译</h4>
            <ul class="project_build_list">
              <li><span>编译时间 {{project.lastBuildDate | fomatDate}}</span></li>
              <li><span>编译耗时 {{project.buildDuration || '-'}}</span></li>
            </ul>
          </div>
          <div class="project_operate">
            <p v-if="project.buildStatus === 1"><el-button class="project_diffbtn" type="primary" @click="projectDiff" :loading="isBuilding">代码diff</el-button></p>
            <p v-if="project.buildStatus === 1"><el-button class="project_onlinebtn" type="primary" @click="projectOnline" :loading="isBuilding">上线</el-button></p>
          </div>
        </div>
        <div class="project_log" v-show="!isSourceRepoInfoLoading">
          <build-record :buildRecord="buildRecord"></build-record>
        </div>
      </el-tab-pane>
      <el-tab-pane label="上线仓库" name="onlineRepo">
        上线
      </el-tab-pane>
    </el-tabs>
    <el-dialog class="diff_dialog" title="代码diff" v-model="showDirDiffDialog" size="full">
      <div v-loading="isDirDiffLoading" class="diff_container">
        <div class="diff_files">
          <h3 class="diff_title">影响到的文件</h3>
          <diff-list :diffSet="dirDiff.diffSet" @fileClick="onFileClick"></diff-list>
        </div>
        <div class="diff_single" v-show="showFileDiff" v-loading="isfileDiffLoading">
          <h3 class="diff_title" v-show="!!currentDiffFile">查看文件：{{ currentDiffFile }}</h3>
          <div class="diff_wrapper">
            <div class="diff_left">
              <h4 class="diff_left_title">编译结果</h4>
              <code-show :codeData="leftFileCode" v-show="showFileDiff"></code-show>
            </div>
            <div class="diff_right">
              <h4 class="diff_right_title">基线版本</h4>
              <code-show :codeData="rightFileCode" v-show="showFileDiff"></code-show>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </section>
</template>
<script>
  import { mapGetters, mapActions } from 'vuex';
  import 'highlight.js/styles/xcode.css';

  import BuildRecord from '../components/BuildRecord';
  import DiffList from '../components/DiffList';
  import CodeShow from '../components/CodeShow';
  import router from '../router';

  export default {
    data () {
      return {
        isBuilding: false,
        isSourceRepoInfoLoading: true,
        activeTabName: 'sourceRepo',
        isDirDiffLoading: false,
        showDirDiffDialog: false,
        showFileDiff: false,
        isfileDiffLoading: false,
        currentDiffFile: ''
      }
    },

    components: {
      BuildRecord,
      DiffList,
      CodeShow
    },

    computed: {
      ...mapGetters([
        'project',
        'sourceRepoInfo',
        'onlineRepoInfo',
        'buildRecord',
        'dirDiff',
        'fileDiff'
      ]),

      leftFileCode () {
        const diffSet = this.fileDiff.diffSet;
        let res = [];
        diffSet.forEach(item => {
          let value = item.value.split('\n');
          if (!item.removed && item.added) {
            res = res.concat(value.map(s => ({code: s, different: true, type: 'added'})).filter(i => i.code));
          } else if (!item.removed && !item.added) {
            res = res.concat(value.map(s => ({code: s, different: false})).filter(i => i.code));
          } else if (item.removed && !item.added && !item.both) {
            res = res.concat(value.map(s => {if (s && s.length) {return {code: '', different: true, type: 'added'}}}).filter(i => i));
          }
        });
        return res;
      },

      rightFileCode () {
        const diffSet = this.fileDiff.diffSet;
        let res = [];
        diffSet.forEach(item => {
          let value = item.value.split('\n');
          if (item.removed && !item.added) {
            res = res.concat(value.map(s => ({code: s, different: true, type: 'removed'})).filter(i => i.code));
          } else if (!item.removed && !item.added) {
            res = res.concat(value.map(s => ({code: s, different: false})).filter(i => i.code));
          } else if (!item.removed && item.added && !item.both) {
            res = res.concat(value.map(s => {if (s && s.length) {return {code: '', different: true, type: 'removed'}}}).filter(i => i));
          }
        });
        return res;
      }
    },

    methods: {
      ...mapActions([
        'initProject',
        'initProjectRepoInfo',
        'getProject',
        'getSourceRepoInfo',
        'getOnlineRepoInfo',
        'buildProject',
        'getBuildRecord',
        'modifyProjectBuildStatus',
        'getDiff',
        'initDiff',
        'initFileDiff'
      ]),

      async buildProjectById () {
        const id = this.$route.params.id;
        this.modifyProjectBuildStatus({ status: 0 });
        this.isBuilding = true;
        await this.buildProject({ id });
        this.isBuilding = false;
        this.modifyProjectBuildStatus({ status: this.buildRecord.status });
      },

      async projectDiff () {
        this.showDirDiffDialog = true;
        this.showFileDiff = false;
        this.initDiff();
        this.isDirDiffLoading = true;
        await this.getDiff({
          id: this.project._id
        });
        this.isDirDiffLoading = false;
      },

      async projectOnline () {

      },

      async fetchData () {
        await this.fetchProjectData();
        await this.fetchProjectRepoInfoData();
      },

      async fetchProjectData () {
        const id = this.$route.params.id;
        await this.getProject({ id });
      },

      async fetchProjectRepoInfoData () {
        const tabName = this.$route.query.tab;
        this.activeTabName = tabName || 'sourceRepo';
        const project = this.project;
        if (this.activeTabName === 'sourceRepo') { // 拉取源码库相关信息
          this.isSourceRepoInfoLoading = true;
          await this.getSourceRepoInfo({ id: project._id, sourceRepo: project.sourceRepo, name: project.name });
          this.isSourceRepoInfoLoading = false;
        }
      },

      changeTab (tab) {
        const tabName = tab.name;
        let query = Object.assign({}, this.$route.query);
        query.tab = tabName;
        router.push({ query: query });
      },

      async onFileClick (item) {
        let params = {
          id: this.project._id
        };
        this.isfileDiffLoading = true;
        this.initFileDiff();
        if (item.state === 'equal' || item.state === 'distinct') {
          params.left = params.right = item.fullname;
        } else {
          params[item.state] = item.fullname;
        }
        await this.getDiff(params);
        this.isfileDiffLoading = false;
        this.currentDiffFile = item.fullname;
        this.showFileDiff = true;
      }
    },

    created () {
      this.fetchData();
    },

    watch: {
      $route (val, oldVal) {
        const tabName = val.query.tab;
        const oldTabName = oldVal.query.tab;
        if (val.path !== oldVal.path) {
          this.initProject();
          this.initProjectRepoInfo();
          this.fetchData();
        } else {
          if (tabName !== oldTabName) {
            this.activeTabName = tabName;
            this.fetchProjectRepoInfoData();
          }
        }
      },
      isSourceRepoInfoLoading (val) {
        if (!val) {
          // 拉取上一次编译log
          const id = this.$route.params.id;
          this.getBuildRecord({ id });
        }
      }
    }
  }
</script>
<style>
  .project {
    padding:  15px;
  }
  .project_header {
    padding: 18px 20px;
    border-bottom: 1px solid #d3dce6;
    box-sizing: border-box;
    margin-bottom: 16px;
  }
  .project_title {
    line-height: 36px;
    float: left;
    font-size: 24px;
    font-weight: 400;
  }
  .project_title a:hover {
    text-decoration: underline;
  }
  .project_buildbtn {
    float: right;
  }
  .project_tab {
    width: 100%;
  }
  
  .project_info {
    font-size: 16px;
    border: 1px solid #EFF0EC;
    padding: 15px 0;
    display: flex;
    flex-flow: row no-wrap;
    -webkit-box-pack: justify;
    justify-content: space-between;
  }
  .project_info.passed {
    background: -webkit-linear-gradient(left,#58B7FF 0,#58B7FF 10px,#fff 10px,#fff 100%) no-repeat;
    background: linear-gradient(to right,#58B7FF 0,#58B7FF 10px,#fff 10px,#fff 100%) no-repeat;
  }
  .project_info.failed {
    background: -webkit-linear-gradient(left,#FF4949 0,#FF4949 10px,#fff 10px,#fff 100%) no-repeat;
    background: linear-gradient(to right,#FF4949 0,#FF4949 10px,#fff 10px,#fff 100%) no-repeat;
  }
  .project_info.building {
    background: -webkit-linear-gradient(left,#F7BA2A 0,#F7BA2A 10px,#fff 10px,#fff 100%) no-repeat;
    background: linear-gradient(to right,#F7BA2A 0,#F7BA2A 10px,#fff 10px,#fff 100%) no-repeat;
  }
  .project_commit {
    font-size: 16px;
    overflow: hidden;
    position: relative;
    flex: 0 1 55%;
    padding-left: 30px;
  }
  .project_build {
    font-size: 15px;
    padding-left: 28px;
    flex: 0 1 37%;
  }
  .project_commit_list,.project_build_list {
    padding: 0;
    list-style: none;
    line-height: 1.7;
    margin: 14px 0 0;
    font-size: 14px;
  }
  .project_log {
    padding-top: 15px;
  }
  .project_operate {
    flex: 0 1 110px;
    overflow: hidden;
  }
  .project_diffbtn {
    margin-bottom: 16px;
  }
  .diff_dialog {
    margin-top: 50px;
  }
  .diff_wrapper {
    display: flex;
    box-orient: horizontal;
    flex-flow: row;
    flex-direction: row;
  }
  .diff_left,.diff_right {
    flex: 1;
    width: 50%;
  }
  .diff_right {
    border-left: 1px solid #ddd;
  }
  .diff_files,.diff_single {
    border: 1px solid #ddd;
    margin-bottom: 15px;
  }
  .diff_title {
    padding: 8px 12px;
    background-color: #E5E9F2;
    color: #222;
    font-weight: 400;
  }
  .diff_files .file_diff {
    padding: 8px 12px;
  }
  .diff_left_title,.diff_right_title {
    padding: 6px 12px;
    font-weight: 700;
    border-bottom: 1px solid #efefef;
  }
</style>