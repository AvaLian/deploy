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
      <el-form :model="newProject" :rules="rules" ref="newProjectForm" label-width="100px">
        <el-form-item label="类型" prop="type">
          <el-select v-model="newProject.type" placeholder="请选择">
            <el-option
              v-for="item in typeOptions"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="英文名称" prop="name">
          <el-input v-model="newProject.name" placeholder="请输入项目英文名"></el-input>
        </el-form-item>
        <el-form-item label="中文名" prop="alias">
          <el-input v-model="newProject.alias" placeholder="请输入项目中文名"></el-input>
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="newProject.author" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="源码仓库" prop="sourceRepo">
          <el-input v-model="newProject.sourceRepo" placeholder="请输入项目源码仓库地址"></el-input>
        </el-form-item>
        <el-form-item label="上线仓库" prop="onlineRepo">
          <el-input v-model="newProject.onlineRepo" placeholder="请输入项目上线仓库地址"></el-input>
        </el-form-item>
        <!--<el-form-item label="项目管理员" prop="repoOwner">
          <el-input class="input_owner" v-for="(owner, index) in newProject.owners" v-model="newProject.owners[index]"></el-input><el-button type="primary" icon="plus" @click="addOwner"></el-button>
        </el-form-item>-->
        <el-form-item label="简介" prop="description">
          <el-input
            type="textarea"
            :rows="3"
            placeholder="请输入项目简介"
            v-model="newProject.description">
          </el-input>
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

  import { isEmptyObject } from '../util';

  export default {
    data () {
      const gitRepoReg = new RegExp('((git|ssh|http(s)?)|(git@[\w\.]+))(:(//)?)([\w\.@\:/\-~]+)(\.git)(/)?')
      const validateRepoAddr = (rule, value, callback) => {
        if (!gitRepoReg.test(value)) {
          callback(new Error('请输入正确格式的git地址'));
        } else {
          callback();
        }
      };
      return {
        dialogVisible: false,
        typeOptions: [{
          value: 'channel',
          label: '频道页'
        }, {
          value: 'act',
          label: '活动页'
        }],
        newProject: {
          type: '',
          name: '',
          alias: '',
          author: '',
          sourceRepo: '',
          onlineRepo: '',
          owners: [],
          description: ''
        },
        rules: {
          type: [
            { required: true, message: '请选择类型', trigger: 'change' }
          ],
          name: [
            { required: true, message: '请输入项目英文名', trigger: 'blur' }
          ],
          alias: [
            { required: true, message: '请输入项目中文名', trigger: 'blur' }
          ],
          sourceRepo: [
            { required: true, validator: validateRepoAddr, trigger: 'blur' }
          ],
          onlineRepo: [
            { required: true, validator: validateRepoAddr, trigger: 'blur' }
          ]
        }
      }
    },
    components: {
      ProjectList
    },
    computed: {
      firstProject () {
        return this.projectList[0];
      },
      ...mapGetters([
        'projectList'
      ])
    },
    methods: {
      showAddProjectDialog () {
        const form = this.$refs['newProjectForm'];
        if (form) {
          form.resetFields();
        }
        this.dialogVisible = true;
      },
      hideAddProjectDialog () {
        this.dialogVisible = false;
      },
      addOwner () {
        this.newProject.owners.push('');
      },
      addProjectSubmit () {
        this.$refs['newProjectForm'].validate(async valid => {
          if (valid) {
            await this.addProject(JSON.parse(JSON.stringify(this.newProject)));
            this.dialogVisible = false;
            this.$router.push(`/projectList/${this.firstProject._id}`);
          } else {
            return false;
          }
        });
      },
      async fetchData () {
        await this.getProjectList();
        const params = this.$route.params;
        if (isEmptyObject(params)) {
          this.$router.push(`/projectList/${this.firstProject._id}`);
        }
      },
      ...mapActions([
        'getProjectList',
        'addProject'
      ])
    },
    mounted () {
      this.fetchData();
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
  .input_owner {
    width: 100px;
    margin-right: 12px;
    margin-bottom: 12px;
  }
</style>