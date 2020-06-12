/**
 * @author Tom Wendland
 */
import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders';
import 'babylonjs-inspector';
import { createFloorCamera } from './cameras';
import setupSensorSelection from './sensorSelection';
import { loadModel } from './loadModel';
import CustomLoadingScreen from './loadingScreen';
import Storage from '../../storage/Storage';


export const IS_PRODUCTION: boolean = Boolean(process.env.PRODUCTION)  // its value is set in webpack.config.js

export default class BabylonApp {

    engine: BABYLON.Engine
    scene: BABYLON.Scene

    constructor(canvas: HTMLCanvasElement, modelID: number, STORE: Storage){
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        //this.scene.debugLayer.show();

        var loadingScreen = new CustomLoadingScreen(canvas, "");
        this.engine.loadingScreen = loadingScreen;
        this.engine.displayLoadingUI();

        var camera = createFloorCamera(canvas, this.engine, this.scene)
        this.scene.activeCamera = camera;

        //var light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1 ,0), this.scene);
        var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.diffuse = new BABYLON.Color3(1, 1, 1);
        light.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        light.intensity = 1.5;

        //var sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {segments:16, diameter:2}, this.scene);

        loadModel(modelID, this.scene, (meshes) => {
            this.scene.createDefaultEnvironment();
            setupSensorSelection(this.scene, modelID, meshes, STORE).then(() => {
                this.engine.hideLoadingUI();
            });
        }, !IS_PRODUCTION)

        // this.scene.onPointerUp = function(evt, pickResult) {
        //     if (pickResult.hit) {
        //         var normal = pickResult.getNormal(false, true)
        //         //this.clipPlane = new BABYLON.Plane(normal.x, normal.y, normal.z, 1);

        //         let pos = pickResult.pickedPoint;
        //         var lines = [];
        //         var line = [pos, pos.add(normal)];
        //         lines.push(line);
        //         var lineSystem = BABYLON.MeshBuilder.CreateLineSystem("ls", { lines: lines }, this);
        //         lineSystem.color = BABYLON.Color3.Red();
        //     }
        // };

        this.engine.runRenderLoop(() => {
            this.scene.render();
        })

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}
