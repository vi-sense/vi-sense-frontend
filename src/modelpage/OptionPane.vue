<template>
  <div>
    <h3 class="pt-2">Options menu</h3>

    <div>
      <h4 class="pt-2">3D View</h4>
      <div>
        <v-subheader>Field of View</v-subheader>
        <div class="flex-row">
          <input class="slider" v-model="fov" type="range" min=40 max=160 v-on:input="onSliderChanged('fov', fov)">
          <input v-model="fov" type="number" min=40 max=160 v-on:input="onSliderChanged('fov', fov)">
        </div>
      </div>
      <div>
        <v-subheader>Far Camera Clipping</v-subheader>
        <div class="flex-row">
          <input class="slider" v-model="cameraClipping" type="range" min=10 max=1000 v-on:input="onSliderChanged('clipping', cameraClipping)">
          <input v-model="cameraClipping" type="number" min=10 max=1000 v-on:input="onSliderChanged('clipping', cameraClipping)">
        </div>
      </div>
    </div>

   <div>
      <h4 class="pt-2">Camera</h4>
      <div>
        <v-btn color="rgba(82, 186, 162, 1)" dark block raised @click="onCameraSwitch()">Switch Camera</v-btn>
      </div>
   </div>

    <div>
      <h4 class="pt-2">Clipping planes</h4>

      <div v-for="clip of clippingPlanes" :key="clip.axis">
        <div class="start flex-row">
          <v-subheader>{{clip.axis}}-Axis</v-subheader>
        </div>
        <div class="flex-row">
          <v-checkbox 
            class="pr-1 mt-0" 
            hide-details 
            dense 
            color="rgba(82, 186, 162, 1)"
            multiple
            @change="handleClippingPlane(!clip.enabled, clip.axis, clip.value, clip.flipped)">
          </v-checkbox>
          <input class="slider" type="range" :disabled="!clip.enabled" v-model="clip.value" :min="clip.min" :max="clip.max" v-on:input="handleClippingPlane(clip.enabled, clip.axis, clip.value, clip.flipped)" />
          <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                  <v-icon @click="handleClippingPlane(clip.enabled, clip.axis, -clip.value, !clip.flipped)"
                    color="rgba(82, 186, 162, 1)"
                    v-bind="attrs"
                    v-on="on"
                  >mdi-flip-horizontal</v-icon>
              </template>
              <span>Flip Clipping Plane</span>
          </v-tooltip>
        </div>
      </div>
    </div>


    <div>
      <h4 class="pt-2">Timeline</h4>
      <div>
        <v-subheader>Playback Speed<v-spacer/>
          <input id="speed" type="number" min="1" max="50">
        </v-subheader>
      </div>
      <div>
        <v-subheader>Y Domain
          <v-spacer/>
          min<input v-model="ydomain[0]" type="number" min="-20" max="100">
          max<input v-model="ydomain[1]" type="number" min="-20" max="100">
        </v-subheader>
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
        clippingPlanes: [
          {
            axis: "X",
            min: -100,
            max: 100,
            enabled: false,
            value: 0,
            flipped: false
          },
          {
            axis: "Y",
            min: -100,
            max: 100,
            enabled: false,
            value: 0,
            flipped: false
          },
          {
            axis: "Z",
            min: -100,
            max: 100,
            enabled: false,
            value: 0,
            flipped: false
          }
        ],
        ydomain: []
      }
    },
    mounted(){
      this.ydomain = this.STORE._timelineInstance.getDomainY()
      
      let speed = document.querySelector("#speed")
      speed.value = this.STORE._timelineInstance.getSpeed()
      speed.oninput = e => { this.STORE._timelineInstance.setSpeed(e.target.value) }

      eventBus.$on("bounding-box-defined", (outerMax) => {
        this.clippingPlanes[0].max = outerMax.x
        this.clippingPlanes[0].min = -outerMax.x
        this.clippingPlanes[1].max = outerMax.y
        this.clippingPlanes[1].min = -outerMax.y
        this.clippingPlanes[2].max = outerMax.z
        this.clippingPlanes[2].min = -outerMax.z
      })
    },
    watch: {
      ydomain(){
        this.STORE._timelineInstance.setDomainY(this.ydomain[0], this.ydomain[1]);        
      }
    },
    methods: {
      onSliderChanged(key, value) {
        switch(key) {
          case 'fov': changeFOV(value); break;
          case 'clipping': changeCameraClipping(parseInt(value)); break;
          default: break;
        }
      },
      handleClippingPlane(enabled, axis, value, flipped) {        
        switch(axis) {
          case 'X': {
            this.clippingPlanes[0].enabled = enabled
            this.clippingPlanes[0].flipped = flipped
            this.clippingPlanes[0].value = value;
            changeClippingPlane(axis, this.clippingPlanes[0])
            break;
          }
          case 'Y': {
            this.clippingPlanes[1].enabled = enabled
            this.clippingPlanes[1].flipped = flipped
            this.clippingPlanes[1].value = value;
            changeClippingPlane(axis, this.clippingPlanes[1])
            break;
          }
          case 'Z': {
            this.clippingPlanes[2].enabled = enabled
            this.clippingPlanes[2].flipped = flipped
            this.clippingPlanes[2].value = value;
            changeClippingPlane(axis, this.clippingPlanes[2])
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
    height: 20px;
    width: 45px;
    border: 1px solid lightgrey;
    border-radius: 2px;
    margin: auto 4px;
    padding: 0 3px;
    font-size: 12px;
    color: black;
  }

  .flex-row {
    display: flex;
    justify-content: space-between;
    margin: 0;
    padding: 0;
  }
  .start {
      justify-content: start;
  }
}


</style>