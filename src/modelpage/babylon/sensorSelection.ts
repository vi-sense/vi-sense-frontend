import * as BABYLON from 'babylonjs';
import * as GUI from "babylonjs-gui";
import Storage from '../../storage/Storage';
import { focusOnMesh } from './focusOnMesh';
import { PulseShader, GradientShader } from './shaders';
import SKEYS from "../../storage/StorageKeys";
import {getSensorColor} from "../../storage/SensorColors";
import { InputBlock } from 'babylonjs';

const API_URL = process.env.API_URL;

var SELECTABLES: BABYLON.AbstractMesh[];
var advancedTexture: GUI.AdvancedDynamicTexture;

var myScene: BABYLON.Scene;
var storage: Storage;
var highlight: BABYLON.HighlightLayer;
var arrow_svg = require('../../assets/arrow.svg');

// stores all GUI Labels; a sensorLabel contains the container (rect) with its children [circle, label]
// uses the sensor_id as key
var sensorLabels = {};

// stores all sensors with sensor_id as key
var savedSensors = {};

/**
  * @author Lennard Grimm
  * This is the callback function used for (de)selecting meshes via Vue or Babylon
  * Update the selection state of a mesh by passing the respective sensor_id
  * Changes the color of the mesh, and the text displayed in the label
  */
export async function updateSelectedSensor(sensor_id: number, action: String) {
  let sensor = savedSensors[sensor_id];
  if (!sensor) throw new Error("Did not find a sensor with id: " + sensor_id)
  let mesh = myScene.getMeshByUniqueID(sensor.mesh_id);
  if (!mesh) throw new Error("Did not find a mesh with id: " + sensor.mesh_id)

  if(action == "new") {
    mesh.state = "selected";
    highlight.addMesh(mesh.subMeshes[0].getRenderingMesh(), BABYLON.Color3.Black());
    mesh = mesh.subMeshes[0].getRenderingMesh();
    mesh.outlineWidth = .05;
    mesh.outlineColor = BABYLON.Color3.Black();
    sensorLabels[sensor_id].rect.alpha = 1;
    sensorLabels[sensor_id].rect.isVisible = true;
    sensorLabels[sensor_id].arrow.alpha = 1;
    sensorLabels[sensor_id].circle.width = "70px";
    sensorLabels[sensor_id].circle.height = "70px";
  }
  else if (action == "removed") {
    mesh.state = "";
    highlight.removeMesh(mesh.subMeshes[0].getRenderingMesh());
    sensorLabels[sensor_id].rect.alpha = 0;
    sensorLabels[sensor_id].rect.isVisible = false;
    sensorLabels[sensor_id].arrow.alpha = 0;
    sensorLabels[sensor_id].circle.width = "30px";
    sensorLabels[sensor_id].circle.height = "30px";
  }
}

