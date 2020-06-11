<template>
  <div>
    <p>Options</p>
    <div id="minimap-wrapper">
      <canvas id="minimap"></canvas>
    </div>
    <div>
        <input name="check1" type="checkbox">
        <label >checkbox1</label>
    </div>
      <div>
        <input name="check2" type="checkbox">
        <label >checkbox2</label>
    </div>
  </div>
</template>

<script>
export default {
    props: ["STORE"],
}
</script>

<style scoped lang="scss">
#optionpane{
    padding: 1%;
}

#minimap-wrapper{
  width: 100%;
  height: 100px;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>