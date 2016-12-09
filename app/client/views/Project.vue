<template>
  <section class="project">
    项目详情
    <el-button class="project_build" type="primary" @click="buildProjectById" :loading="isBuilding">编译项目</el-button>
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