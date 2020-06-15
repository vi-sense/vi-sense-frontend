import * as BABYLON from 'babylonjs';

export const pulsatingShader = () => {
    let nodeMaterial = new BABYLON.NodeMaterial("node");

    // InputBlock
    let position = new BABYLON.InputBlock("position");
    position.setAsAttribute("position");

    // VectorSplitterBlock
    let VectorSplitter = new BABYLON.VectorSplitterBlock("VectorSplitter");

    // TransformBlock
    let worldPos = new BABYLON.TransformBlock("worldPos");
    worldPos.complementZ = 0;
    worldPos.complementW = 1;

    // InputBlock
    let world = new BABYLON.InputBlock("world");
    world.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);

    // TransformBlock
    let Worldnormal = new BABYLON.TransformBlock("World normal");
    Worldnormal.complementZ = 0;
    Worldnormal.complementW = 0;

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

    // ColorMergerBlock
    let ColorMerger = new BABYLON.ColorMergerBlock("ColorMerger");

    // OneMinusBlock
    let Oneminus = new BABYLON.OneMinusBlock("One minus");

    // AddBlock
    let Add = new BABYLON.AddBlock("Add");

    // MultiplyBlock
    let Multiply1 = new BABYLON.MultiplyBlock("Multiply");

    // TrigonometryBlock
    let Sin = new BABYLON.TrigonometryBlock("Sin");
    Sin.operation = BABYLON.TrigonometryBlockOperations.Sin;

    // MultiplyBlock
    let Multiply2 = new BABYLON.MultiplyBlock("Multiply");

    // InputBlock
    let Time = new BABYLON.InputBlock("Time");
    Time.value = 0;
    Time.min = 0;
    Time.max = 0;
    Time.isBoolean = false;
    Time.matrixMode = 0;
    Time.animationType = BABYLON.AnimatedInputBlockTypes.Time;
    Time.isConstant = false;
    Time.visibleInInspector = false;

    // InputBlock
    let Speed = new BABYLON.InputBlock("Speed");
    Speed.value = 2;
    Speed.min = 0;
    Speed.max = 0;
    Speed.isBoolean = false;
    Speed.matrixMode = 0;
    Speed.animationType = BABYLON.AnimatedInputBlockTypes.None;
    Speed.isConstant = false;
    Speed.visibleInInspector = false;

    // InputBlock
    let Float = new BABYLON.InputBlock("Float");
    Float.value = 0.25;
    Float.min = 0;
    Float.max = 0;
    Float.isBoolean = false;
    Float.matrixMode = 0;
    Float.animationType = BABYLON.AnimatedInputBlockTypes.None;
    Float.isConstant = false;
    Float.visibleInInspector = false;

    // InputBlock
    let minValue = new BABYLON.InputBlock("minValue");
    minValue.value = 0.75;
    minValue.min = 0;
    minValue.max = 0;
    minValue.isBoolean = false;
    minValue.matrixMode = 0;
    minValue.animationType = BABYLON.AnimatedInputBlockTypes.None;
    minValue.isConstant = false;
    minValue.visibleInInspector = false;

    // FragmentOutputBlock
    let fragmentOutput = new BABYLON.FragmentOutputBlock("fragmentOutput");

    // TransformBlock
    let worldPosviewProjectionTransform = new BABYLON.TransformBlock("worldPos * viewProjectionTransform");
    worldPosviewProjectionTransform.complementZ = 0;
    worldPosviewProjectionTransform.complementW = 1;

    // InputBlock
    let viewProjection = new BABYLON.InputBlock("viewProjection");
    viewProjection.setAsSystemValue(BABYLON.NodeMaterialSystemValues.ViewProjection);

    // VertexOutputBlock
    let vertexOutput = new BABYLON.VertexOutputBlock("vertexOutput");

    // SubtractBlock
    let Subtract = new BABYLON.SubtractBlock("Subtract");

    // MultiplyBlock
    let Multiply3 = new BABYLON.MultiplyBlock("Multiply");

    // InputBlock
    let Time1 = new BABYLON.InputBlock("Time");
    Time1.value = 1;
    Time1.min = 0;
    Time1.max = 0;
    Time1.isBoolean = false;
    Time1.matrixMode = 0;
    Time1.animationType = BABYLON.AnimatedInputBlockTypes.Time;
    Time1.isConstant = false;
    Time1.visibleInInspector = false;

    // InputBlock
    let waveSpeed = new BABYLON.InputBlock("waveSpeed");
    waveSpeed.value = 1;
    waveSpeed.min = 0;
    waveSpeed.max = 0;
    waveSpeed.isBoolean = false;
    waveSpeed.matrixMode = 0;
    waveSpeed.animationType = BABYLON.AnimatedInputBlockTypes.None;
    waveSpeed.isConstant = false;
    waveSpeed.visibleInInspector = false;

    // DivideBlock
    let Divide = new BABYLON.DivideBlock("Divide");

    // InputBlock
    let waveLength = new BABYLON.InputBlock("waveLength");
    waveLength.value = 0.2;
    waveLength.min = 0;
    waveLength.max = 0;
    waveLength.isBoolean = false;
    waveLength.matrixMode = 0;
    waveLength.animationType = BABYLON.AnimatedInputBlockTypes.None;
    waveLength.isConstant = false;
    waveLength.visibleInInspector = false;

    // TrigonometryBlock
    let Sin1 = new BABYLON.TrigonometryBlock("Sin");
    Sin1.operation = BABYLON.TrigonometryBlockOperations.Sin;

    // MultiplyBlock
    let Multiply4 = new BABYLON.MultiplyBlock("Multiply");

    // InputBlock
    let waveHeight = new BABYLON.InputBlock("waveHeight");
    waveHeight.value = 2;
    waveHeight.min = 0;
    waveHeight.max = 0;
    waveHeight.isBoolean = false;
    waveHeight.matrixMode = 0;
    waveHeight.animationType = BABYLON.AnimatedInputBlockTypes.None;
    waveHeight.isConstant = false;
    waveHeight.visibleInInspector = false;

    // ClampBlock
    let Clamp = new BABYLON.ClampBlock("Clamp");
    Clamp.minimum = 0;
    Clamp.maximum = 1;

    // GradientBlock
    let Gradient = new BABYLON.GradientBlock("Gradient");
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








