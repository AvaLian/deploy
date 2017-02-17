import Vue from 'vue';
import { INTERFACE } from '../../config';

const GET_DEPLOY_HISTORY = 'GET_DEPLOY_HISTORY';
const GET_DEPLOY_INFO = 'GET_DEPLOY_INFO';

const state = {
  deployInfo: {

  },
  deployHistory: {

  }
};

const mutations = {
  [GET_DEPLOY_INFO] (state, { projectId, deployInfo }) {
    Vue.set(state.deployInfo, projectId, deployInfo);
  },
  [GET_DEPLOY_HISTORY] (state, { projectId, deployHistory }) {
    Vue.set(state.deployHistory, projectId, deployHistory);
  }
};

const actions = {
  async deploy ({ commit }, { buildId, projectId, files }) {
    const res = await Vue.http.post(`${INTERFACE.DEPLOYS}/project/${projectId}`, {
      buildId,
      files
    });
    const body = res.body;
    if (body.errCode === 0) {
      commit(GET_DEPLOY_INFO, { projectId, deployInfo: body.data });
    }
  },

  async getProjectBuildDeployInfo ({ commit }, { projectId, buildId }) {
    const res = await Vue.http.get(`${INTERFACE.DEPLOYS}/project/${projectId}/build/${buildId}`);
    commit(GET_DEPLOY_INFO, { projectId, deployInfo: res.body.data });
  },

  async getProjectDeployList ({ commit }, { projectId }) {
    const res = await Vue.http.get(`${INTERFACE.DEPLOYS}/project/${projectId}`);
    commit(GET_DEPLOY_HISTORY, { projectId, deployHistory: res.body.data });
  }
};

const getters = {
  deployInfo (state) {
    return state.deployInfo;
  },
  deployHistory (state) {
    return state.deployHistory;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};