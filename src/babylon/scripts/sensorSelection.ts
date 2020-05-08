import * as BABYLON from 'babylonjs'
import * as GUI from "babylonjs-gui";


async function getModel(id: number) {
  let response = await fetch("http://visense.f4.htw-berlin.de:8080/models/" + id)
    .then(res => { return res.json() })
    .catch(err => { throw new Error("Can not load model data") });
  return response;
}

export default async function sensorSelectionScript(scene: BABYLON.Scene, modelID, modelMeshes) {
  // GET MODEL
  let model = await getModel(modelID);
  let sensors = model.Sensors;

  // save label containers for later reference
  // sensorLabel is the container (rect) with its children [circle, label]
  let sensorLabels = [];

  for (let i = 0; i < sensors.length; i++) {
    // CURRENT MESH, all selectable meshes are colored purple
    let mesh = scene.getMeshByName(sensors[i].MeshID);
    let mat = mesh.material as BABYLON.PBRMaterial;
    mat.albedoColor = BABYLON.Color3.Purple();

    // GET SENSORDATA
    let sensorData = await fetch("http://visense.f4.htw-berlin.de:8080/sensors/" + sensors[i].ID)
      .then(res => { return res.json() })
      .catch(err => { throw new Error("Can not load sensor data") });
    let sensorLabelText = "Name: " + sensorData.Name + "\nDescription: " + sensorData.Description + "\nValue: " + sensorData.Data[sensorData.Data.length - 1].Value.toString() + sensorData.MeasurementUnit;

    // GUI SETUP
    let advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    let rect = new GUI.Rectangle();
    rect.thickness = 0;
    rect.adaptHeightToChildren = true;
    rect.adaptWidthToChildren = true;
    rect.isPointerBlocker = true;
    rect.isVisible = true;
    advancedTexture.addControl(rect);

    let circle = new GUI.Ellipse();
    circle.width = "70px";
    circle.height = "70px";
    circle.alpha = 0.8;
    circle.background = "white";
    circle.thickness = 2;
    circle.isVisible = true;
    rect.addControl(circle);

    let label = new GUI.TextBlock();
    //label.textWrapping = true;
    label.resizeToFit = true;
    label.paddingRightInPixels = 20;
    label.paddingLeftInPixels = 20;
    label.widthInPixels = rect.widthInPixels - 10;
    label.heightInPixels = rect.heightInPixels - 10;
    label.onTextChangedObservable.add(function(evt, picked) {
      //evt.parent.widthInPixels = evt.parent.widthInPixels + 50;
    })

    // select mesh on label click
    rect.onPointerDownObservable.add(function(e, p) {
      if (mesh.state == "") {
        let mat = mesh.material as BABYLON.PBRMaterial;
        mat.albedoColor = BABYLON.Color3.Teal();
        mesh.state = "selected";
        p.currentTarget.background = "white";
        sensorLabels[i].children[1].text = sensorLabelText;
      } else {
        let mat = mesh.material as BABYLON.PBRMaterial;
        mat.albedoColor = BABYLON.Color3.Purple();
        mesh.state = ""
        p.currentTarget.background = "";
        sensorLabels[i].children[1].text = ""
      }
    })
    sensorLabels.push(rect);
    rect.addControl(label);
    rect.linkWithMesh(mesh);

    // REGISTER MESH ACTIONS
    mesh.actionManager = new BABYLON.ActionManager(scene);
    // change mesh color on click, change state, display sensor data
    mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickTrigger, async function(e) {
          if (e.source.state === "selected") {
            e.source.state = "";
            e.source.material.albedoColor = BABYLON.Color3.Purple();
            sensorLabels[i].background = "";
            sensorLabels[i].children[1].text = "";
          } else {
            // SHOW RECTANGLE, UPDATE LABEL TEXT
            sensorLabels[i].background = "white";
            sensorLabels[i].children[1].text = sensorLabelText;
            e.source.state = "selected";
            e.source.material.albedoColor = BABYLON.Color3.Teal();
          }
        }));

    // on hover enter, change color to teal
    mesh.actionManager.registerAction(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        mesh.material,
        'albedoColor',
        BABYLON.Color3.Teal(),
        200
      ));

    // on hover leave, change color back to purple if mesh is not selected
    mesh.actionManager.registerAction(
      new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        mesh.material,
        'albedoColor',
        BABYLON.Color3.Purple(),
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
