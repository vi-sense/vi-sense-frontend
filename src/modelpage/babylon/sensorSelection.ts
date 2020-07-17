import * as BABYLON from 'babylonjs';
import * as GUI from "babylonjs-gui";
import Storage from '../../storage/Storage';
import { focusOnMesh } from './focusOnMesh';
import { PulseShader, GradientShader, FireShader, WaterFlowShader } from './shaders';
import SKEYS from "../../storage/StorageKeys";
import { getSensorColor } from "../../storage/SensorColors";
import { InputBlock } from 'babylonjs';

const API_URL = process.env.API_URL;

var SELECTABLES: BABYLON.AbstractMesh[];
var advancedTexture: GUI.AdvancedDynamicTexture;

var myScene: BABYLON.Scene;
var storage: Storage;
var highlight: BABYLON.HighlightLayer;
var arrow_svg = require('../../assets/arrow.svg');

// stores all UI elements for a initialized sensor: { rect, label, arrow, circle, color }
// uses the sensor_id as key
var sensorLabels = {};

// stores all initialized sensors with sensor_id as key
var savedSensors = {};

/**
  * @author Lennard Grimm
  * Update the selection state of a mesh by passing the respective sensor_id
  * Adds a highlight layer to the mesh and changes the displayed label
  */
export async function updateSelectedSensor(sensor_id: number, action: String) {
  let sensor = savedSensors[sensor_id];
  if (!sensor) throw new Error("Did not find a sensor with id: " + sensor_id)
  let mesh = myScene.getMeshByUniqueID(sensor.mesh_id);
  if (!mesh) throw new Error("Did not find a mesh with id: " + sensor.mesh_id)

  if(action == "new") {
    mesh.state = "selected";
    highlight.removeExcludedMesh(<BABYLON.Mesh>mesh)
    highlight.addMesh(mesh.subMeshes[0].getRenderingMesh(), BABYLON.Color3.Black());
    sensorLabels[sensor_id].rect.alpha = 1;
    sensorLabels[sensor_id].rect.isVisible = true;
    sensorLabels[sensor_id].arrow.alpha = 0;
    sensorLabels[sensor_id].circle.width = "70px";
    sensorLabels[sensor_id].circle.height = "70px";
  }
  else if (action == "removed") {
    mesh.state = "";
    highlight.addExcludedMesh(<BABYLON.Mesh>mesh)
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
  * Set up all callback functions for sensor initialization and picking
  */
export default async function setupSensorSelection(scene: BABYLON.Scene, modelID: number, modelMeshes, STORE: Storage) {
  myScene = scene;
  storage = STORE;

  let sel = new PulseShader();
  let def = <BABYLON.PBRMaterial>myScene.getMaterialByName("Default");
  //let def = new BABYLON.StandardMaterial("default", myScene);
  SELECTABLES = myScene.getNodeByName("selectables").getChildMeshes();
  SELECTABLES.forEach((mesh) => {
    mesh.material = def;
  })

  // setup of highlight layer
  highlight = new BABYLON.HighlightLayer("highlight", myScene);
  highlight.innerGlow = true
  highlight.outerGlow = false
  highlight.blurHorizontalSize = 1
  highlight.blurVerticalSize = 1
  modelMeshes.forEach((mesh) => highlight.addExcludedMesh(mesh))

  await addUIElements(modelID);

  scene.setRenderingAutoClearDepthStencil(2, false, false, false);

  // CALLBACK FOR SENSOR SELECTION
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
      //modelMeshes.forEach((m) => highlight.addExcludedMesh(<BABYLON.Mesh>m))
      SELECTABLES.forEach((mesh) => {
        mesh.isPickable = false
        let i = mesh.metadata.sensor_id ? mesh.metadata.sensor_id : null;
        if (i) {
          sensorLabels[i].circle.hoverCursor = "pointer";
          if (savedSensors[i].lower_bound != null && savedSensors[i].upper_bound != null) {
            mesh.material = new GradientShader(savedSensors[i].lower_bound, savedSensors[i].upper_bound, savedSensors[i].latest_data.value);
          } else {
            mesh.material = new GradientShader(0, 100, 50);
          }
        } else {
          mesh.material = def;
        }
        //highlight.removeMesh(mesh.subMeshes[0].getRenderingMesh());
        mesh.actionManager.actions.splice(0, 1);
      })
    }
    else {
      let selectedSensors = storage.getSelectedSensors()
      selectedSensors.forEach((sensor) => storage.unselectSensor(sensor))
      //modelMeshes.forEach((m) => highlight.removeExcludedMesh(<BABYLON.Mesh>m))
      SELECTABLES.forEach((mesh) => {
        mesh.isPickable = true;
        mesh.material = sel;

        if (mesh.metadata.sensor_id) sensorLabels[mesh.metadata.sensor_id].circle.hoverCursor = "default";
        //highlight.addMesh(mesh.subMeshes[0].getRenderingMesh(), new BABYLON.Color3.White());
        mesh.actionManager = new BABYLON.ActionManager(myScene);
        mesh.actionManager.registerAction(
          new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger, async function (e) {
              if (mesh.metadata.sensor_id && mesh.metadata.sensor_id != null) storage.updateInitState(id, 'mesh_picked', savedSensors[mesh.metadata.sensor_id].name)
              else storage.updateInitState(id, 'mesh_picked')

              storage.onInitStateChanged(async (id, state) => {
                if(state === "confirmed") {
                  if (savedSensors[id] && savedSensors[id].mesh_id != null) {
                    // REPOSITION A SENSOR
                    let prevMesh = myScene.getMeshByUniqueID(savedSensors[id].mesh_id)
                    prevMesh.material = def;
                    prevMesh.metadata.sensor_id = null;
                  }
                  
                  if (mesh.metadata.sensor_id && mesh.metadata.sensor_id != null) {
                    // OVERWRITE A MESH WITH ANOTHER SENSOR
                    await updateSensorMeshID(mesh.metadata.sensor_id, null);
                  }

                  // INIT SENSOR
                  await updateSensorMeshID(id, mesh.uniqueId);
                  mesh.metadata.sensor_id = id;
                  storage.updateInitState(id, 'updated');
                  
                  advancedTexture.dispose();
                  for (const prop of Object.getOwnPropertyNames(sensorLabels)) {
                    delete sensorLabels[prop];
                  }
                  for (const prop of Object.getOwnPropertyNames(savedSensors)) {
                    delete savedSensors[prop];
                  }
                  await addUIElements(modelID);
                  
                  storage.set(SKEYS.INIT_SENSOR, null);
                  storage.removeCallbacks()
                }
              })
        }));
      })
    }
  })
}

