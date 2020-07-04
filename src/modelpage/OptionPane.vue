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
        <v-subheader>Camera Clipping<v-spacer/>
        <input v-model="cameraClipping" type="number" min=10 max=1000 v-on:input="onSliderChanged('clipping', cameraClipping)"></v-subheader>

        <input class="slider" v-model="cameraClipping" type="range" min=10 max=1000 v-on:input="onSliderChanged('clipping', cameraClipping)" />
      </div>

      <div>
        <v-btn color="rgba(82, 186, 162, 1)" dark block raised @click="onCameraSwitch()">Switch Camera</v-btn>
      </div>
    </div>

    <hr>

    <div>
      <p>Timeline Options</p>

      <div>
        <v-subheader>Speed<v-spacer/>
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
        ydomain: []
      }
    },
    mounted(){
      this.ydomain = this.STORE._timelineInstance.getDomainY()

      let speed = document.querySelector("#speed")
      speed.value = this.STORE._timelineInstance.getSpeed()
      speed.oninput = e => { this.STORE._timelineInstance.setSpeed(e.target.value) }
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
      onCameraSwitch() {
        switchCamera()
      }
    }
}
</script>

<style scoped lang="scss">
#optionpane{
  padding: 10px;

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
    border: 0px solid #000000;
  }
  input[type=range]::-webkit-slider-thumb {
    border: 1px solid #52BAA2;
    height: 10px;
    width: 10px;
    border-radius: 15px;
    background: #52BAA2;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -6.5px;
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
    border: 0px solid #000000;
  }
  input[type=range]::-moz-range-thumb {
    border: 1px solid #52BAA2;
    height: 10px;
    width: 10px;
    border-radius: 15px;
    background: #52BAA2;
    cursor: pointer;
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
    border: 0px solid #000000;
    border-radius: 20px;
  }
  input[type=range]::-ms-fill-upper {
    background: #52BAA2;
    border: 0px solid #000000;
    border-radius: 20px;
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
  input[type=range]:focus::-ms-fill-lower {
    background: #52BAA2;
  }
  input[type=range]:focus::-ms-fill-upper {
    background: #52BAA2;
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
    label {
      font-size: small;
    }
  }
}


</style>