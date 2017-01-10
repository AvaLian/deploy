import Vue from 'vue';
import { INTERFACE } from '../../config';

const GET_DIR_DIFF = 'GET_DIR_DIFF';

const state = {
  dirDiff: {
    left: [],
    right: [],
    diffSet: []
  }
};

const mutations = {
  [GET_DIR_DIFF] (state, { dirDiff }) {
    state.dirDiff = dirDiff;
  }
};

const actions = {
  async getDirDiff ({ commit }, { id }) {
    const res = await Vue.http.get(`${INTERFACE.PROJECTS}/${id}/diff`);
    commit(GET_DIR_DIFF, { dirDiff: res.body.data});
  }
};

const getters = {
  dirDiff (state) {
    return state.dirDiff;
  }
};

export default {
  state,
  mutations,
  actions,
  getters
};