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

  initProject ({ commit }) {
    commit(GET_PROJECT, { project: { lastCommit: {} } });
  },

  async getProject ({ commit }, { id }) {
    const res = await Vue.http.get(`${INTERFACE.PROJECTS}/${id}`);
    commit(GET_PROJECT, { project: res.body.data});
  },

  async buildProject ({ commit }, { id }) {
    const res = await Vue.http.get(`${INTERFACE.PROJECTS}/${id}/build`);
    commit(PROJECT_BUILD_LOG, { buildRecord: res.body.data});
  },

  async getBuildRecord ({ commit }, { id }) {
    const res = await Vue.http.get(`${INTERFACE.PROJECT_BUILDS}/${id}`);
    const data = res.body.data;
    let buildRecord = {};
    if (data && data.length) {
      buildRecord = data[0];
    }
    commit(PROJECT_BUILD_LOG, { buildRecord });
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