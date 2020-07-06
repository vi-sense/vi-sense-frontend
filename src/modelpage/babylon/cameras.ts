/**
 * @author Tom Wendland
 */

import * as BABYLON from 'babylonjs';
import FloorCamera from './FloorCamera';
import Storage from '../../storage/Storage';


var myScene: BABYLON.Scene;
var myStorage: Storage;

const EASE = new BABYLON.CubicEase();
EASE.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
/**
 * Prety simple and hacky FPS camera script locked to XZ-axis movement
 * Control building level respectively camera y position with Q and E keys
 * 
 * Better/way more elaborate: https://www.babylonjs-playground.com/#6PA720 with ICameraInput interface from https://doc.babylonjs.com/how_to/customizing_camera_inputs
 * 
 * @param canvas
 * @param camera
 */
export function createFloorCamera(canvas: HTMLCanvasElement, engine:BABYLON.Engine, scene: BABYLON.Scene): BABYLON.UniversalCamera {
    var cam = new FloorCamera('floorCam', new BABYLON.Vector3(0, 5, -15), this.scene);

    cam.setTarget(new BABYLON.Vector3(0, cam.fixedY, 0));
    cam.attachControl(canvas, false);
    cam.keysUp.push(87); 
    cam.keysLeft.push(65);
    cam.keysRight.push(68);
    cam.keysDown.push(83);
    
    cam.keysUp.push(38);
    cam.keysLeft.push(37);
    cam.keysRight.push(39);
    cam.keysDown.push(40);

    cam.speed = 0.6;
    cam.angularSensibility = 3000;

    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, e => {	
        // In babylon version 4.2 (in alpha rn) we could do camera.keyDownwars and camera.keyUpwards						
        if(e.sourceEvent.keyCode == 69){                
            cam.position.y = cam.fixedY += cam.step
        }
        if(e.sourceEvent.keyCode == 81){
            cam.position.y = cam.fixedY -= cam.step
        }
      })
    );

    engine.runRenderLoop(() => {
        cam.position.y = cam.fixedY
    })

    return cam
}


