/**
 * @author Tom Wendland
 */
import * as BABYLON from 'babylonjs';
import * as MATS from 'babylonjs-materials';
import 'babylonjs-loaders';
import 'babylonjs-inspector';
import { createFloorCamera } from './scripts/camera';
import setupSensorSelection from './scripts/sensorSelection';
import { loadModel } from './scripts/loadModel';
import CustomLoadingScreen from './scripts/loadingScreen';
import Storage from '../storage/Storage';
import SKEYS from '../storage/StorageKeys';


export const IS_PRODUCTION: boolean = Boolean(process.env.PRODUCTION)  // its value is set in webpack.config.js

export default class BabylonApp {

    engine: BABYLON.Engine
    scene: BABYLON.Scene

    constructor(canvas: HTMLCanvasElement, modelID: number, STORE: Storage){
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        //this.scene.debugLayer.show();

        var loadingScreen = new CustomLoadingScreen(canvas, "Loading Model");
        this.engine.loadingScreen = loadingScreen;
        this.engine.displayLoadingUI();

        var camera = createFloorCamera(canvas, this.engine, this.scene)
        this.scene.activeCamera = camera;

        var light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1 ,0), this.scene);
        var sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {segments:16, diameter:2}, this.scene);

        loadModel(modelID, this.scene, (meshes) => {
            setupSensorSelection(this.scene, modelID, meshes, STORE);
            this.engine.hideLoadingUI();
        }, !IS_PRODUCTION)

        this.engine.runRenderLoop(() => {
            this.scene.render();
        })

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}
