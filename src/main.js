import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'
import Model from './components/Model.vue'
import Welcome from './components/Welcome.vue'
import Babylon from './components/Babylon.vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false

Vue.use(Vuetify)
let vuetify = new Vuetify({})

Vue.use(Router)
const router = new Router({
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: Welcome,
    },
    {
      path: '/model/:id',
      name: 'model',
      component: Model,
      props: true,
      meta: { title: '' },
    },
    {
      path: '/babylon/:id',
      name: 'babylon',
      component: Babylon,
      props: true,
    }
  ]
})

new Vue({
  vuetify,
  router,
  el: '#app',
  render: h => h(App),
}).$mount('#app')
