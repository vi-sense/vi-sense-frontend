/**
 * @author Tom Wendland
 * simple state machine to handle bidirectional communication. 
 * for now its only suitable to store primitve data 
 * 
 * Storage Improvements:
 * - read only properties
 * - types
 * - how to handle arrays?
 * 
 * Next step: custom event classes implementing a interface? like i did in fpa
 * da kann das rückgabe objekt dann individuell gestaltet werden
 **/
import SKEYS from './StorageKeys'

export default class Storage{

    #values: Array<any>
    #callbacks: Array<Array<Function>>

    constructor(){        
        let enumCount = SKEYS.__LENGTH        
        this.#values = new Array(enumCount)
        this.#callbacks = [...Array(enumCount)].map(e => Array());
    }

    set(key: number, value: any){
        if(key == SKEYS.SELECTED_SENSOR) throw new Error("Please dont use the SELECTED_SENSOR key anymore, use the build in sensor selection functions of the store instead")
        this.#values[key] = value
        let callbackList = this.#callbacks[key]
        for(let c of callbackList){
            c(value)
        }
    }

    get(key: number): any{
        if(key == SKEYS.SELECTED_SENSOR) throw new Error("Please dont use the SELECTED_SENSOR key anymore, use the build in sensor selection functions of the store instead")
        let value = this.#values[key]
        return value
    }

    /**
     * Register a action that should be executed when a value has changes
     * @param key 
     * @param callback 
     */
    registerOnUpdateCallback(key: number, callback: (data: any) => void){
        if(key == SKEYS.SELECTED_SENSOR) throw new Error("Please dont use the SELECTED_SENSOR key anymore, use the build in sensor selection functions of the store instead")
        if(callback instanceof Function)
            this.#callbacks[key].push(callback)
        else 
            throw new Error("Thats not a callback function")
    }






    #selectedSensors = []
    #sensorSelectionCallbacks = []

    selectSensor(id){
        let index = this.#selectedSensors.indexOf(id);
        if(index == -1){
            this.#selectedSensors.push(id)
            for(let c of this.#sensorSelectionCallbacks){
                c(id, "new")
            }
            return true
        }
        else { return false }
    }
    unselectSensor(id){
        let index = this.#selectedSensors.indexOf(id);
        if(index != -1){
            this.#selectedSensors.splice(index, 1);
            for(let c of this.#sensorSelectionCallbacks){
                c(id, "removed")
            }
            return true
        }
        else { return false }
    }

    getSelectedSensors(){
        return this.#selectedSensors.slice() // return only a copy to prevent the client having the internal array reference
    }

    onSensorSelectionChanged(callback: (sensorId: number, action: String) => void){
        if(callback instanceof Function)
            this.#sensorSelectionCallbacks.push(callback)
        else throw new Error("Thats not a callback function")
    }
}