export function createArcCamera(canvas: HTMLCanvasElement, engine:BABYLON.Engine, scene: BABYLON.Scene, storage: Storage) : BABYLON.ArcRotateCamera {
    myScene = scene;
    myStorage = storage;
    var arcCamera = new BABYLON.ArcRotateCamera("arcCam", 42, 0.8, 400, BABYLON.Vector3.Zero(), scene);
    arcCamera.attachControl(canvas, false);
    arcCamera.setTarget(new BABYLON.Vector3(0,1,0));
    arcCamera.radius = 25
    arcCamera.lowerRadiusLimit = 5
    arcCamera.upperRadiusLimit = 150
    arcCamera.wheelPrecision = 100

    storage.onSensorSelectionChanged(() => {
        if(myScene.activeCamera == arcCamera) {
            let arcCam = myScene.activeCamera as BABYLON.ArcRotateCamera;
            let newTarget = getArcCameraTarget()
            let targetAnimation = new BABYLON.Animation("anim1", "target", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            targetAnimation.setKeys([{ frame: 0, value: arcCam.getTarget()}, { frame: 15, value: newTarget }]);
            targetAnimation.setEasingFunction(EASE)
            arcCam.animations = [] //clear animations
            arcCam.animations.push(targetAnimation)
            let targetAnimationRun = myScene.beginAnimation(arcCam, 0, 15, false);
        }
    })

    return arcCamera
}

export function createMinimapCamera(engine: BABYLON.Engine, mainCam): BABYLON.UniversalCamera {
    let p = mainCam.position.clone()
    let mm = new FloorCamera('minimapCam', new BABYLON.Vector3(p.x, p.y + 20, p.z), this.scene);
    mm.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    mm.orthoLeft = -20;
    mm.orthoRight = 20;
    mm.orthoTop = 20;
    mm.orthoBottom = -20;
    mm.rotation.x = Math.PI / 2;
    mm.setTarget(mainCam.position);
    mm.viewport = new BABYLON.Viewport(0, 0.8, .20, .20);

    engine.runRenderLoop(() => {
        mm.position = mainCam.position.clone();
        mm.position.y = mm.fixedY;
        mm.rotation.y = mainCam.rotation.y;
    })

    return mm;
}

export function changeFOV(value: number) {
    myScene.activeCamera.fov = value/100
}

export function changeCameraClipping(value) {
    myScene.activeCamera.maxZ = value
}

export async function switchCamera() {
    if (myScene.activeCamera.name == "floorCam") {
        let floorCam = myScene.activeCamera as FloorCamera;
        let arcCam = myScene.getCameraByName("arcCam") as BABYLON.ArcRotateCamera;

        floorCam.detachControl(document.getElementById("babyloncanvas"))
        arcCam.attachControl(document.getElementById("babyloncanvas"))

        let newTarget = getArcCameraTarget()

        let targetAnimation = new BABYLON.Animation("anim1", "lockedTarget", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        targetAnimation.setKeys([{ frame: 0, value: floorCam.getTarget()}, { frame: 30, value: newTarget }]);
        targetAnimation.setEasingFunction(EASE)

        floorCam.animations = [] //clear animations
        floorCam.animations.push(targetAnimation)

        let targetAnimationRun = myScene.beginAnimation(floorCam, 0, 30, false);

        await targetAnimationRun.waitAsync()

        floorCam.lockedTarget = undefined

        arcCam.position = floorCam.position.clone()
        arcCam.setTarget(newTarget)
        arcCam.fov = floorCam.fov;
        arcCam.minZ = floorCam.minZ;
        arcCam.maxZ = floorCam.maxZ;
        myScene.activeCamera = arcCam;

    }
    else if (myScene.activeCamera.name == "arcCam") {
        let active = myScene.activeCamera as BABYLON.ArcRotateCamera;
        active.lowerRadiusLimit = 3

        let animateRadius = new BABYLON.Animation("anim3", "radius", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        let radiusKeys = [];
        radiusKeys.push({ frame: 0, value: active.radius });
        radiusKeys.push({ frame: 30, value: 10 });
        animateRadius.setKeys(radiusKeys);
        animateRadius.setEasingFunction(EASE);
        active.animations.push(animateRadius);
        let a = myScene.beginAnimation(active, 0, 30, false);

        a.onAnimationEnd = () => {
            let cam = myScene.getCameraByName("floorCam") as FloorCamera;

            active.detachControl(document.getElementById("babyloncanvas"))
            cam.attachControl(document.getElementById("babyloncanvas"))
            cam.cameraRotation = new BABYLON.Vector2(0,0)

            cam.position = active.position.clone()
            cam.fixedY = cam.position.clone().y;
            cam.setTarget(getArcCameraTarget());
            cam.fov = active.fov;
            cam.minZ = active.minZ;
            cam.maxZ = active.maxZ;
            myScene.activeCamera = cam;
        };
    }
}

function getArcCameraTarget() {
    let sensor_ids = myStorage.getSelectedSensors()
    if (sensor_ids.length == 0) return myScene.metadata.modelCenter;
    if (sensor_ids.length == 1) return myScene.getMeshByUniqueID(myScene.metadata.savedSensors[sensor_ids[0]].mesh_id).getBoundingInfo().boundingSphere.centerWorld;
    if (sensor_ids.length == 2) {
        let v1 = myScene.getMeshByUniqueID(myScene.metadata.savedSensors[sensor_ids[0]].mesh_id).getBoundingInfo().boundingSphere.centerWorld
        let v2 = myScene.getMeshByUniqueID(myScene.metadata.savedSensors[sensor_ids[1]].mesh_id).getBoundingInfo().boundingSphere.centerWorld
        return BABYLON.Vector3.Center(v1, v2);
    }
    if (sensor_ids.length > 2) {
        let myX = 0;
        let myY = 0;
        let myZ = 0;
        for (let i = 0; i < sensor_ids.length; i++) {
            let mesh = myScene.getMeshByUniqueID(myScene.metadata.savedSensors[sensor_ids[i]].mesh_id)
            let v = mesh.getBoundingInfo().boundingSphere.centerWorld
            myX += v.x
            myY += v.y
            myZ += v.z
        }
        return new BABYLON.Vector3(myX / sensor_ids.length, myY / sensor_ids.length, myZ / sensor_ids.length);
    }
}