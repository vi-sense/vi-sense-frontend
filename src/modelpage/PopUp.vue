<template>
  <v-row justify="center">
    <v-btn
      color="primary"
      dark
      @click.stop="dialog = true"
    >
      Open Dialog
    </v-btn>

    <v-dialog
      v-model="dialog"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">Position sensor moin</v-card-title>

        <v-card-text>
          Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            color="green darken-1"
            text
            @click="cancel()"
          >
            Cancel
          </v-btn>

          <v-btn
            color="green darken-1"
            text
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
        props: ["popUp", "STORE", "sensor_id", "mesh_id", "state"],
        data () {
        return {
            dialog: false,
        }
        },
        mounted() {
            this.STORE.onInitStateChanged((id, state) => {
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
                this.STORE.updateInitState(this.STORE.get(SKEYS.INIT_SENSOR), null)
            }
        }
    }
</script>