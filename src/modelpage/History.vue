<template lang="html">
    <div class="history" v-if="anomaliesLoaded">
            <v-card v-for="anomaly in anomalies">
                <v-container class="pa-0">
                    <v-row align="center" justify="start" :no-gutters="true">
                        <v-col-1>
                            <svg height="50" width="50">
                                <circle cx="25" cy="25" r="20" stroke="black" stroke-width="3"
                                        :fill="sensor_colors[anomaly.start_data.sensor_id]"/>
                            </svg>
                        </v-col-1>
                        <v-col>
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
        props: ["id"],
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
                this.anomaliesLoaded = true
            }
        },
        created() {
            this.getModel(this.id);
        },
        watch: {
            $route() {
                this.getModel(this.id);
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