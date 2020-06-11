/**
 * @author Tom Wendland
 */
import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders';
import 'babylonjs-inspector';
import { createFloorCamera, createMinimapCamera } from './cameras';
import setupSensorSelection from './sensorSelection';
import { loadModel } from './loadModel';
import CustomLoadingScreen from './loadingScreen';
import Storage from '../../storage/Storage';


export const IS_PRODUCTION: boolean = Boolean(process.env.PRODUCTION)  // its value is set in webpack.config.js

export default class BabylonApp {

    engine: BABYLON.Engine
    scene: BABYLON.Scene

    constructor(canvas: HTMLCanvasElement, minimapCanvas: HTMLCanvasElement, modelID: number, STORE: Storage) {
        //var c = document.createElement("canvas");
        this.engine = new BABYLON.Engine(canvas, true, { stencil: true });
        this.engine.inputElement = canvas;

        this.scene = new BABYLON.Scene(this.engine);
        //this.scene.debugLayer.show();

        var loadingScreen = new CustomLoadingScreen(canvas, "");
        this.engine.loadingScreen = loadingScreen;
        this.engine.displayLoadingUI();

        var camera = createFloorCamera(canvas, this.engine, this.scene)
        var minimap = createMinimapCamera(this.engine, camera)
        
        //this.scene.activeCamera = camera
        this.scene.activeCameras.push(camera)
        this.scene.activeCameras.push(minimap)
        
        this.scene.cameraToUseForPointers = camera;
        //this.engine.registerView(minimapCanvas, minimap);
        //this.engine.registerView(canvas, camera);
        
        
        var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.diffuse = new BABYLON.Color3(1, 1, 1);
        light.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        light.intensity = 1.5;

        loadModel(modelID, this.scene, (meshes) => {
            this.scene.createDefaultEnvironment();
            setupSensorSelection(this.scene, modelID, meshes, STORE).then(() => {
                this.engine.hideLoadingUI();
            });
        }, !IS_PRODUCTION)

        this.engine.runRenderLoop(() => {
            this.scene.render();
        })

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}
