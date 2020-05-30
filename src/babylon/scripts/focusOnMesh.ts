import * as BABYLON from 'babylonjs'
import FloorCamera from './floorCamera';

/**
 * @author Lennard Grimm
 * Camera smoothly targets and moves to the passed Vector3 with a fixed distance.
 */
export async function focusOnMesh(scene: BABYLON.Scene, target: BABYLON.Vector3) {
    let camera = scene.activeCamera as FloorCamera;
    let speed = 10;
    let frameRate = 30;
    var ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

    let distanceFromMesh = 5;
    let direction = target.subtract(camera.position.clone())
    let distance = direction.length() - distanceFromMesh;
    direction.normalize();
    direction.scaleInPlace(distance);

    let targetWithDistance = camera.position.add(direction);
    targetWithDistance.y = Math.round(targetWithDistance.y);
    let currentTarget = camera.getTarget();

    //BABYLON.Animation.CreateAndStartAnimation('anim1', camera, 'lockedTarget', speed, frameRate, currentTarget, target, 0, ease);
    //BABYLON.Animation.CreateAndStartAnimation('anim2', camera, 'position', speed, frameRate, camera.position, targetWithDistance, 0, ease);
    
    var animateTarget = new BABYLON.Animation("anim1", "lockedTarget", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var targetKeys = [];
    targetKeys.push({ frame: 0, value: currentTarget });
    targetKeys.push({ frame: 90, value: target });
    animateTarget.setKeys(targetKeys);
    animateTarget.setEasingFunction(ease);

    var animatePosition = new BABYLON.Animation("anim2", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    var positionKeys = [];
    positionKeys.push({ frame: 0, value: camera.position });
    positionKeys.push({ frame: 90, value: targetWithDistance });
    animatePosition.setKeys(positionKeys);
    animatePosition.setEasingFunction(ease);

    camera.animations.push(animateTarget);
    camera.animations.push(animatePosition);

    let a = scene.beginAnimation(camera, 0, 90, false);
    a.onAnimationEnd = () => {
        camera.lockedTarget = undefined;
        camera.fixedY = camera.position.clone().y;
        //camera.fixedY = targetWithDistance.y;
    };
};