/**
  * @author Lennard Grimm
  * Create UI elements and set shaders for all initialized sensors in the provided model
  */
async function addUIElements(modelID: number) {
  let model = await getModelData(modelID);
  let sensors = model.sensors;
  advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  for (let i = 0; i < sensors.length; i++) {
    if (sensors[i].mesh_id == null || sensors[i].mesh_id == "") continue;
    savedSensors[sensors[i].id] = sensors[i]

    let mesh: BABYLON.AbstractMesh = myScene.getMeshByUniqueID(sensors[i].mesh_id);
    if(!mesh) {
      console.log("Did not find a mesh with id: " + sensors[i].mesh_id);
      continue;
    }
    mesh.metadata.sensor_id = sensors[i].id;

    //sensor meshes get a different rendering group so that the highlight layer will always be on top
    mesh.renderingGroupId = 1;
    
    if(sensors[i].lower_bound != null && sensors[i].upper_bound != null && sensors[i].latest_data.value != null) {
      mesh.material = new GradientShader(sensors[i].lower_bound, sensors[i].upper_bound, sensors[i].latest_data.value);
    } else mesh.material = new GradientShader(0, 100, 50);

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
      if (storage.get(SKEYS.INIT_SENSOR) == null) {
        if (mesh.state == "") storage.selectSensor(sensors[i].id)
        else storage.unselectSensor(sensors[i].id)
      }
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
    label.fontSizeInPixels = 13
    label.paddingBottomInPixels = 5
    label.paddingTopInPixels = 8
    label.paddingLeftInPixels = 5
    label.paddingRightInPixels = 5
    label.text = sensors[i].name;
    label.textWrapping = GUI.TextWrapping.WordWrap
    label.resizeToFit = true;
    rect.adaptHeightToChildren = true;
    rect.adaptWidthToChildren = true;
    rect.addControl(label);

    stackPanel.addControl(rect);
    stackPanel.linkWithMesh(mesh);

    sensorLabels[sensors[i].id] = { rect: rect, label: label, arrow: arrow, circle: circle, color: getSensorColor(sensors[i].id) };
  }
  myScene.metadata.savedSensors = savedSensors;
}

export function turnArrow(sensorId, gradient) {
  if(gradient === undefined) {
    sensorLabels[sensorId].arrow.alpha = 0
  } else{
    sensorLabels[sensorId].arrow.alpha = 1
    sensorLabels[sensorId].arrow.rotation = -Math.atan(gradient)
  }
}

export function updateLocalSensors(sensorId, upper_bound, lower_bound) {
  if(!savedSensors[sensorId]) return;
  savedSensors[sensorId].upper_bound = upper_bound
  savedSensors[sensorId].lower_bound = lower_bound
  updateShader(sensorId)
}

/**
  * @author Lennard Grimm
  * Update the shader of a mesh to display the current value in relation to upper and lower bounds
  */
export function updateShader(sensorId, value?) {
  if (!savedSensors[sensorId]) return;
  let sensor = savedSensors[sensorId]
  let mesh = myScene.getMeshByUniqueID(sensor.mesh_id);

  if (value) {
    sensorLabels[sensorId].label.text = savedSensors[sensorId].name + "\n" + value.toFixed(2).toString() + savedSensors[sensorId].measurement_unit;
    if (sensor.lower_bound != null && sensor.upper_bound != null) {
      (<InputBlock>(<GradientShader>mesh.material).getBlockByName("sourceMin")).value = sensor.lower_bound;
      (<InputBlock>(<GradientShader>mesh.material).getBlockByName("sourceMax")).value = sensor.upper_bound;
      (<InputBlock>(<GradientShader>mesh.material).getBlockByName("inputValue")).value = value;
    } else {
      // one of the bounds isnt set, set material to default
      (<InputBlock>(<GradientShader>mesh.material).getBlockByName("sourceMin")).value = 0;
      (<InputBlock>(<GradientShader>mesh.material).getBlockByName("sourceMax")).value = 100;
      (<InputBlock>(<GradientShader>mesh.material).getBlockByName("inputValue")).value = 50;
    }
  }
  else {
    sensorLabels[sensorId].label.text = savedSensors[sensorId].name + "\n"
  }
}


/**
 * http helper functions
 */
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
