import Vue from 'vue';
import { INTERFACE } from '../../config';

const PROJECT_LIST = 'PROJECT_LIST';
const ADD_PROJECT = 'ADD_PROJECT';

const state = {
  projectList: []
};

const mutations = {
  [PROJECT_LIST] (state, { projectList }) {
    state.projectList = projectList;
  },

  [ADD_PROJECT] (state, { project }) {
    state.projectList.unshift(project);
  }
};

const actions = {
  async getProjectList({ commit }) {
    let res = await Vue.http.get(INTERFACE.GET_PROJECT_LIST);
    commit(PROJECT_LIST, { projectList: res.body.data});
  },

  async addProject ({ commit }, project) {
    let res = await Vue.http.post(INTERFACE.ADD_PROJECT, project);
    commit(ADD_PROJECT, { project });
  }
};

const getters = {
  projectList(state) {
    return state.projectList;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};