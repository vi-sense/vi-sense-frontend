<template>
  <div>
    <p>Options</p>

    <div>
      <v-subheader>Field of View</v-subheader>
      <v-slider
        v-model="fov"
        class="align-center"
        :max="fov_max"
        :min="fov_min"
        height=5
        thumb-label
        thumb-size="26"
        color="rgba(82, 186, 162, 1)"
        track-color="rgba(0, 0, 0, 0.3)"
        v-on:change="onSliderChanged('fov', fov)"
      ></v-slider>
    </div>

    <div>
      <v-subheader>Camera Clipping</v-subheader>
      <v-range-slider
        v-model="cameraClipping"
        class="align-center"
        :max="cameraClipping_max"
        :min="cameraClipping_min"
        height=5
        thumb-label
        thumb-size="26"
        color="rgba(82, 186, 162, 1)"
        track-color="rgba(0, 0, 0, 0.3)"
        v-on:change="onSliderChanged('clipping', cameraClipping)"
      ></v-range-slider>
    </div>

    <div>
      <v-btn color="rgba(82, 186, 162, 1)" dark block raised @click="onCameraSwitch()">Switch Camera</v-btn>
    </div>
  </div>
</template>

<script>
import {CAMERA_FOV, CAMERA_CLIPPING} from '../storage/Settings'
import {changeFOV, changeCameraClipping, switchCamera} from './babylon/cameras'

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
      },
      onCameraSwitch() {
        switchCamera()
      }
    }
}
</script>

<style scoped lang="scss">
#optionpane{
    padding: 1%;

  div {
    padding: 5px 0;
  }
}
</style>