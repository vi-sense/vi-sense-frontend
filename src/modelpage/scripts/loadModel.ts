import * as BABYLON from 'babylonjs'
import { degToRad } from './utils';
var JSZip = require("jszip");


/**
 * @author Tom Wendland
 * This function handles the loading process of a model
 * Load a model by a id indicating a model on our server.
 * The model can also be loaded from the local filesystem by setting loadFromLocalFS=true. The hard coded id-model mapping correspond to the database
 */
export function loadModel(id: number, scene: BABYLON.Scene, callback: (meshes: BABYLON.AbstractMesh[]) => void, loadFromLocalFS: boolean = false) {
    
    if(loadFromLocalFS === false){
        let API_URL = process.env.API_URL
        fetch(API_URL + "/models/" + id).then(response => {
            response.json().then(bodyData => {
                var url = API_URL + '/' + bodyData.Url
                getFileFromServer(url, zipFile => {
                    loadAndResolveGltfFromZip(zipFile, glTFDataString => {
                        BABYLON.SceneLoader.ImportMesh('', '', `data:${glTFDataString}`, scene, (meshes, particleSystems, skeletons) => {
                            let buildingModel = <BABYLON.Mesh> meshes[0]
                            normalize(buildingModel)
                            callback(meshes)
                            document.getElementById("progressBar").innerHTML = "100%";
                            document.getElementById("progressBar").style.width = "100%";
                        }, (event) => updateProgress(event, "import"))
                    })
                })
            })
        })
    } else {
        id = parseInt(""+id) // vue probs is a string, typechecking not working here
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
        }, (event) => updateProgress(event, "import"))
    }
}



/**
 * @author Tom Wendland
 * Normalizes the position and rotation of the facility-mechanical-room
 * TODO generic normalization for all models via bounding boxes
 */
function normalize(rootMesh){
    rootMesh.rotationQuaternion = undefined // reset default rotation and use euler angles instead
    rootMesh.setPivotMatrix(BABYLON.Matrix.Translation(85, -179.5, -80), false); // dont do further transformations here
    rootMesh.rotate(BABYLON.Axis.Y, degToRad(-44), BABYLON.Space.LOCAL)
    rootMesh.bakeCurrentTransformIntoVertices();
    rootMesh.setPivotMatrix(BABYLON.Matrix.Identity()); // resets gizmos to origin
}


/**
 * @author Lennard Grimm
  * Calculates the progress of downloading and importing models and updates the progressBar
  * TODO: when importing with GLTFString the onprogress info is missing and no events are received
  * maybe consider a different way of importing models
  */
function updateProgress(event, state?: String) {
  var percentComplete;
  if (event.lengthComputable) {
    percentComplete = event.loaded / event.total * 100;
  } else {
    var dlCount = event.loaded / (1024 * 1024);
    percentComplete = Math.floor(dlCount * 100.0) / 100.0;
  }
  if(state == "download") document.getElementById("progressText").innerHTML = "Downloading Model"
  if(state == "import") document.getElementById("progressText").innerHTML = "Importing Model"
  document.getElementById("progressBar").innerHTML = percentComplete.toFixed(0) + "%";
  document.getElementById("progressBar").style.width = percentComplete + "%";
}


/**
 * @author Jannik Schmitz
 */
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

    xmlhttp.onprogress = (event) => updateProgress(event, "download");
    xmlhttp.send()
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            var file = xmlhttp.response || xmlhttp.responseText
            callback(file)
        }
    }
 }


 /**
  * @author Tom Wendland
  * Unpacks the zip
  * There should be a 'scene.gltf' in the zip
  * Referenced local files (textures, bin, ..) are resolved with a data url
  * from https://github.com/Stuk/jszip/issues/375
  */
 function loadAndResolveGltfFromZip(zipFile: String, callback: (glTF: String) => void){

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