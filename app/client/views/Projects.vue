<template>
  <section class="projects">
    <h2 class="clearfix">项目列表<el-button class="projects_add" type="success" icon="plus" @click="showAddProjectDialog">新增项目</el-button></h2>
    <project-list :projectList="projectList"></project-list>
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
        <el-form-item label="仓库地址">
          <el-input v-model="newProject.sourceRepo"></el-input>
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
  </section>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
  import ProjectList from '../components/ProjectList';

  export default {
    data() {
      return {
        dialogVisible: false,
        newProject: {
          type: '',
          name: '',
          alias: '',
          author: '',
          sourceRepo: '',
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
      showAddProjectDialog() {
        this.dialogVisible = true;
      },
      hideAddProjectDialog() {
        this.dialogVisible = false;
      },
      async addProjectSubmit() {
        await this.addProject(JSON.parse(JSON.stringify(this.newProject)));
        this.dialogVisible = false;
      },
      ...mapActions([
        'getProjectList',
        'addProject'
      ])
    },
    mounted() {
      this.getProjectList();
    }
  };
</script>

<style>
  .projects_add {
    float: right;
  }
</style>