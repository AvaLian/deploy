<template>
  <section>
    项目详情
  </section>
</template>
<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    computed: mapGetters([
      'project'
    ]),

    methods: {
      ...mapActions([
        'getProject'
      ])
    },

    mounted() {
      const id = this.$route.params.id;
      this.getProject({ id });
    }
  }
</script>