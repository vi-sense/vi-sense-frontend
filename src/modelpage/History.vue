<template lang="html">
    <div class="history" v-if="anomaliesLoaded">
        <v-card v-for="anomaly in anomalies">
            <v-container class="pa-0">
                <v-row align="center" justify="start" :no-gutters="true">
                    <v-col cols="1">
                        <span :style="`font-size:2rem; color:${sensor_colors[anomaly.start_data.sensor_id]}`"  class="mdi mdi-alert-circle"></span>
                    </v-col>
                    <v-col cols="11">
                        <v-card-title>
                            {{`${sensorsById.get(anomaly.start_data.sensor_id).name}: ${anomaly.type}`}}
                        </v-card-title>
                        <v-card-subtitle v-if="anomaly.end_data">{{`${anomaly.start_data.date} -
                            ${anomaly.end_data.date}`}}
                        </v-card-subtitle>
                        <v-card-subtitle v-else>{{`${anomaly.start_data.date}`}}</v-card-subtitle>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </div>
</template>

<script>
    import {SENSOR_COLORS} from '../storage/Settings';

    export default {
        props: ["modelId"],
        data() {
            return {
                model: null,
                sensorsById: Map,
                anomalies: [],
                anomaliesLoaded: false,
                endpoint: process.env.API_URL,
                sensor_colors: SENSOR_COLORS
            };
        },
        methods: {
            async getModel(id) {
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
            this.getModel(this.modelId);
        },
        watch: {
            $route() {
                this.getModel(this.modelId);
            }
        }
    };
</script>

<style scoped lang="scss">
    .v-card {
        margin: 5px
    }

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