import Vue from 'vue'
import Vuex from 'vuex'


Vue.use(Vuex)

export default new Vuex.Store({

    state: { // Les données incluses dans le store
        userId: 0,
        token: null,
        username: null
    },
    getters: { // Permet de faire des modifications en se basant sur le state (par ex resultat du state X 2)

    },

    mutations: { // Permet de mettre les données à jour  

        SET_USER_ID(state, userId = this.userId) {
            state.userId = Number(userId);
        },
        SET_TOKEN(state, infoToken = this.token) {
            state.token = String(infoToken);
        },
        SET_USERNAME(state, username = this.username) {
            state.username = String(username);
        }

    },
    actions: {
        setUserId({ commit }, userId) {
            commit('SET_USER_ID', userId);
        },
        setToken({ commit }, infoToken) {
            commit('SET_TOKEN', infoToken);
        },
        setUsername({ commit }, username) {
            commit('SET_USERNAME', username);
        }

    },
    modules: {}
})