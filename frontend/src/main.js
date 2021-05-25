import Vue from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
//import VueAxios from './plugins/axios'
import axios from './plugins/axios'
import FlashMessage from '@smartweb/vue-flash-message';

Vue.use( /*VueAxios,*/ axios)
Vue.use(FlashMessage)
Vue.config.productionTip = false

new Vue({
    store,
    router,


    //VueAxios,
    render: h => h(App)
}).$mount('#app')