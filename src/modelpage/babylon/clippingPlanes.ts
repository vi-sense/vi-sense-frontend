import * as BABYLON from 'babylonjs'

var myScene: BABYLON.Scene

var xClip: BABYLON.Plane
var yClip: BABYLON.Plane
var zClip: BABYLON.Plane

let skybox: BABYLON.Mesh
let ground: BABYLON.Mesh

export function setupClippingPlanes(scene: BABYLON.Scene) {
    myScene = scene;

    skybox = myScene.getNodeByName("BackgroundSkybox") as BABYLON.Mesh
    ground = myScene.getNodeByName("BackgroundPlane") as BABYLON.Mesh

    myScene.clipPlane = null;
    myScene.clipPlane2 = null;
    myScene.clipPlane3 = null;

    // exclude ground and skybox from clipping
    skybox.onBeforeRenderObservable.add(function () {
        myScene.clipPlane = null;
        myScene.clipPlane2 = null;
        myScene.clipPlane3 = null;
    });
    ground.onBeforeRenderObservable.add(function () {
        myScene.clipPlane = null;
        myScene.clipPlane2 = null;
        myScene.clipPlane3 = null;
    });

    skybox.onAfterRenderObservable.add(function () {
        if (xClip != null) myScene.clipPlane = xClip
        if (yClip != null) myScene.clipPlane2 = yClip
        if (zClip != null) myScene.clipPlane3 = zClip
    })
    ground.onAfterRenderObservable.add(function () {
        if (xClip != null) myScene.clipPlane = xClip
        if (yClip != null) myScene.clipPlane2 = yClip
        if (zClip != null) myScene.clipPlane3 = zClip
    })
}

export function changeClippingPlane(clippingPlane) {
    let axis = clippingPlane.axis.toLowerCase();
    let enabled: boolean = clippingPlane.enabled;
    let offset: number = parseInt(myScene.metadata.modelCenter[axis.toString()])

    let sliderValue: number = parseInt(clippingPlane.value);
    let flipped: boolean = clippingPlane.flipped;
    let value: number = flipped ? sliderValue + offset : sliderValue - offset;
    if(enabled) {
        let normal = flipped ? -1 : 1
        switch (axis) {
            case "x": xClip = new BABYLON.Plane(normal, 0, 0, value); break;
            case "y": yClip = new BABYLON.Plane(0, normal, 0, value); break;
            case "z": zClip = new BABYLON.Plane(0, 0, normal, value); break;
            default: break;
        }

    } else {
        disableClippingPlane(axis)
    }
}

function disableClippingPlane(axis) {
    switch (axis) {
        case "x": xClip = null; break;
        case "y": yClip = null; break;
        case "z": zClip = null; break;
        default: break;
    }
}