import Vue from 'vue';
import { INTERFACE } from '../../config';

const GET_MARK = 'GET_MARK';
const ADD_MARK = 'ADD_MARK';
const REMOVE_MARK = 'REMOVE_MARK';

const state = {
  mark: {

  }
};

const mutations = {
  [GET_MARK] (state, { buildId, buildMark }) {
    Vue.set(state.mark, buildId, buildMark);
  },

  [ADD_MARK] (state, { buildId, fileName, lineNum }) {
    if (!state.mark[buildId]) {
      Vue.set(state.mark, buildId, {});
    }
    let fileInfo = state.mark[buildId][fileName];
    if (!fileInfo) {
      Vue.set(state.mark[buildId], fileName, []);
      fileInfo = state.mark[buildId][fileName];
    }
    if (fileInfo.indexOf(lineNum) < 0) {
      fileInfo.push(lineNum);
    }
  },
  
  [REMOVE_MARK] (state, { buildId, fileName, lineNum }) {
    if (!state.mark[buildId]) {
      Vue.set(state.mark, buildId, {});
    }
    let fileInfo = state.mark[buildId][fileName];
    if (fileInfo) {
      const index = fileInfo.indexOf(lineNum);
      if (index >= 0) {
        fileInfo.splice(index, 1);
      }
    }
  }
};

const actions = {
  async getMark ({ commit }, { buildId }) {
    const res = await Vue.http.get(`${INTERFACE.MARKS}/build/${buildId}`);
    const files = res.body.data ? res.body.data.files : null;
    let buildMark = {};
    if (files) {
      buildMark = JSON.parse(files);
    }
    commit(GET_MARK, { buildId, buildMark });
  },

  async addMark ({ commit, state }, { buildId, fileName, lineNum }) {
    let mark = JSON.parse(JSON.stringify(state.mark));
    if (!mark[buildId]) {
      mark[buildId] = {};
    }
    let fileInfo = mark[buildId][fileName];
    if (!fileInfo) {
      fileInfo = mark[buildId][fileName] = [];
    }
    let fileInfoClone = fileInfo.slice(0);
    if (fileInfoClone.indexOf(lineNum) < 0) {
      fileInfoClone.push(lineNum);
    }
    await Vue.http.post(`${INTERFACE.MARKS}/build/${buildId}`, {
      file: fileName,
      info: fileInfoClone
    });
    commit(ADD_MARK, { buildId, fileName, lineNum });
  },

  async removeMark ({ commit, state }, { buildId, fileName, lineNum }) {
    let mark = JSON.parse(JSON.stringify(state.mark));
    if (!mark[buildId]) {
      mark[buildId] = {};
    }
    let fileInfo = mark[buildId][fileName];
    let fileInfoClone = fileInfo.slice(0);
    if (fileInfoClone) {
      const index = fileInfoClone.indexOf(lineNum);
      if (index >= 0) {
        fileInfoClone.splice(index, 1);
      }
    }
    await Vue.http.post(`${INTERFACE.MARKS}/build/${buildId}`, {
      file: fileName,
      info: fileInfoClone
    });
    commit(REMOVE_MARK, { buildId, fileName, lineNum });
  }
};

const getters = {
  codeMark (state) {
    return state.mark;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};