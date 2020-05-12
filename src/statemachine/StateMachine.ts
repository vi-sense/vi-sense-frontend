/**
 * @author Tom Wendland
 * simple state machine 
 */
import STATES from './States'

export default class StateMachine{

    #values: Array<any>
    #callbacks: Array<Array<Function>>

    constructor(){        
        let enumCount = STATES.__LENGTH        
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

    registerOnUpdateCallback(key: number, callback: (data: any) => void){
        if(callback instanceof Function)
            this.#callbacks[key].push(callback)
        else 
            throw new Error("Thats not a callback function")
    }
}


