import * as BABYLON from 'babylonjs';

export class PulseShader extends BABYLON.NodeMaterial {
    constructor(waveSpeed: number, waveLength: number, waveHeight: number) {
        super("node")

        // InputBlock
        var position = new BABYLON.InputBlock("position");
        position.setAsAttribute("position");

        // TransformBlock
        var worldPos = new BABYLON.TransformBlock("worldPos");
        worldPos.complementZ = 0;
        worldPos.complementW = 1;

        // InputBlock
        var world = new BABYLON.InputBlock("world");
        world.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);

        // TransformBlock
        var Worldnormal = new BABYLON.TransformBlock("World normal");
        Worldnormal.complementZ = 0;
        Worldnormal.complementW = 0;

        // InputBlock
        var normal = new BABYLON.InputBlock("normal");
        normal.setAsAttribute("normal");

        // LightBlock
        var Lights = new BABYLON.LightBlock("Lights");

        // InputBlock
        var cameraPosition = new BABYLON.InputBlock("cameraPosition");
        cameraPosition.setAsSystemValue(BABYLON.NodeMaterialSystemValues.CameraPosition);

        // MultiplyBlock
        var Multiply = new BABYLON.MultiplyBlock("Multiply");

        // ColorMergerBlock
        var ColorMerger = new BABYLON.ColorMergerBlock("ColorMerger");

        // OneMinusBlock
        var Oneminus = new BABYLON.OneMinusBlock("One minus");

        // AddBlock
        var Add = new BABYLON.AddBlock("Add");

        // MultiplyBlock
        var Multiply1 = new BABYLON.MultiplyBlock("Multiply");

        // TrigonometryBlock
        var Sin = new BABYLON.TrigonometryBlock("Sin");
        Sin.operation = BABYLON.TrigonometryBlockOperations.Sin;

        // MultiplyBlock
        var Multiply2 = new BABYLON.MultiplyBlock("Multiply");

        // InputBlock
        var Time = new BABYLON.InputBlock("Time");
        Time.value = 0;
        Time.min = 0;
        Time.max = 0;
        Time.isBoolean = false;
        Time.matrixMode = 0;
        Time.animationType = BABYLON.AnimatedInputBlockTypes.Time;
        Time.isConstant = false;
        Time.visibleInInspector = false;

        // InputBlock
        var speed = new BABYLON.InputBlock("speed");
        speed.value = waveSpeed;
        speed.isBoolean = false;
        speed.matrixMode = 0;
        speed.animationType = BABYLON.AnimatedInputBlockTypes.None;
        speed.isConstant = false;
        speed.visibleInInspector = false;

        // InputBlock
        var length = new BABYLON.InputBlock("length");
        length.value = waveLength;
        length.isBoolean = false;
        length.matrixMode = 0;
        length.animationType = BABYLON.AnimatedInputBlockTypes.None;
        length.isConstant = false;
        length.visibleInInspector = false;

        // InputBlock
        var height = new BABYLON.InputBlock("height");
        height.value = waveHeight;
        height.isBoolean = false;
        height.matrixMode = 0;
        height.animationType = BABYLON.AnimatedInputBlockTypes.None;
        height.isConstant = false;
        height.visibleInInspector = false;

        // FragmentOutputBlock
        var fragmentOutput = new BABYLON.FragmentOutputBlock("fragmentOutput");

        // TransformBlock
        var worldPosviewProjectionTransform = new BABYLON.TransformBlock("worldPos * viewProjectionTransform");
        worldPosviewProjectionTransform.complementZ = 0;
        worldPosviewProjectionTransform.complementW = 1;

        // InputBlock
        var viewProjection = new BABYLON.InputBlock("viewProjection");
        viewProjection.setAsSystemValue(BABYLON.NodeMaterialSystemValues.ViewProjection);

        // VertexOutputBlock
        var vertexOutput = new BABYLON.VertexOutputBlock("vertexOutput");

        // Connections
        position.output.connectTo(worldPos.vector);
        world.output.connectTo(worldPos.transform);
        worldPos.output.connectTo(worldPosviewProjectionTransform.vector);
        viewProjection.output.connectTo(worldPosviewProjectionTransform.transform);
        worldPosviewProjectionTransform.output.connectTo(vertexOutput.vector);
        worldPos.output.connectTo(Lights.worldPosition);
        normal.output.connectTo(Worldnormal.vector);
        world.output.connectTo(Worldnormal.transform);
        Worldnormal.output.connectTo(Lights.worldNormal);
        cameraPosition.output.connectTo(Lights.cameraPosition);
        Lights.diffuseOutput.connectTo(Multiply.left);
        Time.output.connectTo(Multiply2.left);
        speed.output.connectTo(Multiply2.right);
        Multiply2.output.connectTo(Sin.input);
        Sin.output.connectTo(Multiply1.left);
        length.output.connectTo(Multiply1.right);
        Multiply1.output.connectTo(Add.left);
        height.output.connectTo(Add.right);
        Add.output.connectTo(Oneminus.input);
        Oneminus.output.connectTo(ColorMerger.r);
        Add.output.connectTo(ColorMerger.b);
        ColorMerger.rgb.connectTo(Multiply.right);
        Multiply.output.connectTo(fragmentOutput.rgb);

        // Output nodes
        this.addOutputNode(vertexOutput);
        this.addOutputNode(fragmentOutput);
        this.build();

        return this;
    }
}




