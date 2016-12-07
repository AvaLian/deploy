import Vue from 'vue';
import { INTERFACE } from '../../config';

const GET_PROJECT = 'GET_PROJECT';

const state = {
  project: {}
};

const mutations = {
  [GET_PROJECT] (state, { project }) {
    state.project = project;
  },
};

const actions = {
  async getProject({ commit }, { id }) {
    let res = await Vue.http.get(`${INTERFACE.PROJECTS}/${id}`);
    commit(GET_PROJECT, { project: res.body.data});
  }
};

const getters = {
  project(state) {
    return state.project;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};