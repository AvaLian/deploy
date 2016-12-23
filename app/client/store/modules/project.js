import Vue from 'vue';
import { INTERFACE } from '../../config';

const GET_PROJECT = 'GET_PROJECT';
const PROJECT_BUILD_LOG = 'PROJECT_BUILD_LOG';

const state = {
  project: {
    lastCommit: {}
  },
  buildRecord: {}
};

const mutations = {
  [GET_PROJECT] (state, { project }) {
    state.project = project;
  },
  [PROJECT_BUILD_LOG] (state, { buildRecord }) {
    state.buildRecord = buildRecord;
  }
};

const actions = {
  async getProject({ commit }, { id }) {
    let res = await Vue.http.get(`${INTERFACE.PROJECTS}/${id}`);
    commit(GET_PROJECT, { project: res.body.data});
  },

  async buildProject({ commit }, { id }) {
    let res = await Vue.http.get(`${INTERFACE.PROJECTS}/${id}/build`);
    commit(PROJECT_BUILD_LOG, { buildRecord: res.body.data});
  }
};

const getters = {
  project(state) {
    return state.project;
  },
  buildRecord(state) {
    return state.buildRecord;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};