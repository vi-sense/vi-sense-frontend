<template>
  <div>
    <p>Options</p>
    <div>
      <input name="check1" type="checkbox">
      <label>checkbox1</label>
    </div>
    <div>
      <input name="check2" type="checkbox">
      <label>checkbox2</label>
    </div>

    <div>
      <v-subheader class="pl-0">FOV</v-subheader>
      <v-slider
        v-model="fov"
        class="align-center"
        :max="fov_max"
        :min="fov_min"
        height=5
        thumb-label
        thumb-size="24"
        color="black"
        track-color="rgba(0,0,0,0.8)"
        v-on:change="onSliderChanged('fov', fov)"
      ></v-slider>
    </div>

    <div>
      <v-subheader class="pl-0">Clipping</v-subheader>
      <v-range-slider
        v-model="cameraClipping"
        class="align-center"
        :max="cameraClipping_max"
        :min="cameraClipping_min"
        height=5
        thumb-label
        thumb-size="24"
        color="black"
        track-color="rgba(0,0,0,0.5)"
        v-on:change="onSliderChanged('clipping', cameraClipping)"
      ></v-range-slider>
    </div>
  </div>
</template>

<script>
import {CAMERA_FOV, CAMERA_CLIPPING} from '../storage/Settings'
import {changeFOV, changeCameraClipping} from './babylon/cameras'

export default {
    props: ["STORE"],
    data () {
      return {
        fov_min: CAMERA_FOV.min,
        fov_max: CAMERA_FOV.max,
        fov: 80,
        cameraClipping_min: CAMERA_CLIPPING.min,
        cameraClipping_max: CAMERA_CLIPPING.max,
        cameraClipping: [1, 100]
      }
    },
    methods: {
      onSliderChanged(key, value) {
        console.log(key, value)
        switch(key) {
          case 'fov': changeFOV(value); break;
          case 'clipping': changeCameraClipping(value); break;
          default: break;
        }
      }
    }
}
</script>

<style scoped lang="scss">
#optionpane{
    padding: 1%;
}
div {
  padding: 5px 0;
}

.slider {
  width: 100%
}
</style>