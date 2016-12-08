import Vue from 'vue';
import { INTERFACE } from '../../config';

const GET_PROJECT = 'GET_PROJECT';
const PROJECT_BUILD_LOG = 'PROJECT_BUILD_LOG';

const state = {
  project: {},
  buildLog: {}
};

const mutations = {
  [GET_PROJECT] (state, { project }) {
    state.project = project;
  },
  [PROJECT_BUILD_LOG] (state, { buildLog }) {
    state.buildLog = buildLog;
  }
};

const actions = {
  async getProject({ commit }, { id }) {
    let res = await Vue.http.get(`${INTERFACE.PROJECTS}/${id}`);
    commit(GET_PROJECT, { project: res.body.data});
  },

  async buildProject({ commit }, { id }) {
    let res = await Vue.http.get(`${INTERFACE.PROJECTS}/${id}/build`);
    commit(PROJECT_BUILD_LOG, { buildLog: res.body.data});
  }
};

const getters = {
  project(state) {
    return state.project;
  },
  buildLog(state) {
    return state.buildLog;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};