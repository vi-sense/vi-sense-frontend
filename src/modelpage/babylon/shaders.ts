import * as BABYLON from 'babylonjs';

export const pulsatingShader = () => {
    var nodeMaterial = new BABYLON.NodeMaterial("node");

    // InputBlock
    var position = new BABYLON.InputBlock("position");
    position.setAsAttribute("position");

    // VectorSplitterBlock
    var VectorSplitter = new BABYLON.VectorSplitterBlock("VectorSplitter");

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
    var Speed = new BABYLON.InputBlock("Speed");
    Speed.value = 2;
    Speed.min = 0;
    Speed.max = 0;
    Speed.isBoolean = false;
    Speed.matrixMode = 0;
    Speed.animationType = BABYLON.AnimatedInputBlockTypes.None;
    Speed.isConstant = false;
    Speed.visibleInInspector = false;

    // InputBlock
    var Float = new BABYLON.InputBlock("Float");
    Float.value = 0.25;
    Float.min = 0;
    Float.max = 0;
    Float.isBoolean = false;
    Float.matrixMode = 0;
    Float.animationType = BABYLON.AnimatedInputBlockTypes.None;
    Float.isConstant = false;
    Float.visibleInInspector = false;

    // InputBlock
    var minValue = new BABYLON.InputBlock("minValue");
    minValue.value = 0.75;
    minValue.min = 0;
    minValue.max = 0;
    minValue.isBoolean = false;
    minValue.matrixMode = 0;
    minValue.animationType = BABYLON.AnimatedInputBlockTypes.None;
    minValue.isConstant = false;
    minValue.visibleInInspector = false;

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

    // SubtractBlock
    var Subtract = new BABYLON.SubtractBlock("Subtract");

    // MultiplyBlock
    var Multiply3 = new BABYLON.MultiplyBlock("Multiply");

    // InputBlock
    var Time1 = new BABYLON.InputBlock("Time");
    Time1.value = 1;
    Time1.min = 0;
    Time1.max = 0;
    Time1.isBoolean = false;
    Time1.matrixMode = 0;
    Time1.animationType = BABYLON.AnimatedInputBlockTypes.Time;
    Time1.isConstant = false;
    Time1.visibleInInspector = false;

    // InputBlock
    var waveSpeed = new BABYLON.InputBlock("waveSpeed");
    waveSpeed.value = 1;
    waveSpeed.min = 0;
    waveSpeed.max = 0;
    waveSpeed.isBoolean = false;
    waveSpeed.matrixMode = 0;
    waveSpeed.animationType = BABYLON.AnimatedInputBlockTypes.None;
    waveSpeed.isConstant = false;
    waveSpeed.visibleInInspector = false;

    // DivideBlock
    var Divide = new BABYLON.DivideBlock("Divide");

    // InputBlock
    var waveLength = new BABYLON.InputBlock("waveLength");
    waveLength.value = 0.2;
    waveLength.min = 0;
    waveLength.max = 0;
    waveLength.isBoolean = false;
    waveLength.matrixMode = 0;
    waveLength.animationType = BABYLON.AnimatedInputBlockTypes.None;
    waveLength.isConstant = false;
    waveLength.visibleInInspector = false;

    // TrigonometryBlock
    var Sin1 = new BABYLON.TrigonometryBlock("Sin");
    Sin1.operation = BABYLON.TrigonometryBlockOperations.Sin;

    // MultiplyBlock
    var Multiply4 = new BABYLON.MultiplyBlock("Multiply");

    // InputBlock
    var waveHeight = new BABYLON.InputBlock("waveHeight");
    waveHeight.value = 2;
    waveHeight.min = 0;
    waveHeight.max = 0;
    waveHeight.isBoolean = false;
    waveHeight.matrixMode = 0;
    waveHeight.animationType = BABYLON.AnimatedInputBlockTypes.None;
    waveHeight.isConstant = false;
    waveHeight.visibleInInspector = false;

    // ClampBlock
    var Clamp = new BABYLON.ClampBlock("Clamp");
    Clamp.minimum = 0;
    Clamp.maximum = 1;

    // GradientBlock
    var Gradient = new BABYLON.GradientBlock("Gradient");
    Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0, new BABYLON.Color3(0.30196078431372547, 0.6274509803921569, 1)));
    Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(1, new BABYLON.Color3(0.050980392156862744, 0, 0.9568627450980393)));

    // Connections
    position.output.connectTo(VectorSplitter.xyzIn);
    VectorSplitter.xyzOut.connectTo(worldPos.vector);
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
    Speed.output.connectTo(Multiply2.right);
    Multiply2.output.connectTo(Sin.input);
    Sin.output.connectTo(Multiply1.left);
    Float.output.connectTo(Multiply1.right);
    Multiply1.output.connectTo(Add.left);
    minValue.output.connectTo(Add.right);
    Add.output.connectTo(Oneminus.input);
    Oneminus.output.connectTo(ColorMerger.r);
    Add.output.connectTo(ColorMerger.b);
    ColorMerger.rgb.connectTo(Multiply.right);
    Multiply.output.connectTo(fragmentOutput.rgb);

    // Output nodes
    nodeMaterial.addOutputNode(vertexOutput);
    nodeMaterial.addOutputNode(fragmentOutput);
    nodeMaterial.build();

    return nodeMaterial;
}