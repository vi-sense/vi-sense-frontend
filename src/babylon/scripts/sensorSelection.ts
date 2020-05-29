import * as BABYLON from 'babylonjs';
import * as GUI from "babylonjs-gui";
import * as MATS from 'babylonjs-materials';
import Storage from '../../storage/Storage';
import SKEYS from '../../storage/StorageKeys';
import { focusOnMesh } from './focusOnMesh';
import FloorCamera from './floorCamera';

const API_URL = process.env.API_URL;
const sensorColor = BABYLON.Color3.Purple();
const selectedSensorColor = BABYLON.Color3.Teal();

var myScene: BABYLON.Scene;
var storage: Storage;
var highlight: BABYLON.HighlightLayer;

// stores all GUI Labels; a sensorLabel contains the container (rect) with its children [circle, label]
// uses the meshID as key, access like this: sensorLabels["node505"]
var sensorLabels = [];

// stores all fetched sensor data
// uses the meshID as key, access like this: sensorData["node505"]
var sensorData = [];
var selected;


/**
  * @author Lennard Grimm
  * This is the callback function used for (de)selecting meshes via Vue or Babylon
  * Update the selection state of a mesh by passing its meshID (e.g. "node505")
  * Changes the color of the mesh, and the text displayed in the label
  */
export function updateSelectedSensor(meshID: string) {
  if (myScene) {
    // deselect previously selected mesh
    if (selected) {
      let mesh = myScene.getMeshByName(selected);
      mesh.state = "";
      highlight.removeMesh(mesh.subMeshes[0].getRenderingMesh());
      //mesh.showBoundingBox = false;
      mesh.renderOutline = false;
      let mat = mesh.material as BABYLON.PBRMaterial;
      mat.albedoColor = sensorColor;
      sensorLabels[mesh.name].background = "";
      sensorLabels[mesh.name].children[1].text = "";
    }
    // select mesh with passed meshID
    if (meshID) {
      let mesh = myScene.getMeshByName(meshID);
      mesh.state = "selected";
      highlight.addMesh(mesh.subMeshes[0].getRenderingMesh(), BABYLON.Color3.Black());
      //mesh.showBoundingBox = true;
      mesh = mesh.subMeshes[0].getRenderingMesh();
      mesh.outlineWidth = .05;
      mesh.outlineColor = BABYLON.Color3.Black();
      mesh.renderOutline = true;
      let mat = mesh.material as BABYLON.PBRMaterial;
      mat.albedoColor = selectedSensorColor;
      sensorLabels[meshID].background = "white";
      // + "\n" + sensorData[meshID].data[sensorData[meshID].data.length - 1].value.toString() + sensorData[meshID].measurement_unit;
      sensorLabels[meshID].children[1].text = sensorData[meshID].name;
    }
  }
}


/**
  * @author Lennard Grimm
  * This function handles the setup of basic sensor selection.
  * It instantiates GUI elements for all available sensors and adds Observables to them and their respective meshes.
  */
export default async function setupSensorSelection(scene: BABYLON.Scene, modelID: number, modelMeshes, STORE: Storage) {
  myScene = scene;
  storage = STORE;

  STORE.registerOnUpdateCallback(SKEYS.SELECTED_SENSOR, (value) => {
    updateSelectedSensor(value);
  })

  // setup of highlight layer
  highlight = new BABYLON.HighlightLayer("highlight", myScene);
  highlight.innerGlow = true
  highlight.outerGlow = false
  highlight.blurHorizontalSize = 1
  highlight.blurVerticalSize = 1

  // GET MODEL DATA
  let model = await getModelData(modelID);
  let sensors = model.sensors;

  for (let i = 0; i < sensors.length; i++) {
    // CURRENT MESH, all selectable meshes are colored purple
    let mesh = scene.getMeshByName(sensors[i].mesh_id);
    let mat = mesh.material as BABYLON.PBRMaterial;
    mat.albedoColor = sensorColor;

    //QPRJU9#12 - sine water flow
    //QPRJU9#16 - sine color change
    //JN2BSF#54 - turbulence fire
    //4EQZYW - temperature gradient
    //imported using the node material editor: https://nme.babylonjs.com/#QPRJU9#12
    // await BABYLON.NodeMaterial.ParseFromSnippetAsync("QPRJU9#16", myScene).then(nodeMaterial => {
    //   mesh.material = nodeMaterial;
    // });

    // GET SENSORDATA
    let data = await getSensorData(sensors[i].id);
    sensorData[sensors[i].mesh_id] = data;

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
        selected = storage.get(SKEYS.SELECTED_SENSOR)
        storage.set(SKEYS.SELECTED_SENSOR, sensors[i].mesh_id)
        
        let target = mesh.getBoundingInfo().boundingSphere.centerWorld;
        focusOnMesh(scene, target);
      } else {
        selected = storage.get(SKEYS.SELECTED_SENSOR)
        storage.set(SKEYS.SELECTED_SENSOR, null)
      }
    })
    sensorLabels[sensors[i].mesh_id] = rect;
    rect.addControl(label);
    rect.linkWithMesh(mesh);

    // REGISTER MESH ACTIONS
    mesh.actionManager = new BABYLON.ActionManager(scene);
    // change mesh color on click, change state, display sensor data
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger, async function(e) {
          if (e.source.state === "") {
            // select mesh
            selected = storage.get(SKEYS.SELECTED_SENSOR)
            storage.set(SKEYS.SELECTED_SENSOR, sensors[i].mesh_id)
            
            let target = e.source.getBoundingInfo().boundingSphere.centerWorld;
            focusOnMesh(scene, target);
            //focusOn(e.source.getBoundingInfo().boundingSphere.centerWorld, e.source);
          } else {
            // delselect mesh
            selected = storage.get(SKEYS.SELECTED_SENSOR)
            storage.set(SKEYS.SELECTED_SENSOR, null)
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
