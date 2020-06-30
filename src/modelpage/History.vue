<template lang="html">
    <div class="history" v-if="anomaliesLoaded">
        <v-hover
                v-slot:default="{ hover }"
                v-for="(anomaly, index) in anomalies" :key="index"
        >
            <v-card v-ripple :color="hover? 'grey lighten-4':'white'" :elevation="hover? 4: 2" class="my-1"
                    :style="`border-left: 5px solid ${sensorColors.get(anomaly.start_data.sensor_id)}!important`" v-on:click="centerTimeline(anomaly)">
                <v-container class="pa-0">
                    <v-row align="center" justify="start" :no-gutters="true" >
                        <v-col cols="9">
                            <v-card-title class="pr-1">
                                {{`${sensorsById.get(anomaly.start_data.sensor_id).name}: ${anomaly.type}`}}
                            </v-card-title>
                            <v-card-subtitle class="pr-1" ><span class="date_span">{{ reformatDate(anomaly.start_data.date)}} - </span> <span v-if="anomaly.end_data" class="date_span"> {{reformatDate(anomaly.end_data.date)}} </span>
                            </v-card-subtitle>
                        </v-col>
                        <v-col cols="3" style="text-align: center">
                            <v-icon  large color="amber accent-4">mdi-alert-circle</v-icon>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card>
        </v-hover>
    </div>
</template>

<script>
    import Vue from "vue";
    import moment from 'moment'

    export default {
        props: ["model", "sensorColors", "STORE"],
        data() {
            return {
                modelData: Vue.util.extend({}, this.model),
                sensorsById: Map,
                anomalies: [],
                anomaliesLoaded: false,
                endpoint: process.env.API_URL,
            };
        },
        methods: {
            async getAnomalies() {
                this.sensorsById = new Map()
                this.anomalies = []
                await Promise.all(this.modelData.sensors.map(async (sensor) => {
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
            },
            centerTimeline(anomaly){
                const startDate = new Date(anomaly.start_data.date)
                //if there are two dates, center in between those. if there is only one, center on that, achived by setting endDate equal to startDate
                const endDate = anomaly.end_data ? new Date(anomaly.end_data.date) : startDate
                this.STORE._timelineInstance.centerToDate(new Date((startDate.getTime() +endDate.getTime())/2 ))
            },
            reformatDate(dateString){
                const date = moment(dateString)
                return date.format("lll")
            }
        },
        created() {
            this.getAnomalies();
        },
    };
</script>

<style scoped lang="scss">
    .date_span{
        white-space: nowrap;
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