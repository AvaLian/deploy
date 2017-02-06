const ADD_MARK = 'ADD_MARK';
const REMOVE_MARK = 'REMOVE_MARK';

const state = {
  mark: {

  }
};

const mutations = {
  [ADD_MARK] (state, { projectId, fileName, lineNum }) {
    let markClone = Object.assign({}, state.mark);
    if (!markClone[projectId]) {
      markClone[projectId] = {};
    }
    let fileInfo = markClone[projectId][fileName];
    if (!fileInfo) {
      fileInfo = markClone[projectId][fileName] = [];
    }
    if (fileInfo.indexOf(lineNum) < 0) {
      fileInfo.push(lineNum);
    }
    state.mark = markClone;
  },
  [REMOVE_MARK] (state, { projectId, fileName, lineNum }) {
    let markClone = Object.assign({}, state.mark);
    let fileInfo = markClone[projectId][fileName];
    if (fileInfo) {
      const index = fileInfo.indexOf(lineNum);
      if (index >= 0) {
        fileInfo.splice(index, 1);
      }
    }
    state.mark = markClone;
  }
};

const actions = {
  addMark ({ commit }, { projectId, fileName, lineNum }) {
    commit(ADD_MARK, { projectId, fileName, lineNum });
  },

  removeMark ({ commit }, { projectId, fileName, lineNum }) {
    commit(REMOVE_MARK, { projectId, fileName, lineNum });
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