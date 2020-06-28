import {scaleOrdinal, schemeTableau10} from 'd3'

export default function getSensorColors(sensorIDs: []){
    const sortedSensorIDs = sensorIDs.sort()
    const ordinalScale = scaleOrdinal(schemeTableau10)
    ordinalScale.domain(sortedSensorIDs)
    return ordinalScale
}