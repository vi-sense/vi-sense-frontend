/**
 * @author Tom Wendland
 * @description smart data deliverer which is loading and caching the sensor data 
 */

import moment from 'moment';
const API_URL = process.env.API_URL  
//const API_URL = "https://visense.f4.htw-berlin.de:44344"

export default class DataFetcher{

    constructor(sensorId){
        this.sensorId = sensorId
        this.map = new Map()
        this._lastMinHash
        this._lastMaxHash
        this._chuckSize = 3*24*60*60*1000
    }
    
    /**
     * fetchs the data to a corresponding hash number
     */
    async _fetchHashData(hash) {
        let start = new Date(this._unhash(hash))
        let end = new Date(this._unhash(hash)+this._chuckSize)  
        if(end > Date.now()) end = new Date() // dont load data that didnt happen yet      

        // our backend requires utc time for a request so if I want the data for 12:00 local time, i have to request for 10:00 because german time is utc+02
        let utcstart = moment.utc(start).format("YYYY-MM-DD HH:mm:ss");
        let utcend = moment.utc(end).format("YYYY-MM-DD HH:mm:ss");

        return this._apiCall(API_URL + `/sensors/${this.sensorId}/data?limit=${200}&start_date=${utcstart}&end_date=${utcend}`).then(data => {            
            this.map.set(hash, data)
        })
    }

    async _apiCall(requestURL){
        return fetch(requestURL)
        .catch(error => { console.log(error) })
        .then(res => { return res.json() })
        .then(json => { return json.map(d => { return {date: new Date(d.date), value: d.value}}) }) 
    }

    /**
     * maps the given dateTime on a hash integer based on the chunksize
     */
    _hash(dateTime){
        let hash = Math.floor(dateTime/this._chuckSize)
        return hash 
    }
    _unhash(hash){
        return hash*this._chuckSize
    }

    /**
     * @param {Array} domain
     * @returns Promise with new data array (if new area was loaded) or null (if data didnt change from last call) 
     */
    async get(domain){
        let minHash = this._hash(domain[0].getTime())
        let maxHash = this._hash(domain[1].getTime())

        if(this._lastMinHash && this._lastMinHash <= minHash && this._lastMaxHash >= maxHash){
            return new Promise((resolve, reject) => {
                resolve(null)
            })
        }
        
        this._lastMinHash = minHash
        this._lastMaxHash = maxHash

        let promises = []
        for(let hash=minHash-2; hash<maxHash+2; hash++){
            if(!this.map.has(hash)){
                let p = this._fetchHashData(hash)
                promises.push(p)                
            }
        }
        
        return Promise.all(promises).then(()=>{
            let result = []

            for(let hash=minHash-2; hash<maxHash+2; hash++){                
                let d = this.map.get(hash)
                result.push(...d)
            }    
            return result
        })
    }
}

