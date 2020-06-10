<template>
  <div>
    <p>Options</p>
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
</style>