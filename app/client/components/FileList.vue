<template>
  <div class="file_list">
    <el-checkbox class="file_list_all" :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
    <el-checkbox-group v-model="myFiles" @change="toggleFileChoose">
      <p v-for="file in files" class="file_list_item"><el-checkbox :label="file">{{file.fullname}}</el-checkbox></p>
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
        myFiles: [],
        checkAll: false,
        isIndeterminate: false
      }
    },
    methods: {
      toggleFileChoose (value) {
        let checkedCount = value.length;
        this.checkAll = checkedCount === this.files.length;
        this.isIndeterminate = checkedCount > 0 && checkedCount < this.files.length;
        this.$emit('toggleFileChoose', this.myFiles);
      },
      handleCheckAllChange (event) {
        this.myFiles = event.target.checked ? this.files : [];
        this.isIndeterminate = false;
        this.$emit('toggleFileChoose', this.myFiles);
      }
    }
  };
</script>

<style>
  .file_list {
    padding: 12px 12px 4px 12px;
  }
  .file_list_item, .file_list_all {
    margin-bottom: 8px;
  }
</style>