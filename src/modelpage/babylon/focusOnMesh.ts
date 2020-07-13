import * as BABYLON from 'babylonjs'
import FloorCamera from './FloorCamera';
import { switchCamera } from './cameras';
import { ArcRotateCamera } from 'babylonjs';
import {eventBus} from "../../main";

/**
 * @author Lennard Grimm
 * Camera smoothly targets and moves to the passed Vector3 with a fixed distance.
 */
export async function focusOnMesh(scene: BABYLON.Scene, target: BABYLON.Vector3) {
    if (scene.activeCamera.name != "floorCam") {
        let arcCam = scene.activeCamera as ArcRotateCamera;
        let cam = scene.getCameraByName("floorCam") as FloorCamera;
        cam.position = arcCam.position.clone()
        cam.setTarget(arcCam.getTarget());
        arcCam.detachControl(document.getElementById("babyloncanvas"))
        cam.attachControl(document.getElementById("babyloncanvas"))
        scene.activeCamera = cam;
        eventBus.$emit("active-cam-change", "Free Move Camera")
    }
    let camera = scene.activeCamera as FloorCamera;
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

    let distanceFromMesh = 10;
    let direction = target.subtract(camera.position.clone())
    let distance = direction.length() - distanceFromMesh;
    direction.normalize();
    direction.scaleInPlace(distance);

    let targetWithDistance = camera.position.add(direction);
    targetWithDistance.y = Math.round(targetWithDistance.y);
    let currentTarget = camera.getTarget();

    let animateTarget = new BABYLON.Animation("anim1", "lockedTarget", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    let targetKeys = [];
    targetKeys.push({ frame: 0, value: currentTarget });
    targetKeys.push({ frame: 90, value: target });
    animateTarget.setKeys(targetKeys);
    animateTarget.setEasingFunction(ease);

    let animatePosition = new BABYLON.Animation("anim2", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    let positionKeys = [];
    positionKeys.push({ frame: 0, value: camera.position });
    positionKeys.push({ frame: 90, value: targetWithDistance });
    animatePosition.setKeys(positionKeys);
    animatePosition.setEasingFunction(ease);

    camera.animations = []; //clear animations
    camera.animations.push(animateTarget);
    camera.animations.push(animatePosition);

    let a = scene.beginAnimation(camera, 0, 90, false);
    a.onAnimationEnd = () => {
        camera.lockedTarget = undefined;
        camera.fixedY = camera.position.clone().y;
        //camera.fixedY = targetWithDistance.y;
    };
};