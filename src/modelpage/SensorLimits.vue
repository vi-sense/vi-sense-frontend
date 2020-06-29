<template>
    <div>
        <h4 class="pt-2">Sensor Limits</h4>
        <v-container pa-0>
            <v-row dense>
                <v-col cols="6">
                    <v-text-field dense type="number"
                                  label="Lower Bound"
                                  v-model="lowerBound"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field dense type="number"
                                  label="Upper Bound"
                                  v-model="upperBound"

                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row dense>
                <v-col cols="6">
                    <v-text-field dense type="number"
                                  label="Gradient Bound"
                                  v-model="gradientBound"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-btn block class="ma-0" text color="rgba(82, 186, 162, 1)" v-on:click="saveLimits"><strong>Save</strong></v-btn>
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
                upperBound: this.sensor.upper_bound,
                lowerBound: this.sensor.lower_bound,
                gradientBound: this.sensor.gradient_bound
            }
        },
        methods:{
            async saveLimits(){
                    let update = {
                        upper_bound: parseFloat(this.upperBound),
                        lower_bound: parseFloat(this.lowerBound),
                        gradient_bound: parseFloat(this.gradientBound)
                    }
                try {
                    let response = await fetch(process.env.API_URL + "/sensors/" + this.sensor.id, {
                        method: 'PATCH',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(update)})

                    console.log(JSON.stringify(update))

                    const newSensorData = await response.json()

                    this.upperBound = newSensorData.upper_bound
                    this.lowerBound = newSensorData.lower_bound
                    this.gradientBound = newSensorData.gradient_bound

                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .v-text-field > > > label, .v-text-field > > > input {
        font-size: 1rem !important;
    }
</style>