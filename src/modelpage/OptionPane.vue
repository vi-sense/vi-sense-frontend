<template>
  <div>
    <div>
      <p>3D View Options</p>

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

    <div>
      <p>Timeline Options</p>
      <p>Speed</p>
      <input id="speed" type="number" min="1" max="50">

      <v-subheader>Y Axis Domain</v-subheader>
        <v-range-slider
          v-model="ydomain"
          class="align-center"
          :max="100"
          :min="-20"
          height=5
          thumb-label
          thumb-size="26"
          color="rgba(82, 186, 162, 1)"
          track-color="rgba(0, 0, 0, 0.3)"
          v-on:change="onSliderChanged('ydomain', ydomain)"
        >
      </v-range-slider>
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
        cameraClipping: [1, 100],
        ydomain: []
      }
    },
    mounted(){
      this._timeline = this.STORE._timelineInstance // set from Timeline.vue
      this.ydomain = [...this._timeline.getDomainY()]

      let speed = document.querySelector("#speed")
      speed.value = this._timeline.getSpeed()
      speed.oninput = e => { this._timeline .setSpeed(e.target.value) }
    },
    methods: {
      onSliderChanged(key, value) {
        switch(key) {
          case 'fov': changeFOV(value); break;
          case 'clipping': changeCameraClipping(value); break;
          case 'ydomain' :this._timeline.setDomainY(value[0], value[1]); break;
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