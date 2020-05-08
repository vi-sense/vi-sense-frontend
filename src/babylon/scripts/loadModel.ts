import * as BABYLON from 'babylonjs'
import { degToRad } from './utils';
var JSZip = require("jszip");


export function loadModel(id: number, scene: BABYLON.Scene, callback: (meshes: BABYLON.AbstractMesh[]) => void, production: boolean) {
    if(production){
        fetch("http://visense.f4.htw-berlin.de:8080/models/"+ id).then(response => {
            response.json().then(bodyData => {
                var url = 'http://visense.f4.htw-berlin.de:8080/'+bodyData.Url                
                getFileFromServer(url, zipFile => {
                    loadZIP(zipFile, glTFDataString => {
                        BABYLON.SceneLoader.ImportMesh('', '', `data:${glTFDataString}`, scene, (meshes, particleSystems, skeletons)  => {
                            let buildingModel = <BABYLON.Mesh> meshes[0]
                            normalize(buildingModel)
                            callback(meshes)
                        })
                    })
                })
            })
        })
    } else {      
        id = parseInt(""+id) // vue probs is a string 
  
        var url: string
        switch(id){
            case 1: url = 'gltf/facility-mechanical-room/'; break
            case 2: url = 'gltf/mep-building-model/'; break
            case 3: url = 'gltf/overhead-mep-installation/'; break
            default: throw new Error("model id is not defined or not valid")
        }
        
        BABYLON.SceneLoader.ImportMesh("", url, "scene.gltf", scene, (meshes, particleSystems, skeletons) => {
            let buildingModel = <BABYLON.Mesh> meshes[0]
            normalize(buildingModel)
            callback(meshes)
        })
    }
}



/**
 * for facility-mechanical-room
 */
function normalize(rootMesh){
    rootMesh.rotationQuaternion = undefined // reset default rotation and use euler angles instead
    rootMesh.setPivotMatrix(BABYLON.Matrix.Translation(85, -179.5, -80), false); // dont do further transformations here
    rootMesh.rotate(BABYLON.Axis.Y, degToRad(-44), BABYLON.Space.LOCAL)
    rootMesh.bakeCurrentTransformIntoVertices();
    rootMesh.setPivotMatrix(BABYLON.Matrix.Identity()); // resets gizmos to origin  
}




function getFileFromServer (url: String, callback: (file: String) => void) {
    var xmlhttp = null
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new window.XMLHttpRequest()
    } else { // code for IE6, IE5
        xmlhttp = new window.ActiveXObject('Microsoft.XMLHTTP')
    }

    xmlhttp.open('GET', url, true)
    //xmlhttp.withCredentials = true // TO-DO: Should be working
    // recent browsers
    if ('responseType' in xmlhttp) {
        xmlhttp.responseType = 'arraybuffer'
    }
    // older browser
    if (xmlhttp.overrideMimeType) {
        xmlhttp.overrideMimeType('text/plain; charset=x-user-defined')
    }

    console.log("requesting model file from "+url);
    xmlhttp.send()
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var file = xmlhttp.response || xmlhttp.responseText
            callback(file)
        }
    }
 }

 // https://github.com/Stuk/jszip/issues/375
 function loadZIP(zipFile: String, callback: (glTF: String) => void){

    JSZip
    .loadAsync(zipFile)
    .then(function (zipContent) {
        
        // filter out directorys
        var files = <any> Object.values(zipContent.files)
        files = files.filter((file) => {
            return !file.dir
        })
        
        // create promises of blolbs and rebind them to its filename
        var listOfPromises = (files).map(function(entry) {
            return entry.async("blob").then(function(blob) {
                return [entry.name, blob];
            });
        });
           
        // wait until all promises are resolved
        Promise.all(listOfPromises).then(function(list) {
            // transform list of [name, data] into an object for easy access
            var result = list.reduce(function(accumulator, current) {
            var currentName = current[0]
            var currentValue = current[1]
            accumulator[currentName] = currentValue;
            return accumulator;
            }, {});
                    
            zipContent.file("scene.gltf") 
            .async("string")
            .then(function(glTFString){

                for (var fileName of Object.keys(result)) {
                    // replace relativ paths by dataURLs
                    let blolbDataURL = window.URL.createObjectURL(result[fileName]);
                    glTFString = glTFString.split(fileName).join(blolbDataURL)
                }    
                callback(glTFString)
            })
        });
    })
 }