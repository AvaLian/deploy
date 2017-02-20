import Vue from 'vue';
import { INTERFACE } from '../../config';

const GET_ALL_LOGS = 'GET_ALL_LOGS';
const GET_PROJECT_LOGS = 'GET_PROJECT_LOGS';

const state = {
  allLogs: [],
  projectLogs: []
};

const mutations = {
  [GET_ALL_LOGS] (state, { allLogs }) {
    state.allLogs = allLogs;
  },

  [GET_PROJECT_LOGS] (state, { projectLogs }) {
    state.projectLogs = projectLogs;
  }
};

const actions = {
  async getAllLogs ({ commit }) {
    const res = await Vue.http.get(`${INTERFACE.LOGS}`);
    const data = res.body.data;
    commit(GET_ALL_LOGS, { allLogs: data });
  },

  async getProjectLogs ({ commit }, { projectId }) {
    const res = await Vue.http.get(`${INTERFACE.LOGS}/project/${projectId}`);
    const data = res.body.data;
    commit(GET_PROJECT_LOGS, { projectLogs: data });
  }
};

const getters = {
  allLogs (state) {
    return state.allLogs;
  },
  projectLogs (state) {
    return state.projectLogs;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};