<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">Set Sensor Position</v-card-title>

        <v-card-text>Are you sure you want to position the sensor {{ sensor_name }} on the selected mesh?</v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="rgba(82, 186, 162, 1)" 
            text
            @click="cancel()"
          >
            Cancel
          </v-btn>

          <v-btn
            color="rgba(82, 186, 162, 1)" 
            dark
            @click="confirmInit()"
          >
            Confirm
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>


<script>
    import SKEYS from "../storage/StorageKeys";

    export default {
        props: ["popUp", "STORE"],
        data () {
        return {
            endpoint: process.env.API_URL + "/",
            dialog: false,
            sensor_id: null,
            sensor_name: "",
        }
        },
        mounted() {
            this.STORE.onInitStateChanged(async (id, state) => {
                if(this.sensor_id != id) {
                  this.sensor_id = id
                  const sensor = await fetch(this.endpoint + "sensors/" + id)
                  const sensorData = await sensor.json()
                  this.sensor_name = sensorData.name;
                }
                if(state === "mesh_picked") {
                    this.dialog = true
                }
            })

        },
        methods: {
            confirmInit() {
                this.dialog = false;
                this.STORE.updateInitState(this.STORE.get(SKEYS.INIT_SENSOR), "confirmed")
            },
            cancel() {
                this.dialog = false;
                this.STORE.removeCallbacks()
            }
        }
    }
</script>