<template>
  <section class="project">
    <header class="project_header clearfix">
      <h3 class="project_title"><a :href="project.sourceRepo" target="_blank">{{project.name}}</a></h3>
      <el-button class="project_buildbtn" type="primary" @click="buildProjectById" :loading="isBuilding">编译项目</el-button>
    </header>
    <el-tabs class="project_tab" :active-name="activeTabName" @tab-click="changeTab">
      <el-tab-pane label="源码仓库" name="sourceRepo" v-loading="isSourceRepoInfoLoading" element-loading-text="拼命加载数据中">
        <div class="project_info passed">
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
        </div>
        <div class="project_log" v-show="!isSourceRepoInfoLoading">
          <build-record :buildRecord="buildRecord"></build-record>
        </div>
      </el-tab-pane>
      <el-tab-pane label="上线仓库" name="onlineRepo">
        上线
      </el-tab-pane>
    </el-tabs>
  </section>
</template>
<script>
  import { mapGetters, mapActions } from 'vuex';
  import BuildRecord from '../components/BuildRecord';
  import router from '../router';

  export default {
    data () {
      return {
        isBuilding: false,
        isSourceRepoInfoLoading: true,
        activeTabName: 'sourceRepo'
      }
    },

    components: {
      BuildRecord
    },

    computed: mapGetters([
      'project',
      'sourceRepoInfo',
      'onlineRepoInfo',
      'buildRecord'
    ]),

    methods: {
      async buildProjectById () {
        const id = this.$route.params.id;
        this.isBuilding = true;
        await this.buildProject({ id });
        this.isBuilding = false;
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

      ...mapActions([
        'initProject',
        'initProjectRepoInfo',
        'getProject',
        'getSourceRepoInfo',
        'getOnlineRepoInfo',
        'buildProject',
        'getBuildRecord'
      ])
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
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-flow: row no-wrap;
    flex-flow: row no-wrap;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
  }
  .project_info.passed {
    background: -webkit-linear-gradient(left,#58B7FF 0,#58B7FF 10px,#fff 10px,#fff 100%) no-repeat;
    background: linear-gradient(to right,#58B7FF 0,#58B7FF 10px,#fff 10px,#fff 100%) no-repeat;
  }
  .project_commit {
    font-size: 16px;
    overflow: hidden;
    position: relative;
    -webkit-box-flex: 0;
    -ms-flex: 0 1 55%;
    flex: 0 1 55%;
    padding-left: 30px;
  }
  .project_build {
    font-size: 15px;
    padding-left: 28px;
    -webkit-box-flex: 0;
    -ms-flex: 0 1 37%;
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
</style>