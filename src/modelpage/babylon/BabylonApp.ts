/**
 * @author Tom Wendland
 */
import * as BABYLON from 'babylonjs'
import 'babylonjs-loaders';
import 'babylonjs-inspector';
import { createFloorCamera, createArcCamera, createMinimapCamera } from './cameras';
import setupSensorSelection from './sensorSelection';
import { setupClippingPlanes } from "./clippingPlanes";
import { loadModel } from './loadModel';
import Storage from '../../storage/Storage';
import { eventBus } from "../../main.js";


export const IS_PRODUCTION: boolean = Boolean(process.env.PRODUCTION)  // its value is set in webpack.config.js

export default class BabylonApp {

    engine: BABYLON.Engine
    scene: BABYLON.Scene

    constructor(canvas: HTMLCanvasElement, modelID: number, STORE: Storage) {
        this.engine = new BABYLON.Engine(canvas, true);
        this.scene = new BABYLON.Scene(this.engine);
        //this.scene.debugLayer.show();

        var camera = createFloorCamera(canvas, this.engine, this.scene)
        var arc = createArcCamera(canvas, this.engine, this.scene, STORE)
        //var minimap = createMinimapCamera(this.engine, camera)

        this.scene.activeCamera = arc;
        //this.scene.activeCameras.push(minimap);
        //this.scene.cameraToUseForPointers = camera;
        
        var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), this.scene);
        light.diffuse = new BABYLON.Color3(1, 1, 1);
        light.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        light.intensity = 1.5;

        try {
            loadModel(modelID, this.scene, (meshes) => {
                this.scene.createDefaultEnvironment();
                let minV3 = new BABYLON.Vector3();
                let maxV3 = new BABYLON.Vector3();

                let outerMax = new BABYLON.Vector3();
                meshes.forEach(mesh=>{
                    mesh.isPickable=false
                    mesh.freezeWorldMatrix()
                    mesh.renderingGroupId = 2;
                    
                    let max = mesh.getBoundingInfo().boundingBox.maximum
                    let min = mesh.getBoundingInfo().boundingBox.minimum
                    //get outer most bounding vectors of a model
                    if (Math.ceil(Math.abs(min.x)) > outerMax.x) outerMax.x = Math.ceil(Math.abs(min.x))
                    if (Math.ceil(Math.abs(min.y)) > outerMax.y) outerMax.y = Math.ceil(Math.abs(min.y))
                    if (Math.ceil(Math.abs(min.z)) > outerMax.z) outerMax.z = Math.ceil(Math.abs(min.z))
                    if (Math.ceil(Math.abs(max.x)) > outerMax.x) outerMax.x = Math.ceil(Math.abs(max.x))
                    if (Math.ceil(Math.abs(max.y)) > outerMax.y) outerMax.y = Math.ceil(Math.abs(max.y))
                    if (Math.ceil(Math.abs(max.z)) > outerMax.z) outerMax.z = Math.ceil(Math.abs(max.z))

                    let v = mesh.getBoundingInfo().boundingSphere.centerWorld
                    //average the center vector of a model
                    if (v.x < minV3.x) minV3.x = v.x;
                    if (v.y < minV3.y) minV3.y = v.y;
                    if (v.z < minV3.z) minV3.z = v.z;
                    if (v.x > maxV3.x) maxV3.x = v.x;
                    if (v.y > maxV3.y) maxV3.y = v.y;
                    if (v.z > maxV3.z) maxV3.z = v.z;
                })
                let center = BABYLON.Vector3.Center(minV3, maxV3);
                this.scene.metadata = { modelCenter: center }
                arc.setTarget(center)

                eventBus.$emit("bounding-box-defined", outerMax)
                setupClippingPlanes(this.scene);

                setupSensorSelection(this.scene, modelID, meshes, STORE).then(() => {
                    eventBus.$emit("loading-finished")
                });
            }, !IS_PRODUCTION)
        } catch (e) {
            console.log(e)
            eventBus.$emit("loading-failed")
        }

        /*
        this.scene.onPointerUp = function (evt, pickResult) {
            if (pickResult.hit) {
                var normal = pickResult.getNormal(true, false)
                let origin = new BABYLON.Vector3()
                //this.clipPlane = new BABYLON.Plane(normal.x, normal.y, normal.z, origin.subtract(normal.clone()).length());

                let pos = pickResult.pickedPoint;
                var lines = [];
                var line = [pos, pos.add(normal)];
                lines.push(line);
                var lineSystem = BABYLON.MeshBuilder.CreateLineSystem("ls", { lines: lines }, this);
                lineSystem.color = BABYLON.Color3.Red();
            };
        }
        
        */
        this.engine.runRenderLoop(() => {
            this.scene.render();
        })

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}
