<template lang="html">
    <div class="history" v-if="anomaliesLoaded">
        <v-hover
                v-slot:default="{ hover }"
                v-for="(anomaly, index) in anomalies" :key="index"
        >
            <v-card v-ripple :color="hover? 'grey lighten-4':'white'" :elevation="hover? 4: 2" class="my-1"
                    :style="`border-left: 5px solid ${getSensorColor(anomaly.start_data.sensor_id)}!important`">
                <v-container class="pa-0">
                    <v-row align="center" justify="start" :no-gutters="true">
                        <v-col cols="10">
                            <v-card-title>
                                {{`${sensorsById.get(anomaly.start_data.sensor_id).name}: ${anomaly.type}`}}
                            </v-card-title>
                            <v-card-subtitle v-if="anomaly.end_data">{{`${anomaly.start_data.date} -
                                ${anomaly.end_data.date}`}}
                            </v-card-subtitle>
                            <v-card-subtitle v-else>{{`${anomaly.start_data.date}`}}</v-card-subtitle>
                        </v-col>
                        <v-col cols="2">
                            <v-icon large color="amber accent-4">mdi-alert-circle</v-icon>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-hover>
    </div>
</template>

<script>
    import {getSensorColor} from "../storage/SensorColors";

    export default {
        props: ["modelID"],
        data() {
            return {
                model: null,
                sensorsById: Map,
                anomalies: [],
                anomaliesLoaded: false,
                endpoint: process.env.API_URL,
                getSensorColor: getSensorColor
            };
        },
        methods: {
            async getAnomalies(id) {
                try {
                    const response = await fetch(this.endpoint + "/models/" + id)
                    this.model = await response.json()
                } catch (error) {
                    console.log(error)
                }
                this.sensorsById = new Map()
                this.anomalies = []
                await Promise.all(this.model.sensors.map(async (sensor) => {
                    this.sensorsById.set(sensor.id, sensor)
                    try {
                        const sensorAnomalies = await fetch(`${this.endpoint}/sensors/${sensor.id}/anomalies`)
                        this.anomalies.push(...await sensorAnomalies.json())
                    } catch (error) {
                        console.log(error)
                    }
                }))
                this.anomalies.sort((b, a) => a.start_data.date.localeCompare(b.start_data.date))
                this.anomaliesLoaded = true
            }
        },
        created() {
            this.getAnomalies(this.modelID);
        },
        watch: {
            $route() {
                this.getAnomalies(this.modelID);
            }
        }
    };
</script>

<style scoped lang="scss">

    .v-card__title {
        font-size: 1rem;
        line-height: 1rem;
        word-break: normal;
        margin-bottom: 10px;
    }

    .v-card__subtitle {
        line-height: 1rem;
    }

    .history {
        overflow-y: scroll;
    }
</style>