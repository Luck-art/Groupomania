import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../views/Index.vue'


Vue.use(VueRouter)

const routes = [{
        path: '/',
        name: 'Index',
        component: Index
    },
    {
        path: '/identify',
        name: 'Identify',
        component: () =>
            import ('../views/Identify.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () =>
            import ('../views/Register.vue')
    },
    {
        path: '/forum',
        name: 'Forum',
        component: () =>
            import ('../views/Forum.vue')
    },
    {
        path: '/myaccount',
        name: 'Myaccount',
        component: () =>
            import ('../views/Myaccount.vue')
    },
]

const router = new VueRouter({
    mode: 'history',
    routes
})

export default router