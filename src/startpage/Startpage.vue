<template>
  <div id="app">

    <header>
      <h1>Vi-Sense</h1>
      <h2 class="header__title title-header">{{ $route.meta.title }}</h2>
    </header>

    <main>
      <aside class="sidebar" >
        <router-link
            v-for="model in models"
            active-class="is-active"
            class="link"
            :key="model.id"
            :to="{ name: 'model', params: { id: model.id } }">
          {{model.id}}. {{model.name}}
        </router-link>
      </aside>
      <div class="content">
        <router-view></router-view>
      </div>
    </main>
    
  </div>
</template>

<script>
  import axios from 'axios';
  export default {
    data () {
      return {
        models: [],
      }
    },
    created() {
      this.getAllModels();
    },
    methods: {
      getAllModels() {
        axios.get(process.env.API_URL+"/models")
          .then(response => {
            this.models = response.data;
          })
          .catch(error => {
            console.log(error);
          })
      }
    }
  }
</script>

<style lang="scss">
</style>