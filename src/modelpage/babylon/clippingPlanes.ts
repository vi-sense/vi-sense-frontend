import * as BABYLON from 'babylonjs'

var myScene: BABYLON.Scene

export function setupClippingPlanes(scene: BABYLON.Scene) {
    myScene = scene;
    myScene.clipPlane = null;
    myScene.clipPlane2 = null;
    myScene.clipPlane3 = null;
}

export function changeClippingPlane(enabled: boolean, axis: string, sliderValue: number, flipped: boolean) {
    // exclude ground and skybox from clipping
    let skybox: BABYLON.Mesh = myScene.getNodeByName("BackgroundSkybox") as BABYLON.Mesh
    let ground: BABYLON.Mesh = myScene.getNodeByName("BackgroundPlane") as BABYLON.Mesh
    if(enabled) {
        skybox.onBeforeBindObservable.add(function () {
            disableClippingPlane(axis)
        });
        ground.onBeforeBindObservable.add(function () {
            disableClippingPlane(axis)
        });
        skybox.onAfterRenderObservable.add(function () {
            let normal;
            flipped ? normal = -1 : normal = 1
            switch (axis) {
                case "x": myScene.clipPlane = new BABYLON.Plane(normal, 0, 0, sliderValue); break;
                case "y": myScene.clipPlane2 = new BABYLON.Plane(0, normal, 0, sliderValue); break;
                case "z": myScene.clipPlane3 = new BABYLON.Plane(0, 0, normal, sliderValue); break;
                default: break;
            }
        })
        ground.onAfterRenderObservable.add(function () {
            let normal;
            flipped ? normal = -1 : normal = 1
            switch (axis) {
                case "x": myScene.clipPlane = new BABYLON.Plane(normal, 0, 0, sliderValue); break;
                case "y": myScene.clipPlane2 = new BABYLON.Plane(0, normal, 0, sliderValue); break;
                case "z": myScene.clipPlane3 = new BABYLON.Plane(0, 0, normal, sliderValue); break;
                default: break;
            }
        })
    } else {
        disableClippingPlane(axis)
    }
}

function disableClippingPlane(axis) {
    switch (axis) {
        case "x": myScene.clipPlane = null; break;
        case "y": myScene.clipPlane2 = null; break;
        case "z": myScene.clipPlane3 = null; break;
        default: break;
    }
}