export const gradientShader = () => {
    let nodeMaterial = new BABYLON.NodeMaterial("node");

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
    InputTemperature.value = 100;
    InputTemperature.min = 0;
    InputTemperature.max = 100;
    InputTemperature.isBoolean = false;
    InputTemperature.matrixMode = 0;
    InputTemperature.animationType = BABYLON.AnimatedInputBlockTypes.None;
    InputTemperature.isConstant = false;
    InputTemperature.visibleInInspector = false;

    // InputBlock
    let sourceMin = new BABYLON.InputBlock("sourceMin");
    sourceMin.value = 0;
    sourceMin.min = 0;
    sourceMin.max = 0;
    sourceMin.isBoolean = false;
    sourceMin.matrixMode = 0;
    sourceMin.animationType = BABYLON.AnimatedInputBlockTypes.None;
    sourceMin.isConstant = false;
    sourceMin.visibleInInspector = false;

    // InputBlock
    let sourceMax = new BABYLON.InputBlock("sourceMax");
    sourceMax.value = 100;
    sourceMax.min = 0;
    sourceMax.max = 0;
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

    // InputBlock
    let opacity = new BABYLON.InputBlock("opacity");
    opacity.value = 1;
    opacity.min = 0;
    opacity.max = 1;
    opacity.isBoolean = false;
    opacity.matrixMode = 0;
    opacity.animationType = BABYLON.AnimatedInputBlockTypes.None;
    opacity.isConstant = false;
    opacity.visibleInInspector = false;

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
    opacity.output.connectTo(FragmentOutput.a);

    // Output nodes
    nodeMaterial.addOutputNode(VertexOutput);
    nodeMaterial.addOutputNode(FragmentOutput);
    nodeMaterial.build();


    return nodeMaterial;
}