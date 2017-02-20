<template>
  <div class="logs">
    <h2>操作日志</h2>
    <log-list :logList="allLogs"></log-list>
  </div>
</template>
<script>
  import { mapGetters, mapActions } from 'vuex';
  import LogList from '../components/LogList';

  export default {
    components: {
      LogList
    },

    computed: {
      ...mapGetters([
        'allLogs'
      ])
    },

    methods: {
      ...mapActions([
        'getAllLogs'
      ])
    },

    created () {
      this.getAllLogs();
    }
  };
</script>
<style>
  .logs {
    padding: 16px 24px;
  }
</style>