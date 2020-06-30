<template>
    <div>
        <div id="chartWrapper"></div>
        <div>
            <p id="testTimeOutput"></p>
            <input id="play" type="button" value="play">
            <input id="speed" type="number" value="1" min="1" max="50">
            <br>
            <input id="move" type="button" value="move">
            <input id="select" type="button" value="select">
        </div>
    </div>
</template>

<style>
#app{
    width: 100%;
    height: 50%;
}
#chartWrapper{
    width: 100%;
    height: 100%;
}
</style>


<script>
import Timeline from './Timeline.js'
import {registerSensorColors} from "../../storage/SensorColors";

export default {
    mounted(){
        registerSensorColors([1,2,3,4,5,6,7,8,9])

        const parent = document.querySelector("#chartWrapper")
        parent.innerHTML = ""

        const timeline = new Timeline(parent)

        document.querySelector("#play").onclick = e => { timeline.isPlaying() ? timeline.pause() : timeline.play() }
        document.querySelector("#speed").oninput = e => { timeline.setSpeed(e.target.value) }
        document.querySelector("#move").onclick = e => { timeline.setTool("pin") }
        document.querySelector("#select").onclick = e => { timeline.setTool("brush") }

        timeline.showGraph(1) 
        timeline.showGraph(2) 
        timeline.showGraph(3) 

        timeline.centerToDate(new Date(2020, 1, 2))
    }
}

</script>