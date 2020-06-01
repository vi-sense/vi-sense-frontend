<template lang="html">
  <div class="model" v-if="model">
    <h1 class="model__title">{{ model.name }}</h1>
    <p class="model__body">{{ model.description }}</p>
    <p  class="model__id">{{ model.id }}</p>
    <img class="model__image" :src="this.endpoint + model.image_url">
    <router-link :to="{name: 'modelpage', params: {id: model.id, name: model.name, sensors: model.sensors}}">See 3D Model</router-link>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: ["id"],
  data() {
    return {
      model: null,
      endpoint: process.env.API_URL+"/"
    };
  },
  methods: {
    getModel(id) {
      axios(this.endpoint + "models/"+id)
        .then(response => {
          this.model = response.data;
        })
        .catch(error => {
          console.log(error);
        });
    }
  },
  created() {
    this.getModel(this.id);
  },
  watch: {
    $route() {
      this.getModel(this.id);
    }
  }
};
</script>

<style scoped lang="scss">
.model {
  position: relative;
  max-width: 500px;
  margin: 0 auto;
  padding: 50px 20px 70px;
  &__title {
    position: relative;
    text-transform: uppercase;
    z-index: 1;
  }
  &__body {
    position: relative;
    z-index: 1;
  }
  &__id {
    position: absolute;
    font-size: 280px;
    bottom: -50px;
    margin: 0;
    color: #eeeeee;
    right: -20px;
    line-height: 1;
    font-weight: 900;
    z-index: 0;
  }
  &__image {
    width: 50%;
    height: 50%;
    position: absolute;
    bottom: -100px;
    margin: 0;
    right: 250px;
    line-height: 1;
    z-index: 0;
  }
}
</style>