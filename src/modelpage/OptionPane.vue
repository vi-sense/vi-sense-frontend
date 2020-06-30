<template>
  <div>
    <div>
      <p>3D View Options</p>

      <div>
          <v-subheader>Field of View <v-spacer/>
          <input v-model="fov" type="number" min=40 max=160 v-on:input="onSliderChanged('fov', fov)"></v-subheader>

        <input class="slider" v-model="fov" type="range" min=40 max=160 v-on:input="onSliderChanged('fov', fov)" />
      </div>

      <div>
        <v-subheader>Clipping Planes</v-subheader>
        <div class="row">
          <v-checkbox 
            class="pr-1 mt-0" 
            hide-details 
            dense 
            color="rgba(82, 186, 162, 1)"
            multiple
            label="X Axis"
            @change="handleClippingPlane(!clipPlane_x, 'x', clipPlane_x_value, clipPlane_x_flipped)">
          </v-checkbox>
        </div>
        <div class="row">
          <input class="slider" type="range" :disabled="!clipPlane_x" v-model="clipPlane_x_value" min=-100 max=100 v-on:input="handleClippingPlane(clipPlane_x, 'x', clipPlane_x_value, clipPlane_x_flipped)" />
          <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                  <v-icon @click="handleClippingPlane(clipPlane_x, 'x', -clipPlane_x_value, !clipPlane_x_flipped)"
                          color="rgba(82, 186, 162, 1)"
                          v-bind="attrs"
                          v-on="on"
                  >mdi-flip-horizontal</v-icon>
              </template>
              <span>Flip Clipping Plane</span>
          </v-tooltip>
        </div>
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
import {changeClippingPlane} from './babylon/clippingPlanes'

export default {
    props: ["STORE"],
    data () {
      return {
        fov_min: CAMERA_FOV.min,
        fov_max: CAMERA_FOV.max,
        fov: 80,
        clipPlane_x: false,
        clipPlane_x_value: 0,
        clipPlane_x_flipped: false,
        clipPlane_y: false,
        clipPlane_y_value: 0,
        clipPlane_y_flipped: false,
        clipPlane_z: false,
        clipPlane_z_value: 0,
        clipPlane_z_flipped: false,
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
      handleClippingPlane(enabled, axis, value, flipped) {
        switch(axis) {
          case 'x': {
            if(enabled != this.clipPlane_x) this.clipPlane_x = !this.clipPlane_x
            if(flipped != this.clipPlane_x_flipped) this.clipPlane_x_flipped = !this.clipPlane_x_flipped
            this.clipPlane_x_value = value;
            changeClippingPlane(this.clipPlane_x, axis, this.clipPlane_x_value, this.clipPlane_x_flipped)
            break;
          }
          case 'y': {
            if(enabled != this.clipPlane_y) this.clipPlane_y = !this.clipPlane_y
            if(flipped != this.clipPlane_y_flipped) this.clipPlane_y_flipped = !this.clipPlane_y_flipped
            this.clipPlane_y_value = value;
            changeClippingPlane(this.clipPlane_y, axis, this.clipPlane_y_value, this.clipPlane_y_flipped)
            break;
          }
          case 'z': {
            if(enabled != this.clipPlane_z) this.clipPlane_z = !this.clipPlane_z
            if(flipped != this.clipPlane_z_flipped) this.clipPlane_z_flipped = !this.clipPlane_z_flipped
            this.clipPlane_z_value = value;
            changeClippingPlane(this.clipPlane_z, axis, this.clipPlane_z_value, this.clipPlane_z_flipped)
            break;
          }
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

  .slider {
    width: 100%
  }

  input[type=number] {
    width: 25%;
  }

  .row {
    display: flex;
    justify-content: space-between;
    margin: 0;
    input[type=range] {
    width: 75%;
  }
  }
}


</style>