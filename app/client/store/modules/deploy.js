import Vue from 'vue';
import { INTERFACE } from '../../config';

const GET_DEPLOY_INFO = 'GET_DEPLOY_INFO';
const DO_DEPLOY = 'DO_DEPLOY';

const state = {
  deployInfo: {

  },
  deployHistory: {

  }
};

const mutations = {
  [DO_DEPLOY] (state, { projectId, deployInfo }) {
    Vue.set(state.deployInfo, projectId, deployInfo);
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
      commit(DO_DEPLOY, { projectId, deployInfo :body.data });
    }
  }
};

const getters = {
  deployInfo (state) {
    return state.deployInfo;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};