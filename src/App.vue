<template>
  <div id="app">
    <header>
      <h1>Vi-Sense</h1>
      <h2 class="header__title title-header">
    {{ $route.meta.title }}
 </h2>
    </header>
    <main>
      <aside class="sidebar">
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
  import axios from 'axios'
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
  body {
    margin: 0;
    padding: 0;
  }
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }
  h1, h2 {
    font-weight: normal;
  }
  ul {
    list-style-type: none;
    padding: 0;
  }
  li {
    display: inline-block;
    margin: 0 10px;
  }
  header {
    position: fixed;
    top: 0;
    width: 100%;
    min-height: 90px;
    border-bottom: 1px solid #42b983;
    text-align: center;
    background: #ffffff;
  }
  main {
    display: flex;
    height: calc(100vh - 90px);
    margin-top: 90px;
    margin-left: auto;
    margin-right: auto;
    overflow: hidden;
  }
  aside {
    flex: 1 0 20%;
    height: 100%;
    overflow-y: auto;
    width: 20%;
    padding: 1%;
    box-sizing: border-box;
    border-right: 1px solid #42b983;
  }
  .content {
    flex: 1 1 80%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  .link {
    display: block;
    text-decoration: none;
    margin-bottom: 10px;
    color: #2c3e50;
    &--home {
      text-transform: uppercase;
      margin-bottom: 30px;
    }
    &.is-active {
      color: #42b983;
    }
  }
</style>