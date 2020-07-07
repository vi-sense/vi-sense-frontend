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
        <v-subheader>Far Camera Clipping<v-spacer/>
        <input v-model="cameraClipping" type="number" min=10 max=1000 v-on:input="onSliderChanged('clipping', cameraClipping)"></v-subheader>

        <input class="slider" v-model="cameraClipping" type="range" min=10 max=1000 v-on:input="onSliderChanged('clipping', cameraClipping)" />
      </div>

      <div>
        <v-btn color="rgba(82, 186, 162, 1)" dark block raised @click="onCameraSwitch()">Switch Camera</v-btn>
      </div>
    </div>

    <hr>

    <div>
      <p>Clipping Planes</p>
      <div class="start flex-row">
        <v-checkbox 
          class="pr-1 mt-0" 
          hide-details 
          dense 
          color="rgba(82, 186, 162, 1)"
          multiple
          @change="handleClippingPlane(!clip_x.enabled, 'x', clip_x.value, clip_x.flipped)">
        </v-checkbox>
        <v-subheader>X Axis</v-subheader>
      </div>
      <div class="flex-row">
        <input class="slider" type="range" :disabled="!clip_x.enabled" v-model="clip_x.value" :min="clip_x.min" :max="clip_x.max" v-on:input="handleClippingPlane(clip_x.enabled, 'x', clip_x.value, clip_x.flipped)" />
        <v-tooltip bottom>
            <template #activator="{ on, attrs }">
                <v-icon @click="handleClippingPlane(clip_x.enabled, 'x', -clip_x.value, !clip_x.flipped)"
                        color="rgba(82, 186, 162, 1)"
                        v-bind="attrs"
                        v-on="on"
                >mdi-flip-horizontal</v-icon>
            </template>
            <span>Flip Clipping Plane</span>
        </v-tooltip>
      </div>

      <div class="start flex-row">
        <v-checkbox 
          class="pr-1 mt-0" 
          hide-details 
          dense 
          color="rgba(82, 186, 162, 1)"
          multiple
          @change="handleClippingPlane(!clip_y.enabled, 'y', clip_y.value, clip_y.flipped)">
        </v-checkbox>
        <v-subheader>Y Axis</v-subheader>
      </div>
      <div class="flex-row">
        <input class="slider" type="range" :disabled="!clip_y.enabled" v-model="clip_y.value" :min="clip_y.min" :max="clip_y.max" v-on:input="handleClippingPlane(clip_y.enabled, 'y', clip_y.value, clip_y.flipped)" />
        <v-tooltip bottom>
            <template #activator="{ on, attrs }">
                <v-icon @click="handleClippingPlane(clip_y.enabled, 'y', -clip_y.value, !clip_y.flipped)"
                        color="rgba(82, 186, 162, 1)"
                        v-bind="attrs"
                        v-on="on"
                >mdi-flip-horizontal</v-icon>
            </template>
            <span>Flip Clipping Plane</span>
        </v-tooltip>
      </div>

    <div class="start flex-row">
        <v-checkbox 
          class="pr-1 mt-0" 
          hide-details 
          dense 
          color="rgba(82, 186, 162, 1)"
          multiple
          @change="handleClippingPlane(!clip_z.enabled, 'z', clip_z.value, clip_z.flipped)">
        </v-checkbox>
        <v-subheader>Z Axis</v-subheader>
      </div>
      <div class="flex-row">
        <input class="slider" type="range" :disabled="!clip_z.enabled" v-model="clip_z.value" :min="clip_z.min" :max="clip_z.max" v-on:input="handleClippingPlane(clip_z.enabled, 'z', clip_z.value, clip_z.flipped)" />
        <v-tooltip bottom>
            <template #activator="{ on, attrs }">
                <v-icon @click="handleClippingPlane(clip_z.enabled, 'z', -clip_z.value, !clip_z.flipped)"
                        color="rgba(82, 186, 162, 1)"
                        v-bind="attrs"
                        v-on="on"
                >mdi-flip-horizontal</v-icon>
            </template>
            <span>Flip Clipping Plane</span>
        </v-tooltip>
      </div>
    </div>

    <hr>

    <div>
      <p>Timeline Options</p>

      <div>
        <v-subheader>Playback Speed<v-spacer/>
          <input id="speed" type="number" min="1" max="50">
        </v-subheader>
      </div>

      <div>
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

  </div>
</template>

<script>
import {CAMERA_FOV, CAMERA_CLIPPING} from '../storage/Settings'
import {changeFOV, changeCameraClipping, switchCamera} from './babylon/cameras'
import {changeClippingPlane} from './babylon/clippingPlanes'
import {eventBus} from "../main";

