<template>
    <div>
        <p>Sensors</p>
        <v-expansion-panels focusable accordion>
            <v-expansion-panel :key="sensor.id" :style="`border-left: 5px solid ${sensor_colors[sensor.id]}!important`"
                               v-for="(sensor, index) in sensorData">
                <v-expansion-panel-header disable-icon-rotate>
                    <v-simple-checkbox class="pr-1" dense :key="sensor.id" v-on:input="onItemChecked(sensor.id, index)" color="rgba(82, 186, 162, 1)"
                                v-model="checkboxes[index].checked"
                    ></v-simple-checkbox>
                    <span>{{sensor.name}}</span>
                    <template #actions>
                    <v-tooltip bottom max-width="20rem">
                        <template #activator="{ on, attrs }">
                            <v-icon class="px-1"
                                    small
                                    v-bind="attrs"
                                    v-on="on"
                            >mdi-help-circle</v-icon>
                        </template>
                        <span>{{sensor.description}}</span>
                    </v-tooltip>
                    <v-tooltip v-if="sensor.mesh_id" bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon @click.prevent="startCameraMove(sensor.id)"
                                    color="rgba(82, 186, 162, 1)"
                                    v-bind="attrs"
                                    v-on="on"
                            >mdi-arrow-right-circle</v-icon>
                        </template>
                        <span>Go To Sensor</span>
                    </v-tooltip>
                        <v-tooltip v-else bottom>
                        <template #activator="{ on, attrs }">
                            <v-icon @click.prevent="initSensor(sensor.id)"
                                    color="yellow accent-4"
                                    v-bind="attrs"
                                    v-on="on"
                            >mdi-alert-circle</v-icon>
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
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-expansion-panels>
    </div>
</template>


<script>
    import axios from "axios";
    import SKEYS from "../storage/StorageKeys";
    import {SENSOR_COLORS} from "../storage/Settings";

    export default {
        props: ["modeID", "STORE"],
        data() {
            return {
                model: [],
                checkboxes: [],
                sensorData: [],
                sensor_colors: SENSOR_COLORS,
                endpoint: process.env.API_URL + "/",
                temp_min: 10,
                temp_max: 80,
                temp: 50
            };
        },
        created() {
            this.loadSensorData(this.modeID);

            this.STORE.getSelectedSensors(sensorIds => {
                for (let id of sensorIds) {
                    const i = this.indexWhere(this.checkboxes, item => item.id === id);
                    this.checkboxes[i].checked; // TODO check sensor checkbox passiert im normalfall nicht aber der vollständigkeit halber
                }
            });

            this.STORE.onSensorSelectionChanged((sensorId, action) => {
                const i = this.indexWhere(this.checkboxes, item => item.id === sensorId);
                if (action == "new") {
                    this.checkboxes[i].checked = true;
                } else if (action == "removed") {
                    this.checkboxes[i].checked = false;
                }
            });
        },
        methods: {
            onSliderChanged(key, value, id) {
                //console.log(key, value);
                switch (key) {
                    case "temp":
                        //console.log(this.sensorData[id].latest_data.value);
                        this.sensorData[id].latest_data.value = value;
                        break;
                    default:
                        break;
                }
            },
            onItemChecked(id, index) {
                event.stopPropagation();
                if (this.checkboxes[index].checked == true) {
                    this.STORE.selectSensor(id);
                } else if (this.checkboxes[index].checked == false) {
                    this.STORE.unselectSensor(id);
                }
            },
            indexWhere(array, conditionFn) {
                const item = array.find(conditionFn);
                return array.indexOf(item);
            },
            startCameraMove(id) {
                this.STORE.set(SKEYS.CAMERA_DRIVE_SENSOR, id);
            },
            initSensor(id) {
                this.STORE.set(SKEYS.INIT_SENSOR, id);
            },
            loadSensorData(id) {
                axios(this.endpoint + "models/" + id)
                    .then(response => {
                        this.model = response.data;
                        this.sensorData = this.model.sensors;
                        this.checkboxes = this.sensorData.map(sensor => {
                            return {
                                checked: false,
                                id: sensor.id
                            };
                        });
                        this.$route.meta.title = this.model.name;
                        // add a temporary variable
                        this.$router.replace({query: {temp: Date.now()}});
                        // remove the temporary variable query
                        this.$router.replace({query: {temp: undefined}});
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        }
    };
</script>


<style lang="scss">
    // do we really need the scoped attribute? overriding vuetify styles doesnt work with that

    /* information pane id is set from outsite */
    #informationpane {
        overflow-y: scroll;
        margin-left: 5px;
        margin-right: 5px;

        p {
            display: block;
            color: black;
            padding: 16px;
            margin: 0;
            text-decoration: none;
        }
    }

    .condensed {
        max-height: 15%;
    }

    .v-expansion-panels {

    }

    .v-expansion-panel-header {
        padding: 0 10px 0 10px;
    }

    .v-expansion-panel-content > div {
        padding: 10px 10px !important;
    }

    .v-expansion-panel-content button {
        margin: 10px 0;
    }

    .v-expansion-panel-header > :not(.v-expansion-panel-header__icon) {
        flex: unset;
    }
</style>
