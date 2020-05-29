import * as BABYLON from 'babylonjs';

export default class FloorCamera extends BABYLON.UniversalCamera {
    public fixedY: number;

    /**
     * @param name Define the name of the camera in the scene
     * @param position Define the start position of the camera in the scene
     * @param scene Define the scene the camera belongs to
     */
    constructor(name: string, position: BABYLON.Vector3, scene: BABYLON.Scene) {
        super(name, position, scene);
        this.fixedY = position.y;
    };
}