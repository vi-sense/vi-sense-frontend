<template>
    <div>
        <h4 class="pt-2">Sensor Limits</h4>
        <v-container pa-0>
            <v-row dense>
                <v-col cols="6">
                    <v-text-field dense
                                  label="Lower Bound"
                                  v-model="lower_bound"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field dense
                                  label="Upper Bound"
                                  v-model="upper_bound"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row dense>
                <v-col cols="6">
                    <v-text-field dense
                                  label="Gradient Bound"
                                  v-model="gradient_bound"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-btn class="ma-0" text color="rgba(82, 186, 162, 1)" v-on:click="saveLimits"><strong>Save Limits</strong></v-btn>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
    export default {
        name: "SensorLimits",
        props: ["sensor"],
        data() {
            return {
                upper_bound: this.sensor.upper_bound,
                lower_bound: this.sensor.lower_bound,
                gradient_bound: this.sensor.gradient_bound
            }
        },
        methods:{
            saveLimits(){

            }
        }
    }
</script>

<style scoped lang="scss">
    .v-text-field > > > label, .v-text-field > > > input {
        font-size: 1rem !important;
    }
</style>