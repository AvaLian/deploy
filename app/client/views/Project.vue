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
            <p v-if="project.buildStatus === 1 && canDoDeploy"><el-button class="project_onlinebtn" type="primary" @click="projectDeploy">上线</el-button></p>
          </div>
        </div>
        <div class="project_log" v-show="!isSourceRepoInfoLoading">
          <build-record :buildRecord="buildRecord" v-show="!isBuilding"></build-record>
          <div v-show="isBuilding">正在编译中...</div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="上线仓库" name="onlineRepo" v-loading="isOnlineRepoInfoLoading">
        <div class="online_info">
          <deploy-list :list="currentDeployHistory" :project="project"></deploy-list>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-dialog class="diff_dialog" title="代码diff" v-model="showDirDiffDialog" size="full">
      <div v-loading="isDirDiffLoading" class="diff_container">
        <div class="diff_deploy" v-if="project.buildStatus === 1 && canDoDeploy">
          <el-button class="diff_deploy_btn" type="primary" @click="goToDeploy">上线</el-button>
        </div>
        <div class="diff_files">
          <h3 class="diff_title">影响到的文件</h3>
          <diff-list :diffSet="dirDiffSet" @fileClick="onFileClick" @renderEnd="onDiffListRenderEnd"></diff-list>
        </div>
        <div class="diff_single" v-show="showFileDiff" v-loading="isfileDiffLoading">
          <h3 class="diff_title" v-show="!!currentDiffFile">查看文件：{{ currentDiffFile }}<span class="diff_total">代码差异：<strong class="diff_total_count">{{ fileCodeDiffCount }}</strong>处</span></h3>
          <div class="diff_wrapper">
            <div class="diff_left">
              <h4 class="diff_left_title">编译结果</h4>
              <code-show :codeData="leftFileCode" :codeMark="getCodeMark" v-show="showFileDiff" @toggleMask="onToggleMask"></code-show>
            </div>
            <div class="diff_right">
              <h4 class="diff_right_title">基线版本</h4>
              <code-show :codeData="rightFileCode" :codeMark="getCodeMark" v-show="showFileDiff" @toggleMask="onToggleMask"></code-show>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog class="deploy_dialog" title="项目上线" v-model="showDeployDialog">
      <div class="deploy_container">
        <div class="deploy_files">
          <h3 class="deploy_title">选择上线文件</h3>
          <FileList :files="preOnlineFiles" @toggleFileChoose="onToggleFileChoose"></FileList>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="showDeployDialog = false">取 消</el-button>
          <el-button class="deploy_confirm" type="primary" @click="doDeploy" :loading="idDeploying">确定</el-button>
        </span>
      </div>
    </el-dialog>
  </section>
