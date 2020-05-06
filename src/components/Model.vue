<template lang="html">
  <div class="model" v-if="model">
    <h1 class="model__title">{{ model.Name }}</h1>
    <p class="model__body">{{ model.Description }}</p>
    <p  class="model__id">{{ model.ID }}</p>
    <img class="model__image" :src="'http://visense.f4.htw-berlin.de:8080/' + model.ImageUrl">
    <router-link :to="{name: 'babylon', params: {id: model.ID, name: model.Name}}">See 3D Model</router-link>
  </div>
</template>

<script>
import axios from "axios";
export default {
  props: ["id"],
  data() {
    return {
      model: null,
      endpoint: "http://visense.f4.htw-berlin.de:8080/models/" // here put the endpoint of all the models from backend
    };
  },
  methods: {
    getModel(id) {
      axios(this.endpoint + id)
        .then(response => {
          this.model = response.data;
        })
        .catch(error => {
          console.log("-----error-------");
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

<style lang="scss" scoped>
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