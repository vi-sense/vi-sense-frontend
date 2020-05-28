import * as BABYLON from 'babylonjs'

/**
 * @author Lennard Grimm
 * Camera smoothly targets and moves to the passed Vector3 with a fixed distance.
 */
export function focusOnMesh(camera: BABYLON.UniversalCamera, target: BABYLON.Vector3) {
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
    let currentTarget = camera.getTarget();
    BABYLON.Animation.CreateAndStartAnimation('anim1', camera, 'lockedTarget', speed, frameRate, currentTarget, target, 0, ease);
    BABYLON.Animation.CreateAndStartAnimation('anim2', camera, 'position', speed, frameRate, camera.position, targetWithDistance, 0, ease);

    // remove lockedTarget to freely move camera again afterwards
    // atm there is no callback for when the animations end, so for now its calculated based on animation speed and framerate - definitely not optimal
    setTimeout(() => {
        camera.lockedTarget = undefined;
        console.log(camera);
    }, speed * frameRate * 10 + 100)
};