export async function moveToMesh(scene: BABYLON.Scene, sensor_id: number) {
  let sensor = savedSensors[sensor_id];
  if (!sensor) throw new Error("Did not find a sensor with id: " + sensor_id)
  let mesh = scene.getMeshByUniqueID(sensor.mesh_id);
  if (!mesh) throw new Error("Did not find a mesh with id: " + sensor.mesh_id)
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

  SELECTABLES = myScene.getNodeByName("selectables").getChildMeshes();

  // setup of highlight layer
  highlight = new BABYLON.HighlightLayer("highlight", myScene);
  highlight.innerGlow = true
  highlight.outerGlow = false
  highlight.blurHorizontalSize = 2
  highlight.blurVerticalSize = 2

  await addUIElements(modelID);

  storage.onSensorSelectionChanged((id, action) => {
    updateSelectedSensor(id, action);
  })

  // CALLBACK FOR CAMERA DRIVE
  storage.registerOnUpdateCallback(SKEYS.CAMERA_DRIVE_SENSOR, (id) => {
    if (id == null) myScene.stopAnimation(myScene.activeCamera);
    else moveToMesh(myScene, id);
  })

  // CALLBACK FOR SENSOR INIT
  storage.registerOnUpdateCallback(SKEYS.INIT_SENSOR, (id) => {
    if (id == null) {
      SELECTABLES.forEach((mesh) => {
        mesh.isPickable = false
        highlight.removeMesh(mesh.subMeshes[0].getRenderingMesh());
        mesh.actionManager.actions.splice(0, 1);
      })
    }
    else {
      SELECTABLES.forEach((mesh) => {
        mesh.isPickable = true
        highlight.addMesh(mesh.subMeshes[0].getRenderingMesh(), BABYLON.Color3.White());
        mesh.actionManager = new BABYLON.ActionManager(myScene);
        mesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger, async function (e) {
              if (mesh.metadata.sensor_id && mesh.metadata.sensor_id != null) storage.updateInitState(id, 'mesh_picked', savedSensors[mesh.metadata.sensor_id].name)
              else storage.updateInitState(id, 'mesh_picked')

              storage.onInitStateChanged(async (id, state) => {
                if(state === "confirmed") {
                  let selectedSensors = storage.getSelectedSensors()
                  selectedSensors.forEach((sensor) => {
                    storage.unselectSensor(sensor)
                  })

                  if (savedSensors[id] && savedSensors[id].mesh_id != null) {
                    // REPOSITION A SENSOR
                    let prevMesh = myScene.getMeshByUniqueID(savedSensors[id].mesh_id)
                    prevMesh.material = myScene.getMaterialByName("Mat");
                    prevMesh.metadata.sensor_id = null;
                  }
                  
                  if (mesh.metadata.sensor_id && mesh.metadata.sensor_id != null) {
                    // OVERRIDE A MESH WITH ANOTHER SENSOR
                    await updateSensorMeshID(mesh.metadata.sensor_id, null);
                  }

                  // SIMPLY INIT SENSOR
                  await updateSensorMeshID(id, mesh.uniqueId);
                  mesh.metadata.sensor_id = id;
                  storage.updateInitState(id, 'updated');
                  storage.set(SKEYS.INIT_SENSOR, null);
                  storage.removeCallbacks()

                  advancedTexture.dispose();
                  for (const prop of Object.getOwnPropertyNames(sensorLabels)) {
                    delete sensorLabels[prop];
                  }
                  for (const prop of Object.getOwnPropertyNames(savedSensors)) {
                    delete savedSensors[prop];
                  }
                  addUIElements(modelID);
                }
              })
        }));
      })
    }
  })
}

