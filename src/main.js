import Vue from 'vue'
import Router from 'vue-router'
import App from './App.vue'
import Model from './components/Model.vue'
import Hello from './components/Hello.vue'
import Babylon from './components/Babylon.vue'
import vuetify from './plugins/vuetify' // path to vuetify export


//Vue.use(Vuetify);


Vue.use(Router)
Vue.config.productionTip = false


const router = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Hello,
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
