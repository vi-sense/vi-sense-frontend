<template>
    <v-app>
      <router-view id="app_router_view"></router-view>
    </v-app>
</template>

<script>
  import axios from 'axios';
  
  export default {
    data () {
      return { }
    }
  }
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  overflow: hidden;
}

*{
  font-family: Helvetica !important;
}

html, body, #app_router_view, #app{
  width: 100%;
  height: 100%;
    font-size: small;
}

#app_router_view{
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.v-tooltip__content {
    line-height: 1em;
    font-size: 1em;
    padding-left: 8px;
    padding-right: 8px;
}

.v-btn{
  border-radius: 1px;
}

</style>