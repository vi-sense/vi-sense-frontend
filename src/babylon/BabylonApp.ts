/**
 * @author Tom Wendland
 */

import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders';
import 'babylonjs-inspector';
import setupCamera from './scripts/camera';
import sensorSelectionScript from './scripts/sensorSelection';
import { loadModel } from './scripts/loadModel';


export const IS_PRODUCTION: boolean = process.env.NODE_ENV === 'production' // its value is set in webpack.config.js

export default class BabylonApp {

    engine: BABYLON.Engine
    scene: BABYLON.Scene

    constructor(canvas: HTMLCanvasElement, modelID: number){

        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        //this.scene.debugLayer.show();

        var light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1 ,0), this.scene);
        var sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {segments:16, diameter:2}, this.scene);

        setupCamera(canvas, this.engine, this.scene)

        loadModel(modelID, this.scene, (meshes) => {
            sensorSelectionScript(this.scene, modelID, meshes)
        }, !IS_PRODUCTION)

        this.engine.runRenderLoop(() => {
            this.scene.render();
        })

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}
