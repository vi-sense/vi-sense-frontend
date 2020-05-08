import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders';
import 'babylonjs-inspector';
import setupCamera from './scripts/camera';
import sensorSelectionScript from './scripts/sensorSelection';
import { loadModel } from './scripts/loadModel';

export default class BabylonApp {

    engine: BABYLON.Engine
    scene: BABYLON.Scene

    constructor(canvas: HTMLCanvasElement, modelID: number, production: boolean){

        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        //this.scene.debugLayer.show();

        setupCamera(canvas, this.engine, this.scene)

        var light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1 ,0), this.scene);
        var ground = BABYLON.MeshBuilder.CreateGround('ground', {height:6, width:6, subdivisions: 2}, this.scene);
        var sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {segments:16, diameter:2}, this.scene);
        sphere.position.y = 1;


        loadModel(modelID, this.scene, (meshes) => {
            sensorSelectionScript(this.scene, modelID, meshes)
        }, production)

        this.engine.runRenderLoop(() => {
            this.scene.render();
        })

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}
