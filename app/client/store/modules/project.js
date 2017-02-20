import Vue from 'vue';
import { INTERFACE } from '../../config';

const GET_PROJECT = 'GET_PROJECT';
const GET_SOURCE_REPO_INFO = 'GET_SOURCE_REPO_INFO';
const GET_ONLINE_REPO_INFO = 'GET_ONLINE_REPO_INFO';
const PROJECT_BUILD_LOG = 'PROJECT_BUILD_LOG';
const MODIFY_PROJECT_BUILD_STATUS = 'MODIFY_PROJECT_BUILD_STATUS';
const MODIFY_PROJECT_BUILD_COUNT = 'MODIFY_PROJECT_BUILD_COUNT';

const state = {
  project: {
    buildStatus: -1
  },
  sourceRepoInfo: {
    lastCommit: {}
  },
  onlineRepoInfo: {
    lastCommit: {}
  },
  buildRecord: {}
};

const mutations = {
  [GET_PROJECT] (state, { project }) {
    state.project = project;
  },

  [MODIFY_PROJECT_BUILD_STATUS] (state, { status }) {
    state.project.buildStatus = status;
    state.buildRecord.status = status;
  },

  [MODIFY_PROJECT_BUILD_COUNT] (state, { count }) {
    state.project.buildCount = count;
  },

  [GET_SOURCE_REPO_INFO] (state, { sourceRepoInfo }) {
    state.sourceRepoInfo = sourceRepoInfo;
  },

  [GET_ONLINE_REPO_INFO] (state, { onlineRepoInfo }) {
    state.onlineRepoInfo = onlineRepoInfo;
  },

  [PROJECT_BUILD_LOG] (state, { buildRecord }) {
    state.buildRecord = buildRecord;
  }
};

const actions = {

  initProject ({ commit }) {
    commit(GET_PROJECT, { project: { } });
  },

  initProjectRepoInfo ({ commit }) {
    commit(GET_SOURCE_REPO_INFO, { sourceRepoInfo: { lastCommit: {} } });
    commit(GET_ONLINE_REPO_INFO, { onlineRepoInfo: { lastCommit: {} } });
  },

  modifyProjectBuildStatus ({ commit }, { status }) {
    commit(MODIFY_PROJECT_BUILD_STATUS, { status });
  },

  modifyProjectBuildCount ({ commit }, { count }) {
    commit(MODIFY_PROJECT_BUILD_COUNT, { count });
  },

  async getProject ({ commit }, { id }) {
    const res = await Vue.http.get(`${INTERFACE.PROJECTS}/${id}`);
    commit(GET_PROJECT, { project: res.body.data});
  },

  async getSourceRepoInfo ({ commit }, { id}) {
    const res = await Vue.http.get(`${INTERFACE.PROJECTS}/${id}/source`);
    commit(GET_SOURCE_REPO_INFO, { sourceRepoInfo: res.body.data});
  },

  async getOnlineRepoInfo ({ commit }, { id, onlineRepo, name }) {
    const res = await Vue.http.get(`${INTERFACE.PROJECTS}/${id}/online`, {
      params: {
        onlineRepo,
        name
      }
    });
    commit(GET_ONLINE_REPO_INFO, { onlineRepoInfo: res.body.data});
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
  },

  async initBuildRecord ({ commit }) {
    commit(PROJECT_BUILD_LOG, { buildRecord: {}});
  }
};

const getters = {
  project (state) {
    return state.project;
  },
  sourceRepoInfo (state) {
    return state.sourceRepoInfo;
  },
  onlineRepoInfo (state) {
    return state.onlineRepoInfo;
  },
  buildRecord (state) {
    return state.buildRecord;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};