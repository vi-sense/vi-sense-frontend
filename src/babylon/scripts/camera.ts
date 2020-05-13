/**
 * @author Tom Wendland
 */

import * as BABYLON from 'babylonjs'

/**
 * Prety simple and hacky FPS camera script locked to XZ-axis movement
 * Control building level respectively camera y position with Q and E keys
 * 
 * Better/way more elaborate: https://www.babylonjs-playground.com/#6PA720 with ICameraInput interface from https://doc.babylonjs.com/how_to/customizing_camera_inputs
 * 
 * @param canvas 
 * @param camera 
 */
export function createFloorCamera(canvas: HTMLCanvasElement, engine:BABYLON.Engine, scene: BABYLON.Scene): BABYLON.UniversalCamera{
    var fpsCamera = new BABYLON.UniversalCamera('camera1', new BABYLON.Vector3(0, 5, -15), this.scene);
    var cameraPositionY = fpsCamera.position.y

    fpsCamera.setTarget(new BABYLON.Vector3(0, cameraPositionY, 0));
    fpsCamera.attachControl(canvas, false);
    fpsCamera.keysUp.push(87); 
    fpsCamera.keysLeft.push(65);
    fpsCamera.keysRight.push(68);
    fpsCamera.keysDown.push(83);
    fpsCamera.speed = 0.6;
    fpsCamera.angularSensibility = 3000

    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, e => {	
        // In babylon version 4.2 (in alpha rn) we could do camera.keyDownwars and camera.keyUpwards							
        if(e.sourceEvent.keyCode == 69){                
            fpsCamera.position.y = cameraPositionY+=2
        }
        if(e.sourceEvent.keyCode == 81){
            fpsCamera.position.y = cameraPositionY-=2
        }
      })
    );

    engine.runRenderLoop(() => {
        fpsCamera.position.y = cameraPositionY
    })

    return fpsCamera
}


export function createArcCamera(canvas: HTMLCanvasElement, engine:BABYLON.Engine, scene: BABYLON.Scene) : BABYLON.ArcRotateCamera{
    var arcCamera = new BABYLON.ArcRotateCamera("Camera", 42, 0.8, 400, BABYLON.Vector3.Zero(), scene);
    arcCamera.attachControl(canvas, false);
    arcCamera.setTarget(new BABYLON.Vector3(0, 1, 0));
    arcCamera.radius = 5
    arcCamera.lowerRadiusLimit = 10
    arcCamera.upperRadiusLimit =  50 

    return arcCamera
}
