import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    serverUrl: 'http://localhost:8000/',
    api: 'http://localhost:8000/api/',
    authTokenKey: 'healthHuddy:authToken',
    refreshTokenKey: 'healthHuddy:refreshToken',
    loginAfterRouteName: 'Admin',
  },
  getters: {
    usersUrl(state) {
      return `${state.api}users`;
    },
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  },
});
