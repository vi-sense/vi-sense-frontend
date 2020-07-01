<template>
    <div>
        <v-expansion-panels focusable accordion>
            <v-expansion-panel :key="sensor.id" :style="`border-left: 5px solid ${sensorColors.get(sensor.id)}!important`"
                               v-for="sensor in modelData.sensors">
                <v-expansion-panel-header disable-icon-rotate>
                    <v-checkbox class="pr-1 mt-0" hide-details :disabled="sensor.mesh_id == null" dense :id="'sensorcheckbox' + sensor.id" :value="sensor.id" color="rgba(82, 186, 162, 1)"
                                multiple v-model="selectedSensors" @change="updateSensorSelection(sensor.id)"
                    >
                    </v-checkbox>
                    <span>{{sensor.name}}</span>
                    <template #actions>
                    <v-tooltip bottom max-width="20rem">
                        <template #activator="{ on, attrs }">
                            <v-icon class="px-1"
                                    v-bind="attrs"
                                    v-on="on"
                            >mdi-help-circle-outline</v-icon>
                        </template>
                        <span>{{sensor.description}}</span>
                    </v-tooltip>
                    <v-tooltip v-if="sensor.mesh_id" bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon @click.prevent="startCameraMove(sensor.id)"
                                    v-bind="attrs"
                                    v-on="on"
                            >mdi-arrow-right-circle-outline</v-icon>
                        </template>
<!--                                    color="rgba(82, 186, 162, 1)"-->
                        <span>Go To Sensor</span>
                    </v-tooltip>
                        <v-tooltip v-else bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon @click.prevent="initSensor(sensor.id)"
                                    color="amber accent-4"
                                    v-bind="attrs"
                                    v-on="on"
                            >mdi-alert-circle-outline</v-icon>
                        </template>
                        <span>Please set sensor position</span>
                    </v-tooltip>
                    </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                            <v-btn @click.prevent="initSensor(sensor.id)" alt="Select sensor position" class="button"
                                   color="rgba(82, 186, 162, 1)" dark elevation="2" block
                                   >
                                <span v-if="sensor.mesh_id">Reposition Sensor</span>
                                <span v-else>Position Sensor</span>
                            </v-btn>
                <sensor-limits :sensor="sensor" v-on:sensor-limits-changed="$emit('sensor-limits-changed')"></sensor-limits>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>


<script>
    import axios from "axios";
    import SKEYS from "../storage/StorageKeys";
    import SensorLimits from "./SensorLimits";
    import PopUp from "./PopUp";
    import Vue from 'vue'
    export default {
        components: {SensorLimits, PopUp},
        props: ["model", "STORE", "popUp", "sensorColors"],
        data() {
            return {
                selectedSensors: [],
                modelData: Vue.util.extend({}, this.model),
            };
        },
        watch:{
          selectedSensors: function (newSelectedSensors, oldSelectedSensors) {
                this.$emit("sensor-selection-changed", newSelectedSensors)
          }
        },
        created() {
            this.STORE.onInitStateChanged( async (id, state) => {
                    if(state === "updated") {
                        this.loadSensorData(this.modelData.id);
                    }
                })

            this.STORE.onSensorSelectionChanged((sensorId, action) => {
                if (action === "new" && !this.selectedSensors.includes(sensorId)) {
                    this.selectedSensors.push(sensorId)
                } else if(action === "removed") {
                    this.selectedSensors = this.selectedSensors.filter(id => id !== sensorId)
                }
            });
        },
        methods: {
            updateSensorSelection(sensorID) {
                event.stopPropagation()
                if (this.selectedSensors.includes(sensorID)) {
                    this.STORE.selectSensor(sensorID);
                } else {
                    this.STORE.unselectSensor(sensorID);
                }
            },
            startCameraMove(id) {
                event.stopPropagation()
                this.STORE.set(SKEYS.CAMERA_DRIVE_SENSOR, id);
            },
            initSensor(id) {
                this.STORE.set(SKEYS.INIT_SENSOR, id);
                this.STORE.onInitStateChanged(async (id, state) => {
                    if(state === "updated") {
                        const newSensorRes = await fetch(this.endpoint + "sensors/" + id)
                        const newSensorData = await newSensorRes.json()
                        this.modelData.sensors.find((sensor) => sensor.id === id).mesh_id = newSensorData.mesh_id
                    }
                })
            },
            loadSensorData(id) {
                axios(process.env.API_URL + "/models/" + id)
                    .then(response => {
                        this.modelData = response.data;
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        }
    };
</script>


<style scoped lang="scss">
    // do we really need the scoped attribute? overriding vuetify styles doesnt work with that
    // yes we do need it because its very confusing if every component sets globas css attributes. you can change vuetify styles with the >>> operator

    .v-expansion-panel-header {
        padding: 0 10px 0 10px;
    }

    .v-expansion-panel-header >>> :not(.v-expansion-panel-header__icon) {
        flex: unset;
    }

    .v-expansion-panel-content >>> .v-expansion-panel-content__wrap {
        padding: 10px !important;
    }




</style>
