import './index.css';

import Vue from 'vue';

const template = `
  <li class="tree_item">
    <div :class="{ tree_item_directory: isDirectory, tree_item_file: isFile, highlight: treeItem.pos !== 'equal' }" @click="toggle">
      <a href="#" v-if="isFile" @click="onFileClick($event, treeItem)">{{ treeItem.name }}</a>
      <span v-if="isDirectory">{{ treeItem.name }}</span>
    </div>
    <ul class="tree_sub" v-if="isDirectory" v-show="isOpen">
      <tree-item v-for="treeItem in treeItem.children" :treeItem="treeItem" v-on:fileClick="onSubFileClick(treeItem)"></tree-item>
    </ul>
  </li>
`;

Vue.component('tree-item', {
  template,
  props: {
    treeItem: Object
  },
  data () {
    return {
      isOpen: false
    }
  },
  computed: {
    isDirectory () {
      return this.treeItem.type === 'directory';
    },

    isFile () {
      return this.treeItem.type === 'file';
    }
  },
  methods: {
    toggle () {
      if (this.isDirectory) {
        this.isOpen = !this.isOpen;
      }
    },
    onFileClick ($event, treeItem) {
      $event.preventDefault();
      this.$emit('fileClick', treeItem);
    },
    onSubFileClick (treeItem) {
      this.$emit('fileClick', treeItem);
    }
  }
});

export default {
  name: 'tree-view',
  props: {
    treeData: Array
  },
  methods: {
    onFileClick (treeItem) {
      this.$emit('fileClick', treeItem);
    }
  },
  render (h) {
    const treeData = this.treeData || [];
    const items = treeData.map(dataItem => {
      return (
        <tree-item treeItem={dataItem} onFileClick={this.onFileClick}></tree-item>
      );
    });

    return (
      <ul class="tree">
        {items}
      </ul>
    );
  }
};