export default {
    props: ["STORE"],
    data () {
      return {
        fov_min: CAMERA_FOV.min,
        fov_max: CAMERA_FOV.max,
        fov: 80,
        cameraClipping_min: CAMERA_CLIPPING.min,
        cameraClipping_max: CAMERA_CLIPPING.max,
        cameraClipping: 500,
        clip_x: {
          min: -100,
          max: 100,
          enabled: false,
          value: 0,
          flipped: false
        },
        clip_y: {
          min: -100,
          max: 100,
          enabled: false,
          value: 0,
          flipped: false
        },
        clip_z: {
          min: -100,
          max: 100,
          enabled: false,
          value: 0,
          flipped: false
        },
        ydomain: []
      }
    },
    mounted(){
      this.ydomain = this.STORE._timelineInstance.getDomainY()
      let speed = document.querySelector("#speed")
      speed.value = this.STORE._timelineInstance.getSpeed()
      speed.oninput = e => { this.STORE._timelineInstance.setSpeed(e.target.value) }
      eventBus.$on("bounding-box-defined", (outerMax) => {
        this.clip_x.max = outerMax.x
        this.clip_x.min = -outerMax.x
        this.clip_y.max = outerMax.y
        this.clip_y.min = -outerMax.y
        this.clip_z.max = outerMax.z
        this.clip_z.min = -outerMax.z
      })
    },
    methods: {
      onSliderChanged(key, value) {
        switch(key) {
          case 'fov': changeFOV(value); break;
          case 'clipping': changeCameraClipping(parseInt(value)); break;
          case 'ydomain' : this.STORE._timelineInstance.setDomainY(value[0], value[1]); break;
          default: break;
        }
      },
      handleClippingPlane(enabled, axis, value, flipped) {
        switch(axis) {
          case 'x': {
            this.clip_x.enabled = enabled
            this.clip_x.flipped = flipped
            this.clip_x.value = value;
            changeClippingPlane(axis, this.clip_x)
            break;
          }
          case 'y': {
            this.clip_y.enabled = enabled
            this.clip_y.flipped = flipped
            this.clip_y.value = value;
            changeClippingPlane(axis, this.clip_y)
            break;
          }
          case 'z': {
            this.clip_z.enabled = enabled
            this.clip_z.flipped = flipped
            this.clip_z.value = value;
            changeClippingPlane(axis, this.clip_z)
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
  padding: 10px 12px;

  div {
    padding: 3px 0
  }

  p {
    margin-bottom: 8px;
  }

  .v-subheader {
    height: auto;
  }

  hr {
    border: 0.8px solid rgba(127, 127, 127, 0.5);
    margin: 12px 0;
  }

  input[type=range] {
    height: 22px;
    -webkit-appearance: none;
    margin: 5px 0;
    width: 100%;
    outline: none !important;
  }
  input[type=range]:focus {
    outline: none;
  }
  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 2px;
    cursor: pointer;
    animate: 0.2s;
    background: #52BAA2;
    border-radius: 10px;
  }
  input[type=range]:disabled::-webkit-slider-runnable-track {
    background: grey;
  }

  input[type=range]::-webkit-slider-thumb {
    border: 1px solid #52BAA2;
    height: 10px;
    width: 10px;
    border-radius: 15px;
    background: #52BAA2;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -4px;
  }
  input[type=range]:disabled::-webkit-slider-thumb {
    background: grey;
    border: 1px solid grey;
  }

  input[type=range]:focus::-webkit-slider-runnable-track {
    background: #52BAA2;
  }
  input[type=range]::-moz-range-track {
    width: 100%;
    height: 2px;
    cursor: pointer;
    animate: 0.2s;
    background: #52BAA2;
    border-radius: 10px;
  }
  input[type=range]:disabled::-moz-range-track {
    background: grey;
  }

  input[type=range]::-moz-range-thumb {
    border: 1px solid #52BAA2;
    height: 10px;
    width: 10px;
    border-radius: 15px;
    background: #52BAA2;
    cursor: pointer;
  }
  input[type=range]:disabled::-moz-range-thumb {
    background: grey;
    border: 1px solid grey;
  }

  input[type=range]::-ms-track {
    width: 100%;
    height: 2px;
    cursor: pointer;
    animate: 0.2s;
    background: transparent;
    border-color: transparent;
    color: transparent;
  }

  input[type=range]::-ms-fill-lower {
    background: #52BAA2;
    border-radius: 20px;
  }
  input[type=range]:disabled::-ms-fill-lower{
    background: grey;
  }

  input[type=range]::-ms-fill-upper {
    background: #52BAA2;
    border-radius: 20px;
  }
  input[type=range]:disabled::-ms-fill-upper {
    background: grey;
  }

  input[type=range]::-ms-thumb {
    margin-top: 1px;
    border: 1px solid #52BAA2;
    height: 10px;
    width: 10px;
    border-radius: 15px;
    background: #52BAA2;
    cursor: pointer;
  }
  input[type=range]:disabled::-ms-thumb {
    background: grey;
    border: 1px solid grey;
  }

  input[type=range]:focus::-ms-fill-lower {
    background: #52BAA2;
  }
  input[type=range]:focus::-ms-fill-upper {
    background: #52BAA2;
  }


  input[type=number] {
    width: 25%;
  }

  .flex-row {
    display: flex;
    justify-content: space-between;
    margin: 0;
    padding: 0;
    
    input[type=range] {
      width: 80%;
      margin: 0;
    }
  }
  .start {
      justify-content: start;
    }
}


</style>