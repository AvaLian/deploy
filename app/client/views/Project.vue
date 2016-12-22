<template>
  <section class="project">
    <header class="project_header clearfix">
      <h3 class="project_title"><a :href="project.sourceRepo" target="_blank">{{project.name}}</a></h3>
      <el-button class="project_buildbtn" type="primary" @click="buildProjectById" :loading="isBuilding">编译项目</el-button>
    </header>
    <div class="project_info">
      <div class="project_commit">
        <p class="project_commit_last">
          <span class="project_commit_last_txt"></span>
        </p>
      </div>
      <div class="project_build">
        
      </div>
    </div>
    {{project}}
    <br>
    {{buildLog}}
  </section>
</template>
<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    data() {
      return {
        isBuilding: false
      }
    },

    computed: mapGetters([
      'project',
      'buildLog'
    ]),

    methods: {
      async buildProjectById () {
        const id = this.$route.params.id;
        this.isBuilding = true;
        await this.buildProject({ id });
        this.isBuilding = false;
      },

      fetchData () {
        const id = this.$route.params.id;
        this.getProject({ id });
      },
      ...mapActions([
        'getProject',
        'buildProject'
      ])
    },

    created () {
      this.fetchData();
    },

    watch: {
      '$route': 'fetchData'
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
  .project_info.passed {
    background: -webkit-linear-gradient(left,#58B7FF 0,#58B7FF 8px,#fff 8px,#fff 100%) no-repeat;
    background: linear-gradient(to right,#58B7FF 0,#58B7FF 8px,#fff 8px,#fff 100%) no-repeat;
  }
  .project_info {
    font-size: 16px;
    border: 1px solid #EFF0EC;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-flow: row no-wrap;
    flex-flow: row no-wrap;
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
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
  }
</style>