export class GradientShader extends BABYLON.NodeMaterial {
    constructor(inputMin: number, inputMax: number, currentValue: number) {
        super("node");

        // InputBlock
        let position = new BABYLON.InputBlock("position");
        position.setAsAttribute("position");

        // TransformBlock
        let WorldPos = new BABYLON.TransformBlock("WorldPos");
        WorldPos.complementZ = 0;
        WorldPos.complementW = 1;

        // InputBlock
        let World = new BABYLON.InputBlock("World");
        World.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);

        // TransformBlock
        let Transform = new BABYLON.TransformBlock("Transform");
        Transform.complementZ = 0;
        Transform.complementW = 0;

        // InputBlock
        let normal = new BABYLON.InputBlock("normal");
        normal.setAsAttribute("normal");

        // LightBlock
        let Lights = new BABYLON.LightBlock("Lights");

        // InputBlock
        let cameraPosition = new BABYLON.InputBlock("cameraPosition");
        cameraPosition.setAsSystemValue(BABYLON.NodeMaterialSystemValues.CameraPosition);

        // MultiplyBlock
        let Multiply = new BABYLON.MultiplyBlock("Multiply");

        // GradientBlock
        let Gradient = new BABYLON.GradientBlock("Gradient");
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0, new BABYLON.Color3(0.00392156862745098, 0.4, 1)));
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.5, new BABYLON.Color3(0.6705882352941176, 0.6705882352941176, 0.6862745098039216)));
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(1, new BABYLON.Color3(1, 0, 0.19215686274509805)));

        // RemapBlock
        let Remap = new BABYLON.RemapBlock("Remap");
        Remap.sourceRange = new BABYLON.Vector2(-1, 1);
        Remap.targetRange = new BABYLON.Vector2(0, 1);

        // InputBlock
        let InputTemperature = new BABYLON.InputBlock("Input Temperature");
        InputTemperature.value = currentValue;
        InputTemperature.isBoolean = false;
        InputTemperature.matrixMode = 0;
        InputTemperature.animationType = BABYLON.AnimatedInputBlockTypes.None;
        InputTemperature.isConstant = false;
        InputTemperature.visibleInInspector = false;

        // InputBlock
        let sourceMin = new BABYLON.InputBlock("sourceMin");
        sourceMin.value = inputMin;
        sourceMin.isBoolean = false;
        sourceMin.matrixMode = 0;
        sourceMin.animationType = BABYLON.AnimatedInputBlockTypes.None;
        sourceMin.isConstant = false;
        sourceMin.visibleInInspector = false;

        // InputBlock
        let sourceMax = new BABYLON.InputBlock("sourceMax");
        sourceMax.value = inputMax;
        sourceMax.isBoolean = false;
        sourceMax.matrixMode = 0;
        sourceMax.animationType = BABYLON.AnimatedInputBlockTypes.None;
        sourceMax.isConstant = false;
        sourceMax.visibleInInspector = false;

        // InputBlock
        let targetMin = new BABYLON.InputBlock("targetMin");
        targetMin.value = 0;
        targetMin.min = 0;
        targetMin.max = 0;
        targetMin.isBoolean = false;
        targetMin.matrixMode = 0;
        targetMin.animationType = BABYLON.AnimatedInputBlockTypes.None;
        targetMin.isConstant = false;
        targetMin.visibleInInspector = false;

        // InputBlock
        let targetMax = new BABYLON.InputBlock("targetMax");
        targetMax.value = 1;
        targetMax.min = 0;
        targetMax.max = 0;
        targetMax.isBoolean = false;
        targetMax.matrixMode = 0;
        targetMax.animationType = BABYLON.AnimatedInputBlockTypes.None;
        targetMax.isConstant = false;
        targetMax.visibleInInspector = false;

        // FragmentOutputBlock
        let FragmentOutput = new BABYLON.FragmentOutputBlock("FragmentOutput");

        // TransformBlock
        let WorldPosViewProjectionTransform = new BABYLON.TransformBlock("WorldPos * ViewProjectionTransform");
        WorldPosViewProjectionTransform.complementZ = 0;
        WorldPosViewProjectionTransform.complementW = 1;

        // InputBlock
        let ViewProjection = new BABYLON.InputBlock("ViewProjection");
        ViewProjection.setAsSystemValue(BABYLON.NodeMaterialSystemValues.ViewProjection);

        // VertexOutputBlock
        let VertexOutput = new BABYLON.VertexOutputBlock("VertexOutput");

        // Connections
        position.output.connectTo(WorldPos.vector);
        World.output.connectTo(WorldPos.transform);
        WorldPos.output.connectTo(WorldPosViewProjectionTransform.vector);
        ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
        WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
        WorldPos.output.connectTo(Lights.worldPosition);
        normal.output.connectTo(Transform.vector);
        World.output.connectTo(Transform.transform);
        Transform.output.connectTo(Lights.worldNormal);
        cameraPosition.output.connectTo(Lights.cameraPosition);
        Lights.diffuseOutput.connectTo(Multiply.left);
        InputTemperature.output.connectTo(Remap.input);
        sourceMin.output.connectTo(Remap.sourceMin);
        sourceMax.output.connectTo(Remap.sourceMax);
        targetMin.output.connectTo(Remap.targetMin);
        targetMax.output.connectTo(Remap.targetMax);
        Remap.output.connectTo(Gradient.gradient);
        Gradient.output.connectTo(Multiply.right);
        Multiply.output.connectTo(FragmentOutput.rgb);

        // Output nodes
        this.addOutputNode(VertexOutput);
        this.addOutputNode(FragmentOutput);
        this.build();

        return this;
    }  
}