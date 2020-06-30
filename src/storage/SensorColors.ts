import {scaleOrdinal, schemeTableau10} from 'd3'

let ordinalScale;

export function registerSensorColors(sensorIDs: []){
    const sortedSensorIDs = sensorIDs.sort()
    ordinalScale = scaleOrdinal(schemeTableau10)
    ordinalScale.domain(sortedSensorIDs)
    ordinalScale.unknown("")
}
export function getSensorColor(sensorID) {
    if(ordinalScale){
        return ordinalScale(sensorID)
    }
}