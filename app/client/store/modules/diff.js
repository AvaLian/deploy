import Vue from 'vue';
import { INTERFACE } from '../../config';

const INIT_DIFF = 'INIT_DIFF';
const INIT_FILE_DIFF = 'INIT_FILE_DIFF';
const GET_DIR_DIFF = 'GET_DIR_DIFF';
const GET_FILE_DIFF = 'GET_FILE_DIFF';
const MARK_DIFF_FILE = 'MARK_DIFF_FILE';

const state = {
  dirDiff: {
    diffSet: []
  },
  fileDiff: {
    diffInfo: {
      total: 0
    },
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
  [INIT_FILE_DIFF] (state) {
    state.fileDiff = {
      diffSet: []
    };
  },
  [GET_DIR_DIFF] (state, { diff }) {
    state.dirDiff = diff;
  },
  [GET_FILE_DIFF] (state, { diff }) {
    state.fileDiff = diff;
  },
  [MARK_DIFF_FILE] (state, { diffFile }) {
    let dirDiffClone = Object.assign({}, state.dirDiff);
    let different = {};
    let index = -1;
    dirDiffClone.diffSet.forEach((item, i) => {
      if (item.fullname === diffFile) {
        item.marked = true;
        different = item;
        index = i;
      }
    });
    if (index >= 0) {
      state.dirDiff.diffSet.splice(index, 1, different);
    }
  }
};

const actions = {
  initDiff ({ commit }) {
    commit(INIT_DIFF);
  },
  initFileDiff ({ commit }) {
    commit(INIT_FILE_DIFF);
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
  },

  markDiffFile ({ commit }, { diffFile }) {
    commit(MARK_DIFF_FILE, { diffFile });
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