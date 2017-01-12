import Vue from 'vue';
import { INTERFACE } from '../../config';

const INIT_DIFF = 'INIT_DIFF';
const GET_DIR_DIFF = 'GET_DIR_DIFF';
const GET_FILE_DIFF = 'GET_FILE_DIFF';

const state = {
  dirDiff: {
    diffSet: []
  },
  fileDiff: {
    diffSet: []
  }
};

const mutations = {
  [INIT_DIFF] (state) {
    state.dirDiff = {
      diffSet: []
    };
    state.fileDiff = {
      diffSet: []
    };
  },
  [GET_DIR_DIFF] (state, { diff }) {
    state.dirDiff = diff;
  },
  [GET_FILE_DIFF] (state, { diff }) {
    state.fileDiff = diff;
  }
};

const actions = {
  initDiff ({ commit }) {
    commit(INIT_DIFF);
  },
  async getDiff ({ commit }, { id, left, right }) {
    const res = await Vue.http.get(`${INTERFACE.PROJECTS}/${id}/diff`, {
      params: {
        left,
        right
      }
    });
    if (left || right) {
      commit(GET_FILE_DIFF, { diff: res.body.data });
    } else {
      commit(GET_DIR_DIFF, { diff: res.body.data });
    }
  }
};

const getters = {
  dirDiff (state) {
    return state.dirDiff;
  },
  fileDiff (state) {
    return state.fileDiff;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};