async function addUIElements(modelID: number) {
  // GET MODEL DATA
  let model = await getModelData(modelID);
  let sensors = model.sensors;
  advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  for (let i = 0; i < sensors.length; i++) {
    if (sensors[i].mesh_id == null || sensors[i].mesh_id == "") continue;
    savedSensors[sensors[i].id] = sensors[i]

    let mesh: BABYLON.AbstractMesh;
    mesh = myScene.getMeshByUniqueID(sensors[i].mesh_id);
    if(!mesh) {
      console.log("Did not find a mesh with id: " + sensors[i].mesh_id);
      continue;
    }

    mesh.metadata.sensor_id = sensors[i].id;
    
    //QPRJU9#12 - sine water flow
    //QPRJU9#16 - sine color change
    //JN2BSF#54 - turbulence fire
    //4EQZYW - temperature gradient
    //imported using the node material editor: https://nme.babylonjs.com/#QPRJU9#12
    // await BABYLON.NodeMaterial.ParseFromSnippetAsync("4EQZYW", myScene).then(nodeMaterial => {
    //   mesh.material = nodeMaterial;
    // });
    console.log(sensors[i].lower_bound, sensors[i].upper_bound, sensors[i].latest_data.value)
    if(sensors[i].lower_bound != null && sensors[i].upper_bound != null && sensors[i].latest_data.value != null) {
      mesh.material = new GradientShader(sensors[i].lower_bound, sensors[i].upper_bound, sensors[i].latest_data.value);
    } else mesh.material = new GradientShader(0, 100, 50);

    //mesh.material = new PulseShader(20, 0.25, 0.75);
    mesh.material.backFaceCulling = true;

    // GUI SETUP
    let stackPanel = new GUI.StackPanel();
    stackPanel.isVertical = true;
    stackPanel.isHitTestVisible = false;
    advancedTexture.addControl(stackPanel);

    let arrow = new GUI.Image("arrow", arrow_svg)
    arrow.stretch = GUI.Image.STRETCH_UNIFORM
    arrow.width = "50px"
    arrow.height = "50px"
    arrow.alpha = 0

    let circle = new GUI.Ellipse();
    circle.width = "30px";
    circle.height = "30px";
    circle.alpha = 1;
    circle.background = getSensorColor(sensors[i].id);
    circle.addControl(arrow)
    circle.isPointerBlocker = true;
    circle.hoverCursor = "pointer"
    circle.onPointerDownObservable.add(function () {
      if (mesh.state == "") storage.selectSensor(sensors[i].id)
      else storage.unselectSensor(sensors[i].id)
    })
    stackPanel.addControl(circle)

    let rect = new GUI.Rectangle();
    rect.alpha = 0;
    rect.isVisible = false;
    rect.background = "white";
    rect.cornerRadius = 5;
    rect.isPointerBlocker = false;
    stackPanel.addControl(rect);

    let label = new GUI.TextBlock();
    label.width = "120px"
    label.fontSizeInPixels = 14
    label.paddingBottomInPixels = 3
    label.paddingTopInPixels = 3
    label.paddingLeftInPixels = 3
    label.paddingRightInPixels = 3
    label.text = sensors[i].name;
    label.textWrapping = GUI.TextWrapping.WordWrap
    label.resizeToFit = true;
    rect.adaptHeightToChildren = true;
    rect.adaptWidthToChildren = true;
    rect.addControl(label);

    stackPanel.addControl(rect);
    stackPanel.linkWithMesh(mesh);

    sensorLabels[sensors[i].id] = { rect: rect, arrow: arrow, circle: circle, color: getSensorColor(sensors[i].id) };
    // REGISTER MESH ACTIONS
    // mesh.actionManager = new BABYLON.ActionManager(scene);
    // mesh.actionManager.registerAction(
    //   new BABYLON.ExecuteCodeAction(
    //     BABYLON.ActionManager.OnPickTrigger, async function(e) {
    //       if (e.source.state === "") storage.selectSensor(sensors[i].id)
    //       else storage.unselectSensor(sensors[i].id)
    //     }));

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
  myScene.metadata.savedSensors = savedSensors;
}

export function turnArrow(sensorId, gradient) {
  console.log(gradient)
  if(gradient === undefined) {
    sensorLabels[sensorId].arrow.alpha = 0
  } else{
    sensorLabels[sensorId].arrow.alpha = 1
    sensorLabels[sensorId].arrow.rotation = -Math.atan(gradient)
  }
}

export function updateLocalSensors(sensorId, upper_bound, lower_bound) {
  if (upper_bound) savedSensors[sensorId].upper_bound = upper_bound
  if (lower_bound) savedSensors[sensorId].lower_bound = lower_bound
  updateShader(sensorId)
}

export function updateShader(sensorId, value?) {
  let sensor = savedSensors[sensorId]
  let mesh = myScene.getMeshByUniqueID(sensor.mesh_id);

  console.log(sensor.lower_bound, sensor.upper_bound)
  if (sensor.lower_bound != null && sensor.upper_bound != null) {
    (<InputBlock>(<GradientShader>mesh.material).getBlockByName("sourceMin")).value = sensor.lower_bound;
    (<InputBlock>(<GradientShader>mesh.material).getBlockByName("sourceMax")).value = sensor.upper_bound;
  }
  if (value) {  
    (<InputBlock>(<GradientShader>mesh.material).getBlockByName("Input Temperature")).value = value
  }
}

async function getModelData(id: number) {
  let response = await fetch(API_URL + "/models/" + id)
    .then(res => { return res.json() })
    .catch(err => { throw new Error("Can not load model data") });
  return response;
}

async function updateSensorMeshID(sensor_id: number, mesh_id: number) {
  let update = {
    'mesh_id': mesh_id,
  }
  let response = await fetch(API_URL + "/sensors/" + sensor_id, {
    method: 'PATCH',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(update)
  })
      .then(res => { return res.json() })
      .catch(err => { throw new Error("Can not update sensors mesh id") });
  return response;
}
