/**
 * @author Tom Wendland
 * simple state machine to handle bidirectional communication
 * 
 * Improvements:
 * - read only properties
 * - types
 * 
 * Are custom public functions better? e.g. getSelectedSensors()
 */
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
        this.#values[key] = value
        let callbackList = this.#callbacks[key]
        for(let c of callbackList){
            c(value)
        }
    }

    get(key: number): any{
        return this.#values[key]
    }

    /**
     * Register a action that should be executed when a value has changes
     * @param key 
     * @param callback 
     */
    registerOnUpdateCallback(key: number, callback: (data: any) => void){
        if(callback instanceof Function)
            this.#callbacks[key].push(callback)
        else 
            throw new Error("Thats not a callback function")
    }
}


