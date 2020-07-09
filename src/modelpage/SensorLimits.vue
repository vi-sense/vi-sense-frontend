<template>
    <div>
        <h4 class="pt-2">Sensor Limits</h4>
        <v-form ref="form" v-model="valid">
        <v-container pa-0>
            <v-row dense>
                <v-col cols="6">

                    <v-text-field dense type="number"
                                  label="Lower Bound"
                                  v-model="lowerBound"
                                  :rules="[value => !!!upperBound || !!!value || parseFloat(value) <= parseFloat(upperBound) || 'Higher than upper bound']"
                                  @input="revalidateForm"
                    ></v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-text-field dense type="number"
                                  label="Upper Bound"
                                  v-model="upperBound"
                                  :rules="[value => !!!lowerBound || !!!value || parseFloat(value) >= parseFloat(lowerBound) || 'Lower than lower bound']"
                                  @input="revalidateForm"
                    ></v-text-field>
                </v-col>
            </v-row>
            <v-row dense>
                <v-col cols="6">
                    <v-text-field dense type="number"
                                  label="Gradient Bound"
                                  v-model="gradientBound"
                                  :rules="[value => !!!value || parseFloat(value) >= 0 || 'Must be positive']"
                                  @input="revalidateForm"
                        >
                        <template #append>
                            <v-tooltip bottom max-width="20rem">
                                <template #activator="{ on, attrs }">
                                    <v-icon class="px-1"
                                            v-bind="attrs"
                                            v-on="on"
                                    >mdi-help-circle-outline</v-icon>
                                </template>
                                <span>If the sensor value changes more than this in an hour a data anomaly will be shown.</span>
                            </v-tooltip>
                        </template>
                    </v-text-field>
                </v-col>
                <v-col cols="6">
                    <v-btn :disabled="!valid" block class="ma-0" text color="rgba(82, 186, 162, 1)" v-on:click="saveLimits"><strong>Save</strong></v-btn>
                </v-col>
            </v-row>
        </v-container>
                    </v-form>
    </div>
</template>

<script>
    import {updateLocalSensors} from './babylon/sensorSelection';
    import {eventBus} from "../main";
    const GRADIENTBOUND_CONVERSION = 3600 //convert the gradient bound from second to hours for human readable format

    export default {
        name: "SensorLimits",
        props: ["sensor", "STORE"],
        data() {
            return {
                valid: true,
                upperBound: this.sensor.upper_bound ,
                lowerBound: this.sensor.lower_bound,
                gradientBound: this.gradientHumanReadable(this.sensor.gradient_bound)
            }
        },
        methods:{
            revalidateForm(){
              this.$refs.form.validate()
            },
            gradientHumanReadable(gradientBound){
                if(gradientBound != null){
                    return gradientBound * GRADIENTBOUND_CONVERSION
                }
                else return null
            },
            gradientBoundAPIScaled(gradientBoundHumanReadable){
                if(gradientBoundHumanReadable != null){
                    return gradientBoundHumanReadable / GRADIENTBOUND_CONVERSION
                }
                else return null
            },
            async saveLimits(){
                    let update = {
                        upper_bound: parseFloat(this.upperBound),
                        lower_bound: parseFloat(this.lowerBound),
                        gradient_bound: this.gradientBoundAPIScaled(parseFloat(this.gradientBound))
                    }
                try {
                    let response = await fetch(process.env.API_URL + "/sensors/" + this.sensor.id, {
                        method: 'PATCH',
                        mode: 'cors',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(update)
                    })
                    const newSensorData = await response.json()

                    this.upperBound = newSensorData.upper_bound
                    this.lowerBound = newSensorData.lower_bound
                    this.gradientBound = this.gradientHumanReadable(newSensorData.gradient_bound)
                    eventBus.$emit('sensor-limits-changed')

                    this.STORE._timelineInstance.refreshAnomalies()
                    
                    updateLocalSensors(this.sensor.id, newSensorData.upper_bound, newSensorData.lower_bound)
                } catch (error) {
                    console.log(error)
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .v-text-field >>> label, .v-text-field >>> input {
        font-size: 1rem !important;
    }
</style>