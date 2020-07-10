<template lang="html">
    <div class="history" v-if="anomaliesLoaded">
        <v-lazy min-height="80" v-for="(anomaly, index) in filteredAnomalies" :key="index">
        <v-hover v-slot:default="{ hover }">
            <v-card v-ripple :color="hover? 'grey lighten-4':'white'" class="my-1"
                    :style="`border-radius: 0; border-left: 5px solid ${sensorColors.get(anomaly.start_data.sensor_id)}!important; opacity:${anomaly.selected?'1.0':'0.5'}`" v-on:click="selectAnomaly(anomaly)">
                <v-container class="pa-0">
                    <v-row align="center" justify="start" :no-gutters="true" >
                        <v-card-title class="pr-1">
                            <!--span>{{sensorsById.get(anomaly.start_data.sensor_id).name}}:</span><br--> 
                            <span>{{anomaly.type}}</span>
                        </v-card-title>
                        <v-card-subtitle class="pr-1">
                            <span class="date_span">{{ reformatDate(anomaly.start_data.date)}}{{anomaly.end_data? " - ": ""}}</span> 
                            <br v-if="anomaly.end_data" >
                            <span v-if="anomaly.end_data" class="date_span"> {{reformatDate(anomaly.end_data.date)}} </span>
                            <br>
                            <br>
                            <span style="font-weight: bold">Peak: </span>
                            <span>{{parseFloat(anomaly.peak_data.value).toFixed(2)}}</span>
                            <span>{{modelData.sensors[anomaly.start_data.sensor_id].measurement_unit}}</span>
                            <span v-if="anomaly.end_data">at {{reformatDate(anomaly.peak_data.date)}}</span>

                        </v-card-subtitle>
                    </v-row>
                </v-container>
            </v-card>
        </v-hover>
        </v-lazy>
    </div>
</template>

<script>
    import Vue from "vue";
    import moment from 'moment'
    import {eventBus} from "../main";

    export default {
        props: ["model", "sensorColors", "selectedSensors", "STORE"],
        data() {
            return {
                modelData: Vue.util.extend({}, this.model),
                sensorsById: Map,
                anomalies: [],
                anomaliesLoaded: false,
                endpoint: process.env.API_URL,
            };
        },
        computed:{
            filteredAnomalies: function () {
                this.anomalies.forEach(anomaly => anomaly.selected = this.selectedSensors.length === 0  || this.selectedSensors.includes(anomaly.start_data.sensor_id))
                return this.anomalies.sort((a, b) => (a.selected === b.selected ? 0: a.selected ? -1: 1) || (b.start_data.date.localeCompare(a.start_data.date)));
            }
        },
        methods: {
            async getAnomalies() {
                this.sensorsById = new Map()
                this.anomalies = []
                await Promise.all(this.modelData.sensors.map(async (sensor) => {
                    this.sensorsById.set(sensor.id, sensor)
                    const current_date = moment().format("YYYY-MM-DD HH:mm:ss")
                    try {
                        const sensorAnomalies = await fetch(`${this.endpoint}/sensors/${sensor.id}/anomalies?end_date=${current_date}`)
                        this.anomalies.push(...await sensorAnomalies.json())
                    } catch (error) {
                        console.log(error)
                    }
                }))
                this.anomaliesLoaded = true
            },
            selectAnomaly(anomaly){
                eventBus.$emit("sensor-selected", anomaly.start_data.sensor_id)
                const startDate = new Date(anomaly.start_data.date)
                //if there are two dates, center in between those. if there is only one, center on that, achived by setting endDate equal to startDate
                const endDate = anomaly.end_data ? new Date(anomaly.end_data.date) : startDate
                this.STORE._timelineInstance.centerToDate(new Date((startDate.getTime() +endDate.getTime())/2 ))
            },
            reformatDate(dateString){
                const date = moment(dateString)
                return date.format("DD.MM.YY HH:mm")
            }
        },
        created() {
            eventBus.$on('sensor-limits-changed', this.getAnomalies)
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
</style>