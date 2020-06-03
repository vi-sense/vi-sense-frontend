import * as BABYLON from 'babylonjs';
import * as GUI from "babylonjs-gui";
import Storage from '../../storage/Storage';
import { focusOnMesh } from './focusOnMesh';
import { pulsatingShader } from './shaders';

const API_URL = process.env.API_URL;
const sensorColor = BABYLON.Color3.Purple();
const selectedSensorColor = BABYLON.Color3.Teal();

var myScene: BABYLON.Scene;
var storage: Storage;
var highlight: BABYLON.HighlightLayer;

// stores all GUI Labels; a sensorLabel contains the container (rect) with its children [circle, label]
// uses the mesh_id as key, access like this: sensorLabels["node505"]
var sensorLabels = [];

var sensors = [];

/**
  * @author Lennard Grimm
  * This is the callback function used for (de)selecting meshes via Vue or Babylon
  * Update the selection state of a mesh by passing its mesh_id (e.g. "node505")
  * Changes the color of the mesh, and the text displayed in the label
  */
export async function updateSelectedSensor(sensor_id: number, action: String) {
    let sensor = await getSensorData(sensor_id);
    if(action == "new") {
      let mesh = myScene.getMeshByName(sensor.mesh_id);
      mesh.state = "selected";
      highlight.addMesh(mesh.subMeshes[0].getRenderingMesh(), BABYLON.Color3.Black());
      mesh = mesh.subMeshes[0].getRenderingMesh();
      mesh.outlineWidth = .05;
      mesh.outlineColor = BABYLON.Color3.Black();
      mesh.renderOutline = true;
      let mat = mesh.material as BABYLON.PBRMaterial;
      mat.albedoColor = selectedSensorColor;
      sensorLabels[sensor_id].background = "white";
      sensorLabels[sensor_id].children[1].text = sensor.name;
    } 
    else if (action == "removed") {
      let mesh = myScene.getMeshByName(sensor.mesh_id);
      mesh.state = "";
      highlight.removeMesh(mesh.subMeshes[0].getRenderingMesh());
      mesh.renderOutline = false;
      let mat = mesh.material as BABYLON.PBRMaterial;
      mat.albedoColor = sensorColor;
      sensorLabels[sensor_id].background = "";
      sensorLabels[sensor_id].children[1].text = "";
      // stop camera animations
      myScene.stopAnimation(myScene.activeCamera);
    }
}

export async function moveToMesh(scene: BABYLON.Scene, sensor_id: number) {
  let sensor = await getSensorData(sensor_id);
  let mesh = scene.getMeshByName(sensor.mesh_id);
  let target = mesh.getBoundingInfo().boundingSphere.centerWorld;
  focusOnMesh(scene, target);
}

/**
  * @author Lennard Grimm
  * This function handles the setup of basic sensor selection.
  * It instantiates GUI elements for all available sensors and adds Observables to them and their respective meshes.
  */
export default async function setupSensorSelection(scene: BABYLON.Scene, modelID: number, modelMeshes, STORE: Storage) {
  myScene = scene;
  storage = STORE;

  storage.onSensorSelectionChanged((id, action) => {
    updateSelectedSensor(id, action);
  })

  storage.registerOnUpdateCallback(2, (id) => {
    if (id == null) myScene.stopAnimation(myScene.activeCamera);
    else moveToMesh(myScene, id);
  })

  // setup of highlight layer
  highlight = new BABYLON.HighlightLayer("highlight", myScene);
  highlight.innerGlow = true
  highlight.outerGlow = false
  highlight.blurHorizontalSize = 1
  highlight.blurVerticalSize = 1

  // GET MODEL DATA
  let model = await getModelData(modelID);
  sensors = model.sensors;

  for (let i = 0; i < sensors.length; i++) {
    // CURRENT MESH, all selectable meshes are colored purple
    let mesh = scene.getMeshByName(sensors[i].mesh_id);
    // let mat = mesh.material as BABYLON.PBRMaterial;
    // mat.albedoColor = sensorColor;

    //QPRJU9#12 - sine water flow
    //QPRJU9#16 - sine color change
    //JN2BSF#54 - turbulence fire
    //4EQZYW - temperature gradient
    //imported using the node material editor: https://nme.babylonjs.com/#QPRJU9#12
    // await BABYLON.NodeMaterial.ParseFromSnippetAsync("QPRJU9#16", myScene).then(nodeMaterial => {
    //   mesh.material = nodeMaterial;
    // });
    mesh.material = pulsatingShader();
    
    // GUI SETUP
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let rect = new GUI.Rectangle();
    rect.thickness = 0;
    rect.adaptHeightToChildren = true;
    rect.adaptWidthToChildren = true;
    rect.isPointerBlocker = true;
    advancedTexture.addControl(rect);

    let circle = new GUI.Ellipse();
    circle.width = "70px";
    circle.height = "70px";
    circle.alpha = 0.8;
    circle.background = "white";
    circle.thickness = 2;
    rect.addControl(circle);

    let label = new GUI.TextBlock();
    label.resizeToFit = true;
    //padding doesnt work when resizeToFit = true;
    //label.paddingRightInPixels = 20;
    //label.paddingLeftInPixels = 20;

    // select mesh on label click
    rect.onPointerDownObservable.add(function() {
      if (mesh.state == "") {
        storage.selectSensor(sensors[i].id)
      } else {
        storage.unselectSensor(sensors[i].id)
      }
    })
    sensorLabels[sensors[i].id] = rect;
    rect.addControl(label);
    rect.linkWithMesh(mesh);

    // REGISTER MESH ACTIONS
    mesh.actionManager = new BABYLON.ActionManager(scene);
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger, async function(e) {
          if (e.source.state === "") {
            storage.selectSensor(sensors[i].id)
          } else {
            storage.unselectSensor(sensors[i].id)
          }
        }));


    // // on hover enter, change color to teal
    // mesh.actionManager.registerAction(
    //   new BABYLON.InterpolateValueAction(
    //     BABYLON.ActionManager.OnPointerOverTrigger,
    //     mesh.material,
    //     'albedoColor',
    //     selectedSensorColor,
    //     200
    //   ));
    //
    // // on hover leave, change color back to purple if mesh is not selected
    // mesh.actionManager.registerAction(
    //   new BABYLON.InterpolateValueAction(
    //     BABYLON.ActionManager.OnPointerOutTrigger,
    //     mesh.material,
    //     'albedoColor',
    //     sensorColor,
    //     200,
    //     new BABYLON.PredicateCondition(
    //       mesh.actionManager as BABYLON.ActionManager,
    //       function() {
    //         return mesh.state !== "selected";
    //       }
    //     )
    //   ));
  }
}


async function getModelData(id: number) {
  let response = await fetch(API_URL + "/models/" + id)
    .then(res => { return res.json() })
    .catch(err => { throw new Error("Can not load model data") });
  return response;
}

async function getSensorData(id: number) {
  let response = await fetch(API_URL + "/sensors/" + id)
    .then(res => { return res.json() })
    .catch(err => { throw new Error("Can not load sensor data") });
  return response;
}
