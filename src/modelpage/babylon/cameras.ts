/**
 * @author Tom Wendland
 */

import * as BABYLON from 'babylonjs';
import FloorCamera from './FloorCamera';

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
    let cam = new FloorCamera('floorCam', new BABYLON.Vector3(0, 5, -15), this.scene);

    cam.setTarget(new BABYLON.Vector3(0, cam.fixedY, 0));
    cam.attachControl(canvas, true);
    cam.keysUp.push(87); 
    cam.keysLeft.push(65);
    cam.keysRight.push(68);
    cam.keysDown.push(83);
    cam.speed = 0.6;
    //cam.minZ = 5;
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
        if (e.sourceEvent.keyCode == 173) {
            cam.fov += 0.1
        }
        if (e.sourceEvent.keyCode == 171) {
            cam.fov -= 0.1
        }
      })
    );
    engine.runRenderLoop(() => {
        cam.position.y = cam.fixedY
    })

    return cam
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
    mm.viewport = new BABYLON.Viewport(0, 0, .25, .25);

    engine.runRenderLoop(() => {
        mm.position = mainCam.position.clone();
        mm.position.y = mm.fixedY;
        mm.rotation.y = mainCam.rotation.y;
    })

    return mm;
}


export function createArcCamera(canvas: HTMLCanvasElement, engine:BABYLON.Engine, scene: BABYLON.Scene) : BABYLON.ArcRotateCamera {
    let arcCamera = new BABYLON.ArcRotateCamera("arcCam", 42, 0.8, 400, BABYLON.Vector3.Zero(), scene);
    arcCamera.attachControl(canvas, false);
    arcCamera.setTarget(new BABYLON.Vector3(0, 1, 0));
    arcCamera.radius = 5
    arcCamera.lowerRadiusLimit = 10
    arcCamera.upperRadiusLimit =  50 

    return arcCamera
}
