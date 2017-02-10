<template>
  <div class="file_list">
    <el-checkbox-group v-model="myFiles" @change="toggleFileChoose">
      <p v-for="file in files" class="file_list_item"><el-checkbox :label="file.fullname">{{file.fullname}}</el-checkbox></p>
    </el-checkbox-group>
  </div>
</template>

<script>
  export default {
    name: 'file-list',
    props: {
      files: Array
    },
    data () {
      return {
        myFiles: []
      }
    },
    methods: {
      toggleFileChoose () {
        this.$emit('toggleFileChoose', this.myFiles);
      }
    }
  };
</script>

<style>
  .file_list {
    padding: 12px 12px 4px 12px;
  }
  .file_list_item {
    margin-bottom: 8px;
  }
</style>