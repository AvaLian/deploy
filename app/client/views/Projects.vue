<template>
  <div class="projects clearfix">
    <aside class="projects_aside">
      <h3 class="projects_aside_title">我的项目<el-button class="projects_add" type="text" icon="plus" @click="showAddProjectDialog">新增项目</el-button></h3>
      <project-list :projectList="projectList"></project-list>
    </aside>
    <div class="projects_main">
      <router-view></router-view>
    </div>
    <el-dialog title="新增项目" v-model="dialogVisible">
      <el-form :model="newProject" ref="newProjectForm" label-width="80px">
        <el-form-item label="类型">
          <el-input v-model="newProject.type"></el-input>
        </el-form-item>
        <el-form-item label="英文名称">
          <el-input v-model="newProject.name"></el-input>
        </el-form-item>
        <el-form-item label="中文名">
          <el-input v-model="newProject.alias"></el-input>
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="newProject.author"></el-input>
        </el-form-item>
        <el-form-item label="源码仓库">
          <el-input v-model="newProject.sourceRepo"></el-input>
        </el-form-item>
        <el-form-item label="上线仓库">
          <el-input v-model="newProject.onlineRepo"></el-input>
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="newProject.description"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="hideAddProjectDialog">取 消</el-button>
        <el-button type="primary" @click="addProjectSubmit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
  import ProjectList from '../components/ProjectList';

  export default {
    data () {
      return {
        dialogVisible: false,
        newProject: {
          type: '',
          name: '',
          alias: '',
          author: '',
          sourceRepo: '',
          onlineRepo: '',
          description: ''
        }
      }
    },
    components: {
      ProjectList
    },
    computed: mapGetters([
      'projectList'
    ]),
    methods: {
      showAddProjectDialog () {
        this.dialogVisible = true;
      },
      hideAddProjectDialog () {
        this.dialogVisible = false;
      },
      async addProjectSubmit () {
        await this.addProject(JSON.parse(JSON.stringify(this.newProject)));
        this.dialogVisible = false;
      },
      ...mapActions([
        'getProjectList',
        'addProject'
      ])
    },
    mounted () {
      this.getProjectList();
    }
  };
</script>

<style>
  .projects_aside {
    width: 25%;
    float: left;
    max-width: 325px;
    margin-bottom: -99999px;
    padding-bottom: 100034px;
    min-height: 100vh;
    padding: 0 0 110px;
    border-right: 2px solid #f2f2f2;
  }
  .projects_aside_title {
    padding: 16px 16px 0 16px;
    font-size: 16px;
    border-bottom: 2px solid #f2f2f2;
  }
  .projects_main {
    width: 75%;
    float: left;
    margin-left: 25%;
    overflow: visible;
    min-height: 100vh;
  }
  .projects_add {
    margin-left: 12px;
  }
</style>