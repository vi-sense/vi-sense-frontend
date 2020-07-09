import * as BABYLON from 'babylonjs'
import { degToRad } from './utils';
import { eventBus } from "../../main.js"
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
            if(!response.ok) eventBus.$emit("loading-failed")
            response.json().then(bodyData => {
                var url = API_URL + '/' + bodyData.url
                BABYLON.SceneLoader.ImportMesh('', '', url, scene, (meshes, particleSystems, skeletons) => {
                    let buildingModel = <BABYLON.Mesh> meshes[0]
                    callback(meshes)
                }, (event) => updateProgress(event, "import"), e => {eventBus.$emit("loading-failed"); throw e})
            }).catch(e => {eventBus.$emit("loading-failed"); throw e})
        }).catch(e => {eventBus.$emit("loading-failed"); throw e})
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
            callback(meshes)
        }, (event) => updateProgress(event, "import"))
    }
}


function updateProgress(event, state?: String) {
    let percentComplete;
    if (event.lengthComputable) {
        percentComplete = event.loaded / event.total * 100;
    } else {
        let dlCount = event.loaded / (1024 * 1024);
        percentComplete = Math.floor(dlCount * 100.0) / 100.0;
    }
    eventBus.$emit("loading-progress", percentComplete)

}