</template>
<script>
  import { mapGetters, mapActions } from 'vuex';
  import 'highlight.js/styles/xcode.css';

  import { isEmptyObject } from '../util';
  import BuildRecord from '../components/BuildRecord';
  import DiffList from '../components/DiffList';
  import CodeShow from '../components/CodeShow';
  import FileList from '../components/FileList';
  import DeployList from '../components/DeployList';
  import router from '../router';
  import { DOMAIN } from '../config';

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
        currentDiffFile: '',
        needDiffFileCount: 0,
        markedFileCount: 0,
        canDoDeploy: false,
        showDeployDialog: false,
        preOnlineFiles: [],
        choosedOnlineFiles: [],
        idDeploying: false,
        isOnlineRepoInfoLoading: false
      }
    },

    components: {
      BuildRecord,
      DiffList,
      CodeShow,
      FileList,
      DeployList
    },

    computed: {
      ...mapGetters([
        'project',
        'sourceRepoInfo',
        'onlineRepoInfo',
        'buildRecord',
        'dirDiff',
        'fileDiff',
        'codeMark',
        'deployInfo',
        'deployHistory'
      ]),

      leftFileCode () {
        const diffSet = this.fileDiff.diffSet;
        let res = [];
        if (diffSet.length === 1 && diffSet[0].count === 0 && diffSet[0].value === '') {
          res = [{code: '', different: true}];
        } else {
          diffSet.forEach(item => {
            let value = item.value;
            if (item.type === 'image') {
              value = `<img src="${DOMAIN}${value}" />`;
            } else if (item.type === 'media') {
              value = `<a href="${DOMAIN}${value}"></a>`;
            }
            value = value.split('\n');
            if (!item.removed && item.added) {
              res = res.concat(value.map(s => ({code: s, different: true, type: 'added'})).filter(i => i.code));
            } else if (!item.removed && !item.added) {
              res = res.concat(value.map(s => ({code: s, different: false})).filter(i => i.code));
            } else if (item.removed && !item.added && !item.both) {
              res = res.concat(value.map(s => {if (s && s.length) {return {code: '', different: true, type: 'added'}}}).filter(i => i));
            }
          });
        }
        return res;
      },

      rightFileCode () {
        const diffSet = this.fileDiff.diffSet;
        let res = [];
        if (diffSet.length === 1 && diffSet[0].count === 0 && diffSet[0].value === '') {
          res = [{code: '', different: true}];
        } else {
          diffSet.forEach(item => {
            let value = item.value;
            if (item.type === 'image') {
              value = `<img src="${DOMAIN}${value}" />`;
            } else if (item.type === 'media') {
              value = `<a href="${DOMAIN}${value}"></a>`;
            }
            value = value.split('\n');
            if (item.removed && !item.added) {
              res = res.concat(value.map(s => ({code: s, different: true, type: 'removed'})).filter(i => i.code));
            } else if (!item.removed && !item.added) {
              res = res.concat(value.map(s => ({code: s, different: false})).filter(i => i.code));
            } else if (!item.removed && item.added && !item.both) {
              res = res.concat(value.map(s => {if (s && s.length) {return {code: '', different: true, type: 'removed'}}}).filter(i => i));
            }
          });
        }
        return res;
      },

      getCodeMark () {
        const buildId = this.buildRecord._id;
        const fileName = this.currentDiffFile;
        if (fileName && this.codeMark[buildId]) {
          return this.codeMark[buildId][fileName];
        }
      },

      fileCodeDiffCount () {
        if (!this.fileDiff) {
          return 0;
        }
        const diffInfo = this.fileDiff.diffInfo;
        if (diffInfo) {
          return diffInfo.total;
        }
        return 0;
      },

      dirDiffSet () {
        return this.dirDiff.diffSet;
      },

      currentDeployHistory () {
        return this.deployHistory[this.project._id];
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
        'modifyProjectBuildCount',
        'getDiff',
        'initDiff',
        'initFileDiff',
        'markDiffFile',
        'getMark',
        'addMark',
        'removeMark',
        'deploy',
        'getProjectDeployList'
      ]),

      async buildProjectById () {
        const id = this.$route.params.id;
        this.modifyProjectBuildStatus({ status: 0 });
        this.isBuilding = true;
        await this.buildProject({ id });
        this.isBuilding = false;
        this.modifyProjectBuildCount({ count: this.project.buildCount + 1 });
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
        const buildId = this.buildRecord._id;
        await this.getMark({
          buildId
        });
        const currentBuildMark = this.codeMark[buildId];
        if (currentBuildMark) {
          let markedFileCount = 0;
          this.dirDiffSet.forEach(item => {
            let fullname = item.fullname;
            if (currentBuildMark[fullname] && currentBuildMark[fullname].length && (item.fileDiffCount === currentBuildMark[fullname].length || item.fileDiffCount === 0)) {
              this.markDiffFile({ diffFile: fullname, type: 'add' });
              markedFileCount++;
            }
          });
          this.markedFileCount = markedFileCount;
          if (this.markedFileCount >= this.needDiffFileCount) {
            this.canDoDeploy = true;
            this.$confirm('所有差异文件均已标记完毕，可以开始上线！', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'success'
            }).then(this.goToDeploy);
          }
        }
        this.isDirDiffLoading = false;
      },

      async projectDeploy () {
        this.showDeployDialog = true;
      },

      goToDeploy () {
        this.showDirDiffDialog = false;
      },

      onToggleFileChoose (files) {
        this.choosedOnlineFiles = files;
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
        } else {
          this.isOnlineRepoInfoLoading = true;
          await this.getProjectDeployList({ projectId: project._id });
          this.isOnlineRepoInfoLoading = false;
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
        const fileName = item.fullname;
        if (item.state === 'equal' || item.state === 'distinct') {
          params.left = params.right = fileName;
        } else {
          params[item.state] = fileName;
        }
        await this.getDiff(params);
        this.isfileDiffLoading = false;
        this.currentDiffFile = fileName;
        this.showFileDiff = true;
      },

      onDiffListRenderEnd (diffList) {
        this.preOnlineFiles = diffList;
        this.needDiffFileCount = diffList.length;
      },

      async doDeploy () {
        const projectId = this.project._id;
        const buildId = this.buildRecord._id;
        const files = this.choosedOnlineFiles;
        this.idDeploying = true;
        await this.deploy({ projectId, buildId, files });
        this.idDeploying = false;
        if (this.deployInfo[projectId]) {
          this.showDeployDialog = false;
          this.$confirm('恭喜，所有改动文件已经发布到上线池中，可以进行上线了！', '提示', {
            confirmButtonText: '前往j-one',
            cancelButtonText: '取消',
            type: 'success'
          }).then(this.goToJone);
        }
      },

      goToJone () {
        window.open('//j-one.jd.com', '_blank');
      },

      async onToggleMask (checked, lineNum) {
        const buildId = this.buildRecord._id;
        const fileName = this.currentDiffFile;
        if (checked) {
          await this.addMark({
            buildId,
            fileName,
            lineNum
          });
          if (this.getCodeMark && this.getCodeMark.length >= this.fileCodeDiffCount) {
            this.markDiffFile({ diffFile: fileName, type: 'add' });
            this.$message({
              message: '恭喜，当前文件的所有差异都已标记完毕！',
              type: 'success'
            });
            this.markedFileCount++;
            if (this.markedFileCount > 0 && this.markedFileCount >= this.needDiffFileCount) {
              this.$confirm('所有差异文件均已标记完毕，可以开始上线！', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'success'
              }).then(() => {
                this.showDirDiffDialog = false;
                this.canDoDeploy = true;
              });
            }
          }
        } else {
          await this.removeMark({
            buildId,
            fileName,
            lineNum
          });
          if (this.getCodeMark.length < this.fileCodeDiffCount || this.fileCodeDiffCount === 0) {
            this.markDiffFile({ diffFile: fileName, type: 'remove' });
            this.markedFileCount--;
          }
        }
      },

      initData () {
        this.isBuilding = false;
        this.isSourceRepoInfoLoading = true;
        this.isDirDiffLoading = false;
        this.showDirDiffDialog = false;
        this.showFileDiff = false;
        this.isfileDiffLoading = false;
        this.currentDiffFile = '';
        this.needDiffFileCount = 0;
        this.markedFileCount = 0;
        this.canDoDeploy = false;
        this.showDeployDialog = false;
        this.preOnlineFiles = [];
        this.choosedOnlineFiles = [];
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
          this.initData();
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
  .diff_files,.diff_single,.deploy_files {
    border: 1px solid #ddd;
    margin-bottom: 15px;
  }
  .diff_title,.deploy_title {
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
  .diff_total {
    margin-left: 16px;
    font-size: 14px;
  }
  .diff_total_count {
    color: #FF4949;
    font-style: normal;
    font-size: 16px;
  }
  .diff_deploy {
    margin-bottom: 12px;
  }
</style>