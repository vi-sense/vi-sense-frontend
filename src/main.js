import Vue from 'vue'
import Router from 'vue-router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import App from './App.vue'
import Landingpage from './Landingpage.vue'
import Startpage from './startpage/Startpage.vue'
import Welcome from './startpage/Welcome.vue'
import Model from './startpage/Model.vue'
import Modelpage from './modelpage/Modelpage.vue'


Vue.config.productionTip = false

Vue.use(Vuetify)
let vuetify = new Vuetify({})

Vue.use(Router)
const router = new Router({
  routes: [
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
      path: '/',
      component: Startpage,
      children:[
        {
          path: '/',
          name: 'welcome',
          component: Welcome,
          props: true,
          meta: { title: '' },
        },
        {
          path: '/model/:id',
          name: 'model',
          component: Model,
          props: true,
          meta: { title: '' },
        }
      ]
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
  el: '#app',
  render: h => h(App),
}).$mount('#app')
