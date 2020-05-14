import * as BABYLON from 'babylonjs'
import * as GUI from "babylonjs-gui";
import StateMachine from '../../statemachine/StateMachine';
import STATES from '../../statemachine/States';

const API_URL = process.env.API_URL;
const sensorColor = BABYLON.Color3.Purple();
const selectedSensorColor = BABYLON.Color3.Teal();

var myScene: BABYLON.Scene;
var stateMachine: StateMachine;

// stores all GUI Labels; a sensorLabel contains the container (rect) with its children [circle, label]
// uses the meshID as key, access like this: sensorLabels["node505"]
var sensorLabels = [];

// stores all fetched sensor data
// uses the meshID as key, access like this: sensorData["node505"]
var sensorData = [];
var selected;

/**
  * This is the callback function used for (de)selecting meshes via Vue or Babylon
  * Update the selection state of a mesh by passing its meshID (e.g. "node505")
  * Changes the color of the mesh, and the text displayed in the label
  */
export function updateSelectedSensor(meshID: string) {
  if (myScene) {
    // deselect previously selected mesh
    if(selected) {
      let mesh = myScene.getMeshByName(selected);
      mesh.state = "";
      let mat = mesh.material as BABYLON.PBRMaterial;
      mat.albedoColor = sensorColor;
      sensorLabels[mesh.name].background = "";
      sensorLabels[mesh.name].children[1].text = "";
    }
    // select mesh with passed meshID
    if (meshID) {
      let mesh = myScene.getMeshByName(meshID);
      mesh.state = "selected";
      let mat = mesh.material as BABYLON.PBRMaterial;
      mat.albedoColor = selectedSensorColor;
      sensorLabels[meshID].background = "white";
      let text = sensorData[meshID].Name + "\n" + sensorData[meshID].Data[sensorData[meshID].Data.length - 1].Value.toString() + sensorData[meshID].MeasurementUnit;
      sensorLabels[meshID].children[1].text = text;
    }
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


/**
  * This function handles the setup of basic sensor selection.
  * It instantiates GUI elements for all available sensors and adds Observables to them and their respective meshes.
  */
export default async function setupSensorSelection(scene: BABYLON.Scene, modelID: number, modelMeshes, SM: StateMachine) {
  myScene = scene;
  stateMachine = SM;

  // GET MODEL DATA
  let model = await getModelData(modelID);
  let sensors = model.Sensors;
  console.log(sensors);

  for (let i = 0; i < sensors.length; i++) {
    // CURRENT MESH, all selectable meshes are colored purple
    let mesh = scene.getMeshByName(sensors[i].MeshID);
    let mat = mesh.material as BABYLON.PBRMaterial;
    mat.albedoColor = sensorColor;

    // GET SENSORDATA
    let data = await getSensorData(sensors[i].ID);
    sensorData[sensors[i].MeshID] = data;

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
        selected = stateMachine.get(STATES.SELECTED_SENSOR)
        stateMachine.set(STATES.SELECTED_SENSOR, sensors[i].MeshID)
      } else {
        selected = stateMachine.get(STATES.SELECTED_SENSOR)
        stateMachine.set(STATES.SELECTED_SENSOR, null)
      }
    })
    sensorLabels[sensors[i].MeshID] = rect;
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
            selected = stateMachine.get(STATES.SELECTED_SENSOR)
            stateMachine.set(STATES.SELECTED_SENSOR, sensors[i].MeshID)
          } else {
            // delselect mesh
            selected = stateMachine.get(STATES.SELECTED_SENSOR)
            stateMachine.set(STATES.SELECTED_SENSOR, null)
          }
        }));

    // on hover enter, change color to teal
    mesh.actionManager.registerAction(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        mesh.material,
        'albedoColor',
        selectedSensorColor,
        200
      ));

    // on hover leave, change color back to purple if mesh is not selected
    mesh.actionManager.registerAction(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        mesh.material,
        'albedoColor',
        sensorColor,
        200,
        new BABYLON.PredicateCondition(
          mesh.actionManager as BABYLON.ActionManager,
          function() {
            return mesh.state !== "selected";
          }
        )
      ));
  }
}
