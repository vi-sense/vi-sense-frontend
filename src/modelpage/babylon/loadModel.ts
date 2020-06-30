import * as BABYLON from 'babylonjs'
import { degToRad } from './utils';

/**
 * @author Tom Wendland
 * This function handles the loading process of a model
 * Load a model by a id indicating a model on our server.
 * The model can also be loaded from the local filesystem by setting loadFromLocalFS=true. The hard coded id-model mapping correspond to the database
 */
export function loadModel(id: number, scene: BABYLON.Scene, callback: (meshes: BABYLON.AbstractMesh[]) => void, loadFromLocalFS: boolean = false) {
    
    if(loadFromLocalFS === true){
        let API_URL = process.env.API_URL
        fetch(API_URL + "/models/" + id).then(response => {
            response.json().then(bodyData => {
                var url = API_URL + '/' + bodyData.url
                BABYLON.SceneLoader.ImportMesh('', '', url, scene, (meshes, particleSystems, skeletons) => {
                    let buildingModel = <BABYLON.Mesh> meshes[0]
                    //normalize(buildingModel)
                    callback(meshes)
                    document.getElementById("progressBar").innerHTML = "100%";
                    document.getElementById("progressBar").style.width = "100%";
                }, (event) => updateProgress(event, "import"))
            })
        })
    } else {
        id = parseInt(""+id) // vue probs is a string, typechecking not working here
        var url: string
        switch(id){
            case 1: url = 'gltf/office/'; break
            case 2: url = 'gltf/facility-mechanical-room/'; break
            case 3: url = 'gltf/house-complex/'; break
            default: throw new Error("model id is not defined or not valid")
        }
        url = 'gltf/facility-mechanical-room/'
        
        BABYLON.SceneLoader.ImportMesh("", url, "scene.gltf", scene, (meshes, particleSystems, skeletons) => {
            let buildingModel = <BABYLON.Mesh> meshes[0]
            //normalize(buildingModel)
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
