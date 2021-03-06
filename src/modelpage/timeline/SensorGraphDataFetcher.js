/**
 * @author Tom Wendland
 * @description 
 * this class handles fetching and storing of sensor data
 * the main function is DataFetcher.get(), returning the data to the given time range with a offset in both directions
 * if the requestet data is not fetched yet, it will be fetched and saved locally 
 * if the requested data is already fetched, it will return the lolca data
 * by that, d3 is never showing the whole data but only a excerpt. this increases the performance a lot 
 */

import moment from 'moment';
const API_URL = process.env.API_URL  

const CHUCK_SIZE = 7*24*60*60*1000 // 1 week
const RT_PAUSE = 2*60*1000 // 2 min pause between realtime api fetch


export default class SensorGraphDataFetcher{

    constructor(sensorId){
        this.sensorId = sensorId
        this.map = new Map()
        this._lastMinHash
        this._lastMaxHash
        this._lastRtFetch = new Date()
        this._rtUpdateAvailable = false
    }

    /**
     * @param {Number} dateTime Date.getTime() value
     * @returns {Number} a integer hash representing a time range based on the chunksize
     */
    _hash(dateTime){
        let hash = Math.floor(dateTime/CHUCK_SIZE)
        return hash 
    }

    /**
     * @param {Number} hash 
     * @returns {Number} a dateTime which can be transformed to a date with new Date(dateTime). The resulting date is the first date/time of the representing hash
     */
    _unhash(hash){
        return hash*CHUCK_SIZE
    }

    /**
     * our backend requires utc time for a request so if I want the data for 12:00 local time, i have to request for 10:00 because german time is utc+02
     * @param {Date} date 
     */
    _dateFormat(date){
        return moment.utc(date).format("YYYY-MM-DD HH:mm:ss");
    }

    /**
     * 
     * @param {Date} start 
     * @param {Date} end 
     */
    _toStartEndApiURL(start, end){        
        let s = API_URL + `/sensors/${this.sensorId}/data?density=${1}&start_date=${this._dateFormat(start)}&end_date=${this._dateFormat(end)}`        
        return s
    }

    /**
     * 
     * @param {Number} hash 
     * @returns a promise if data chunk is not already fetched
     */
    async _fetchHashChunk(hash) {
        if(this.map.has(hash)) return

        let start = new Date(this._unhash(hash))
        let end = new Date(this._unhash(hash)+CHUCK_SIZE)  

        if(end > Date.now()) end = new Date() // because our data is fake and already exists for time that did not passed yet we have to limit the fetching by Date.now()    
        if(start > end) return
        
        let promise = this._apiCall(this._toStartEndApiURL(start, end)).then(data => {   
            this.map.set(hash, data)
        })
        this.map.set(hash, promise) 
        return promise
    }

    /**
     * checking for latest data
     * @param {Number} hash 
     */
    async _fetchRealtime(hash) {
        let now = new Date()        

        let dataChunk = this.map.get(hash)
        let latest = dataChunk[dataChunk.length-1].date
        let start = new Date()
        start.setTime(latest.getTime()+1000) // +1 second bc otherwise it would fetch the latest date aswell
        
        return this._apiCall(this._toStartEndApiURL(start, now)).then(data => {                 
            if(data.length != 0){
                let updated = [...dataChunk, ...data]
                this.map.set(hash, updated)
                this._rtUpdateAvailable = true
            }
        })
    }

    async _apiCall(requestURL){
        return fetch(requestURL)
        .then(res => { return res.json() })
        .then(json => { return json.map(d => { return {date: new Date(d.date), value: d.value}}) }) 
        //.catch(error => { console.log(error) })
    }

    /**
     * checking if new realtime data is available and if yes fetching it
     * @param {*} callback only called when new realtime data was fetched
     */
    checkAndUpdateRealtimeData(callback){
        let now = new Date()
        let nowTime = now.getTime()
        let nowHash = this._hash(nowTime)

        if(this._lastMaxHash >= nowHash && this.map.has(nowHash)){
            if(this._lastRtFetch.getTime()+RT_PAUSE < nowTime){
                this._lastRtFetch = now
                this._fetchRealtime(nowHash).then(() => { if(this._rtUpdateAvailable) callback() })
            }
        }
    }

    /**
     * @param {Array} domain D3 xScale.domain()
     * @returns Promise with data array (if new area was loaded) or null (if data didnt change from last call) 
     */
    async get(domain){
        let minHash = this._hash(domain[0].getTime())
        let maxHash = this._hash(domain[1].getTime())

        // Return option 1: return empty promise if domain did not change and realtime update not available
        if(!this._rtUpdateAvailable && this._lastMinHash <= minHash && this._lastMaxHash >= maxHash){
            return new Promise(resolve => {
                resolve(null)
            })
        }
        this._lastMinHash = minHash
        this._lastMaxHash = maxHash
        this._rtUpdateAvailable = false

        // Return option 2: return the data chunks based on the domain
        // load a data chunk from storage variable or fetch it from server 
        let promises = []        
        for(let hash=minHash-2; hash<maxHash+2; hash++){
            let p = this._fetchHashChunk(hash)
            if(p) promises.push(p)                
        }
        
        // fixed https://github.com/vi-sense/vi-sense/issues/114
        // TODO still too much get`s in the beginning
        let thisGet = Date.now()
        this._lastGet = thisGet
                
        return Promise.all(promises).then(()=>{
            if(this._lastGet != thisGet) return
            
            let result = []
            for(let hash=minHash-1; hash<maxHash+1; hash++){                
                let d = this.map.get(hash)                
                if(d) result.push(...d) // d is undefined for data chunks > Date.now()
            }  
            return result
        })
    }
}

