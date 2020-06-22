<template lang="html">
    <div class="history" v-if="model">
        <h1 class="model__title">{{ model.name }}</h1>
        <v-card v-for="sensor in model.sensors">
            <v-card-title :style="`color: ${sensor_colors[sensor.id]}`">{{sensor.name}}</v-card-title>
        </v-card>
    </div>
</template>

<script>
    import axios from "axios";

    import { SENSOR_COLORS } from '../storage/Settings';

    export default {
        props: ["id"],
        data() {
            return {
                model: null,
                endpoint: process.env.API_URL+"/",
                sensor_colors: SENSOR_COLORS
            };
        },
        methods: {
            getModel(id) {
                axios(this.endpoint + "models/"+id)
                    .then(response => {
                        this.model = response.data;
                    })
                    .catch(error => {
                        console.log(error);
                    });
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
    .model {
        position: relative;
        max-width: 500px;
        margin: 0 auto;
        padding: 50px 20px 70px;
    }
</style>