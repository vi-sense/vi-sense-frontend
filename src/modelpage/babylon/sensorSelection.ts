import * as BABYLON from 'babylonjs';
import * as GUI from "babylonjs-gui";
import Storage from '../../storage/Storage';
import { focusOnMesh } from './focusOnMesh';
import { pulsatingShader } from './shaders';
import { SENSOR_COLORS } from '../../storage/Settings';

const API_URL = process.env.API_URL;
const sensorColor = BABYLON.Color3.Purple();
const selectedSensorColor = BABYLON.Color3.Teal();

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
    sensorLabels[sensor_id].rect.alpha = 1;
    sensorLabels[sensor_id].arrow.alpha = 1;
    sensorLabels[sensor_id].circle.width = "70px";
    sensorLabels[sensor_id].circle.height = "70px";
    // sensorLabels[sensor_id].label.children[0].text = sensor.name;
  }
  else if (action == "removed") {
    let mesh = myScene.getMeshByName(sensor.mesh_id);
    mesh.state = "";
    highlight.removeMesh(mesh.subMeshes[0].getRenderingMesh());
    mesh.renderOutline = false;
    let mat = mesh.material as BABYLON.PBRMaterial;
    mat.albedoColor = sensorColor;
    sensorLabels[sensor_id].rect.alpha = 0;
    sensorLabels[sensor_id].arrow.alpha = 0;
    sensorLabels[sensor_id].circle.width = "50px";
    sensorLabels[sensor_id].circle.height = "50px";
    // sensorLabels[sensor_id].label.children[0].text = "";
  }
}

export async function moveToMesh(scene: BABYLON.Scene, sensor_id: number) {
  let sensor = savedSensors[sensor_id];
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
  let sensors = model.sensors;

  for (let i = 0; i < sensors.length; i++) {
    if(sensors[i].mesh_id == null || sensors[i].mesh_id == "") continue;
    savedSensors[sensors[i].id] = sensors[i]

    // CURRENT MESH, all selectable meshes are colored purple
    let mesh: BABYLON.AbstractMesh;
    if (model.id == 4) mesh = scene.getMeshByUniqueID(parseInt(sensors[i].mesh_id));
    else mesh = scene.getMeshByName(sensors[i].mesh_id);
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
    // let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let stackPanel = new GUI.StackPanel();
    stackPanel.isVertical = true;
    // advancedTexture.addControl(stackPanel);

    let arrow = new GUI.Image("arrow", arrow_svg)
    arrow.stretch = GUI.Image.STRETCH_UNIFORM
    arrow.width = "50px"
    arrow.height = "50px"
    arrow.alpha = 0
    arrow.isPointerBlocker = false;

    let circle = new GUI.Ellipse();
    circle.width = "50px";
    circle.height = "50px";
    circle.alpha = 1;
    circle.background = SENSOR_COLORS[sensors[i].id];
    circle.addControl(arrow)
    circle.isPointerBlocker = true;
    circle.onPointerClickObservable.add(function () {
      console.log("clicked " + i)
      if (mesh.state == "") storage.selectSensor(sensors[i].id)
      else storage.unselectSensor(sensors[i].id)
    })
    stackPanel.addControl(circle)

    let rect = new GUI.Rectangle();
    rect.width = "250px"
    rect.height = "35px"
    rect.alpha = 0
    rect.background = "white"
    stackPanel.addControl(rect)
    let label = new GUI.TextBlock();
    label.text = sensors[i].name
    rect.addControl(label)
    //label.resizeToFit = true;
    //padding doesnt work when resizeToFit = true;
    //label.paddingRightInPixels = 20;
    //label.paddingLeftInPixels = 20;

    stackPanel.addControl(rect);
    stackPanel.adaptWidthToChildren = true;

    // stackPanel.linkWithMesh(mesh);

    sensorLabels[sensors[i].id] = {rect: rect, arrow: arrow, circle:circle, color: SENSOR_COLORS[sensors[i].id]};

    let myPlane = BABYLON.Mesh.CreatePlane('', 10, myScene);
    // let myPlane = BABYLON.Mesh.CreateSphere("sphere1", 16, 1, scene);
    // var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    // myMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1);
    // myPlane.material = myMaterial

    myPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    myPlane.position.copyFrom(mesh.getBoundingInfo().boundingSphere.centerWorld)
    // mesh.addChild(myPlane)
    myPlane.renderingGroupId = 1

    let advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(myPlane);
    // stackPanel.linkOffsetY = 30;

    advancedTexture.addControl(stackPanel);

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
}

export function turnArrow(sensorId, gradient){
  sensorLabels[sensorId].arrow.rotation = -Math.atan(gradient)
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
