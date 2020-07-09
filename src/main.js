import Vue from 'vue'
import Router from 'vue-router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import App from './App.vue'
import Landingpage from './landingpage/Landingpage.vue'
import Startpage from './startpage/Startpage.vue'
import Modelpage from './modelpage/Modelpage.vue'
import History from './modelpage/History.vue'
import TimelineTest from './modelpage/timeline/TimelineTest.vue'
import '@mdi/font/css/materialdesignicons.css'

import 'leaflet/dist/leaflet.css';


Vue.config.productionTip = false

Vue.use(Vuetify)
let vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi', // default - only for display purposes
  },
})

//empty vue component used as event bus
export const eventBus = new Vue();

Vue.use(Router)
const router = new Router({
  routes: [
    {
      path: '/timeline_test',
      name: 'timeline_test',
      component: TimelineTest,
    },
    {
      path: '/landingpage',
      name: 'landingpage',
      component: Landingpage,
    },
    {
      path: '/modelview/:id',
      name: 'modelview',
      component: Modelpage,
      props: true,
    },
    {
      path: '/history/:modelId',
      name: 'history',
      component: History,
      props: true,
    },
    {
      path: '/',
      component: Startpage,
    },
    {
      path: '*',
      redirect: "/landingpage",
    },
  ]
})

new Vue({
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app')
