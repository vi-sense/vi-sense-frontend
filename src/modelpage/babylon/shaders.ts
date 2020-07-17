import * as BABYLON from 'babylonjs';

/**
 * Some shaders, created using the Babylon Node Material Editor
 * https://nme.babylonjs.com/#QPRJU9#19
 */
export class PulseShader extends BABYLON.NodeMaterial {
    constructor() {
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

        // MultiplyBlock
        var Multiply1 = new BABYLON.MultiplyBlock("Multiply");

        // ColorMergerBlock
        var ColorMerger = new BABYLON.ColorMergerBlock("ColorMerger");

        // AddBlock
        var Add = new BABYLON.AddBlock("Add");

        // MultiplyBlock
        var Multiply2 = new BABYLON.MultiplyBlock("Multiply");

        // TrigonometryBlock
        var Sin = new BABYLON.TrigonometryBlock("Sin");
        Sin.operation = BABYLON.TrigonometryBlockOperations.Sin;

        // MultiplyBlock
        var Multiply3 = new BABYLON.MultiplyBlock("Multiply");

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
        Float.value = 0.15;
        Float.min = 0;
        Float.max = 0;
        Float.isBoolean = false;
        Float.matrixMode = 0;
        Float.animationType = BABYLON.AnimatedInputBlockTypes.None;
        Float.isConstant = false;
        Float.visibleInInspector = false;

        // InputBlock
        var minValue = new BABYLON.InputBlock("minValue");
        minValue.value = 0.95;
        minValue.min = 0;
        minValue.max = 0;
        minValue.isBoolean = false;
        minValue.matrixMode = 0;
        minValue.animationType = BABYLON.AnimatedInputBlockTypes.None;
        minValue.isConstant = false;
        minValue.visibleInInspector = false;

        // InputBlock
        var Color = new BABYLON.InputBlock("Color3");
        Color.value = new BABYLON.Color3(0.3215686274509804, 0.7294117647058823, 0.6352941176470588);
        Color.isConstant = false;
        Color.visibleInInspector = false;

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
        Time.output.connectTo(Multiply3.left);
        Speed.output.connectTo(Multiply3.right);
        Multiply3.output.connectTo(Sin.input);
        Sin.output.connectTo(Multiply2.left);
        Float.output.connectTo(Multiply2.right);
        Multiply2.output.connectTo(Add.left);
        minValue.output.connectTo(Add.right);
        Add.output.connectTo(ColorMerger.r);
        Add.output.connectTo(ColorMerger.g);
        Add.output.connectTo(ColorMerger.b);
        ColorMerger.rgb.connectTo(Multiply1.left);
        Color.output.connectTo(Multiply1.right);
        Multiply1.output.connectTo(Multiply.right);
        Multiply.output.connectTo(fragmentOutput.rgb);

        // Output nodes
        this.addOutputNode(vertexOutput);
        this.addOutputNode(fragmentOutput);
        this.build();

        return this;
    }
}

/**
 * https://nme.babylonjs.com/#4EQZYW#2
 */
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
        let InputValue = new BABYLON.InputBlock("inputValue");
        InputValue.value = currentValue;
        InputValue.isBoolean = false;
        InputValue.matrixMode = 0;
        InputValue.animationType = BABYLON.AnimatedInputBlockTypes.None;
        InputValue.isConstant = false;
        InputValue.visibleInInspector = false;

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
        InputValue.output.connectTo(Remap.input);
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

/**
 * https://nme.babylonjs.com/#JN2BSF#54
 */
export class FireShader extends BABYLON.NodeMaterial {
    constructor() {
        super("node");

        // InputBlock
        var position = new BABYLON.InputBlock("position");
        position.setAsAttribute("position");

        // AddBlock
        var Add = new BABYLON.AddBlock("Add");

        // ScaleBlock
        var Scale = new BABYLON.ScaleBlock("Scale");

        // MultiplyBlock
        var Multiply = new BABYLON.MultiplyBlock("Multiply");

        // InputBlock
        var normal = new BABYLON.InputBlock("normal");
        normal.setAsAttribute("normal");

        // RemapBlock
        var Remap = new BABYLON.RemapBlock("Remap");
        Remap.sourceRange = new BABYLON.Vector2(0, 0.66);
        Remap.targetRange = new BABYLON.Vector2(0, 1);

        // VectorMergerBlock
        var VectorMerger = new BABYLON.VectorMergerBlock("VectorMerger");

        // AddBlock
        var Add1 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add2 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add3 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add4 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add5 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add6 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add7 = new BABYLON.AddBlock("Add");

        // MultiplyBlock
        var Multiply1 = new BABYLON.MultiplyBlock("Multiply");

        // TrigonometryBlock
        var Abs = new BABYLON.TrigonometryBlock("Abs");
        Abs.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // SimplexPerlin3DBlock
        var SimplexPerlinD = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // RemapBlock
        var Remap1 = new BABYLON.RemapBlock("Remap");
        Remap1.sourceRange = new BABYLON.Vector2(0, 1);
        Remap1.targetRange = new BABYLON.Vector2(0, 1);

        // VectorMergerBlock
        var VectorMerger1 = new BABYLON.VectorMergerBlock("VectorMerger");

        // AddBlock
        var Add8 = new BABYLON.AddBlock("Add");

        // VectorSplitterBlock
        var VectorSplitter = new BABYLON.VectorSplitterBlock("VectorSplitter");

        // InputBlock
        var position1 = new BABYLON.InputBlock("position");
        position1.setAsAttribute("position");

        // AddBlock
        var Add9 = new BABYLON.AddBlock("Add");

        // ScaleBlock
        var Scale1 = new BABYLON.ScaleBlock("Scale");

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
        var InputBlock_87 = new BABYLON.InputBlock("");
        InputBlock_87.value = 0.87;
        InputBlock_87.min = 0;
        InputBlock_87.max = 1;
        InputBlock_87.isBoolean = false;
        InputBlock_87.matrixMode = 0;
        InputBlock_87.animationType = BABYLON.AnimatedInputBlockTypes.None;
        InputBlock_87.isConstant = false;
        InputBlock_87.visibleInInspector = false;

        // AddBlock
        var Add10 = new BABYLON.AddBlock("Add");

        // RemapBlock
        var Remap2 = new BABYLON.RemapBlock("Remap");
        Remap2.sourceRange = new BABYLON.Vector2(0, 1);
        Remap2.targetRange = new BABYLON.Vector2(0, 1);

        // SimplexPerlin3DBlock
        var SimplexPerlinD1 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // TrigonometryBlock
        var Abs1 = new BABYLON.TrigonometryBlock("Abs");
        Abs1.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // MultiplyBlock
        var Multiply2 = new BABYLON.MultiplyBlock("Multiply");

        // InputBlock
        var amp = new BABYLON.InputBlock("amp");
        amp.value = 0.48;
        amp.min = 0;
        amp.max = 1;
        amp.isBoolean = false;
        amp.matrixMode = 0;
        amp.animationType = BABYLON.AnimatedInputBlockTypes.None;
        amp.isConstant = false;
        amp.visibleInInspector = false;

        // MultiplyBlock
        var Multiply3 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply4 = new BABYLON.MultiplyBlock("Multiply");

        // TrigonometryBlock
        var Abs2 = new BABYLON.TrigonometryBlock("Abs");
        Abs2.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // SimplexPerlin3DBlock
        var SimplexPerlinD2 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // ScaleBlock
        var Scale2 = new BABYLON.ScaleBlock("Scale");

        // InputBlock
        var Structure = new BABYLON.InputBlock("Structure");
        Structure.value = 2;
        Structure.min = 0;
        Structure.max = 2;
        Structure.isBoolean = false;
        Structure.matrixMode = 0;
        Structure.animationType = BABYLON.AnimatedInputBlockTypes.None;
        Structure.isConstant = false;
        Structure.visibleInInspector = false;

        // ScaleBlock
        var Scale3 = new BABYLON.ScaleBlock("Scale");

        // SimplexPerlin3DBlock
        var SimplexPerlinD3 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // TrigonometryBlock
        var Abs3 = new BABYLON.TrigonometryBlock("Abs");
        Abs3.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // MultiplyBlock
        var Multiply5 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply6 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply7 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply8 = new BABYLON.MultiplyBlock("Multiply");

        // TrigonometryBlock
        var Abs4 = new BABYLON.TrigonometryBlock("Abs");
        Abs4.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // SimplexPerlin3DBlock
        var SimplexPerlinD4 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // ScaleBlock
        var Scale4 = new BABYLON.ScaleBlock("Scale");

        // ScaleBlock
        var Scale5 = new BABYLON.ScaleBlock("Scale");

        // SimplexPerlin3DBlock
        var SimplexPerlinD5 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // TrigonometryBlock
        var Abs5 = new BABYLON.TrigonometryBlock("Abs");
        Abs5.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // MultiplyBlock
        var Multiply9 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply10 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply11 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply12 = new BABYLON.MultiplyBlock("Multiply");

        // TrigonometryBlock
        var Abs6 = new BABYLON.TrigonometryBlock("Abs");
        Abs6.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // SimplexPerlin3DBlock
        var SimplexPerlinD6 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // ScaleBlock
        var Scale6 = new BABYLON.ScaleBlock("Scale");

        // ScaleBlock
        var Scale7 = new BABYLON.ScaleBlock("Scale");

        // SimplexPerlin3DBlock
        var SimplexPerlinD7 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // TrigonometryBlock
        var Abs7 = new BABYLON.TrigonometryBlock("Abs");
        Abs7.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // MultiplyBlock
        var Multiply13 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply14 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply15 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply16 = new BABYLON.MultiplyBlock("Multiply");

        // TrigonometryBlock
        var Abs8 = new BABYLON.TrigonometryBlock("Abs");
        Abs8.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // SimplexPerlin3DBlock
        var SimplexPerlinD8 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // ScaleBlock
        var Scale8 = new BABYLON.ScaleBlock("Scale");

        // AddBlock
        var Add11 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add12 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add13 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add14 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add15 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add16 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add17 = new BABYLON.AddBlock("Add");

        // VectorMergerBlock
        var VectorMerger2 = new BABYLON.VectorMergerBlock("VectorMerger");

        // RemapBlock
        var Remap3 = new BABYLON.RemapBlock("Remap");
        Remap3.sourceRange = new BABYLON.Vector2(0, 0.66);
        Remap3.targetRange = new BABYLON.Vector2(0, 1);

        // OneMinusBlock
        var Oneminus = new BABYLON.OneMinusBlock("One minus");

        // GradientBlock
        var Gradient = new BABYLON.GradientBlock("Gradient");
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.21, new BABYLON.Color3(0, 0, 0)));
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.47, new BABYLON.Color3(0.7333333333333333, 0, 0)));
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.75, new BABYLON.Color3(0.9921568627450981, 0.9686274509803922, 0)));
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(1, new BABYLON.Color3(1, 1, 1)));

        // FragmentOutputBlock
        var fragmentOutput = new BABYLON.FragmentOutputBlock("fragmentOutput");

        // RemapBlock
        var Remap4 = new BABYLON.RemapBlock("Remap");
        Remap4.sourceRange = new BABYLON.Vector2(0, 1);
        Remap4.targetRange = new BABYLON.Vector2(0, 1);

        // SimplexPerlin3DBlock
        var SimplexPerlinD9 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // MultiplyBlock
        var Multiply17 = new BABYLON.MultiplyBlock("Multiply");

        // InputBlock
        var amp1 = new BABYLON.InputBlock("amp");
        amp1.value = 0.47;
        amp1.min = 0;
        amp1.max = 1;
        amp1.isBoolean = false;
        amp1.matrixMode = 0;
        amp1.animationType = BABYLON.AnimatedInputBlockTypes.None;
        amp1.isConstant = false;
        amp1.visibleInInspector = false;

        // MultiplyBlock
        var Multiply18 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply19 = new BABYLON.MultiplyBlock("Multiply");

        // SimplexPerlin3DBlock
        var SimplexPerlinD10 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // ScaleBlock
        var Scale9 = new BABYLON.ScaleBlock("Scale");

        // InputBlock
        var Structure1 = new BABYLON.InputBlock("Structure");
        Structure1.value = 2;
        Structure1.min = 0;
        Structure1.max = 2;
        Structure1.isBoolean = false;
        Structure1.matrixMode = 0;
        Structure1.animationType = BABYLON.AnimatedInputBlockTypes.None;
        Structure1.isConstant = false;
        Structure1.visibleInInspector = false;

        // ScaleBlock
        var Scale10 = new BABYLON.ScaleBlock("Scale");

        // SimplexPerlin3DBlock
        var SimplexPerlinD11 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // MultiplyBlock
        var Multiply20 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply21 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply22 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply23 = new BABYLON.MultiplyBlock("Multiply");

        // SimplexPerlin3DBlock
        var SimplexPerlinD12 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // ScaleBlock
        var Scale11 = new BABYLON.ScaleBlock("Scale");

        // ScaleBlock
        var Scale12 = new BABYLON.ScaleBlock("Scale");

        // SimplexPerlin3DBlock
        var SimplexPerlinD13 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // MultiplyBlock
        var Multiply24 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply25 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply26 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply27 = new BABYLON.MultiplyBlock("Multiply");

        // SimplexPerlin3DBlock
        var SimplexPerlinD14 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // ScaleBlock
        var Scale13 = new BABYLON.ScaleBlock("Scale");

        // ScaleBlock
        var Scale14 = new BABYLON.ScaleBlock("Scale");

        // SimplexPerlin3DBlock
        var SimplexPerlinD15 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // MultiplyBlock
        var Multiply28 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply29 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply30 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply31 = new BABYLON.MultiplyBlock("Multiply");

        // SimplexPerlin3DBlock
        var SimplexPerlinD16 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // ScaleBlock
        var Scale15 = new BABYLON.ScaleBlock("Scale");

        // AddBlock
        var Add18 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add19 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add20 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add21 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add22 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add23 = new BABYLON.AddBlock("Add");

        // AddBlock
        var Add24 = new BABYLON.AddBlock("Add");

        // RemapBlock
        var Remap5 = new BABYLON.RemapBlock("Remap");
        Remap5.sourceRange = new BABYLON.Vector2(-0.5, 0.5);
        Remap5.targetRange = new BABYLON.Vector2(0, 1);

        // ScaleBlock
        var Scale16 = new BABYLON.ScaleBlock("Scale");

        // InputBlock
        var Structure2 = new BABYLON.InputBlock("Structure");
        Structure2.value = 2;
        Structure2.min = 0;
        Structure2.max = 2;
        Structure2.isBoolean = false;
        Structure2.matrixMode = 0;
        Structure2.animationType = BABYLON.AnimatedInputBlockTypes.None;
        Structure2.isConstant = false;
        Structure2.visibleInInspector = false;

        // ScaleBlock
        var Scale17 = new BABYLON.ScaleBlock("Scale");

        // SimplexPerlin3DBlock
        var SimplexPerlinD17 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // TrigonometryBlock
        var Abs9 = new BABYLON.TrigonometryBlock("Abs");
        Abs9.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // MultiplyBlock
        var Multiply32 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply33 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply34 = new BABYLON.MultiplyBlock("Multiply");

        // InputBlock
        var amp2 = new BABYLON.InputBlock("amp");
        amp2.value = 0.48;
        amp2.min = 0;
        amp2.max = 1;
        amp2.isBoolean = false;
        amp2.matrixMode = 0;
        amp2.animationType = BABYLON.AnimatedInputBlockTypes.None;
        amp2.isConstant = false;
        amp2.visibleInInspector = false;

        // MultiplyBlock
        var Multiply35 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply36 = new BABYLON.MultiplyBlock("Multiply");

        // TrigonometryBlock
        var Abs10 = new BABYLON.TrigonometryBlock("Abs");
        Abs10.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // SimplexPerlin3DBlock
        var SimplexPerlinD18 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // ScaleBlock
        var Scale18 = new BABYLON.ScaleBlock("Scale");

        // ScaleBlock
        var Scale19 = new BABYLON.ScaleBlock("Scale");

        // SimplexPerlin3DBlock
        var SimplexPerlinD19 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // TrigonometryBlock
        var Abs11 = new BABYLON.TrigonometryBlock("Abs");
        Abs11.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // MultiplyBlock
        var Multiply37 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply38 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply39 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply40 = new BABYLON.MultiplyBlock("Multiply");

        // TrigonometryBlock
        var Abs12 = new BABYLON.TrigonometryBlock("Abs");
        Abs12.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // SimplexPerlin3DBlock
        var SimplexPerlinD20 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // ScaleBlock
        var Scale20 = new BABYLON.ScaleBlock("Scale");

        // ScaleBlock
        var Scale21 = new BABYLON.ScaleBlock("Scale");

        // SimplexPerlin3DBlock
        var SimplexPerlinD21 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // TrigonometryBlock
        var Abs13 = new BABYLON.TrigonometryBlock("Abs");
        Abs13.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // MultiplyBlock
        var Multiply41 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply42 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply43 = new BABYLON.MultiplyBlock("Multiply");

        // MultiplyBlock
        var Multiply44 = new BABYLON.MultiplyBlock("Multiply");

        // TrigonometryBlock
        var Abs14 = new BABYLON.TrigonometryBlock("Abs");
        Abs14.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // SimplexPerlin3DBlock
        var SimplexPerlinD22 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // ScaleBlock
        var Scale22 = new BABYLON.ScaleBlock("Scale");

        // MultiplyBlock
        var Multiply45 = new BABYLON.MultiplyBlock("Multiply");

        // TrigonometryBlock
        var Abs15 = new BABYLON.TrigonometryBlock("Abs");
        Abs15.operation = BABYLON.TrigonometryBlockOperations.Abs;

        // SimplexPerlin3DBlock
        var SimplexPerlinD23 = new BABYLON.SimplexPerlin3DBlock("SimplexPerlin3D");

        // InputBlock
        var InputBlock_127 = new BABYLON.InputBlock("");
        InputBlock_127.value = 0;
        InputBlock_127.min = 0;
        InputBlock_127.max = 1;
        InputBlock_127.isBoolean = false;
        InputBlock_127.matrixMode = 0;
        InputBlock_127.animationType = BABYLON.AnimatedInputBlockTypes.None;
        InputBlock_127.isConstant = false;
        InputBlock_127.visibleInInspector = false;

        // TransformBlock
        var worldPos = new BABYLON.TransformBlock("worldPos");
        worldPos.complementZ = 0;
        worldPos.complementW = 1;

        // InputBlock
        var world = new BABYLON.InputBlock("world");
        world.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);

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
        position.output.connectTo(Add.left);
        normal.output.connectTo(Multiply.left);
        position1.output.connectTo(VectorSplitter.xyzIn);
        VectorSplitter.x.connectTo(Add8.left);
        Time.output.connectTo(Scale1.input);
        InputBlock_87.output.connectTo(Scale1.factor);
        Scale1.output.connectTo(Add8.right);
        Add8.output.connectTo(VectorMerger1.x);
        VectorSplitter.y.connectTo(Add9.left);
        Scale1.output.connectTo(Add9.right);
        Add9.output.connectTo(VectorMerger1.y);
        VectorSplitter.z.connectTo(Add10.left);
        Scale1.output.connectTo(Add10.right);
        Add10.output.connectTo(VectorMerger1.z);
        VectorMerger1.xyz.connectTo(Remap1.input);
        Remap1.output.connectTo(SimplexPerlinD.seed);
        SimplexPerlinD.output.connectTo(Abs.input);
        Abs.output.connectTo(Multiply1.left);
        amp2.output.connectTo(Multiply1.right);
        Multiply1.output.connectTo(Add7.left);
        Remap1.output.connectTo(Scale16.input);
        Structure2.output.connectTo(Scale16.factor);
        Scale16.output.connectTo(SimplexPerlinD23.seed);
        SimplexPerlinD23.output.connectTo(Abs15.input);
        Abs15.output.connectTo(Multiply45.left);
        amp2.output.connectTo(Multiply34.left);
        amp2.output.connectTo(Multiply34.right);
        Multiply34.output.connectTo(Multiply45.right);
        Multiply45.output.connectTo(Add7.right);
        Add7.output.connectTo(Add6.left);
        Scale16.output.connectTo(Scale17.input);
        Structure2.output.connectTo(Scale17.factor);
        Scale17.output.connectTo(SimplexPerlinD17.seed);
        SimplexPerlinD17.output.connectTo(Abs9.input);
        Abs9.output.connectTo(Multiply32.left);
        Multiply34.output.connectTo(Multiply33.left);
        amp2.output.connectTo(Multiply33.right);
        Multiply33.output.connectTo(Multiply32.right);
        Multiply32.output.connectTo(Add6.right);
        Add6.output.connectTo(Add5.left);
        Scale17.output.connectTo(Scale18.input);
        Structure2.output.connectTo(Scale18.factor);
        Scale18.output.connectTo(SimplexPerlinD18.seed);
        SimplexPerlinD18.output.connectTo(Abs10.input);
        Abs10.output.connectTo(Multiply36.left);
        Multiply33.output.connectTo(Multiply35.left);
        amp2.output.connectTo(Multiply35.right);
        Multiply35.output.connectTo(Multiply36.right);
        Multiply36.output.connectTo(Add5.right);
        Add5.output.connectTo(Add4.left);
        Scale18.output.connectTo(Scale19.input);
        Structure2.output.connectTo(Scale19.factor);
        Scale19.output.connectTo(SimplexPerlinD19.seed);
        SimplexPerlinD19.output.connectTo(Abs11.input);
        Abs11.output.connectTo(Multiply37.left);
        Multiply35.output.connectTo(Multiply38.left);
        amp2.output.connectTo(Multiply38.right);
        Multiply38.output.connectTo(Multiply37.right);
        Multiply37.output.connectTo(Add4.right);
        Add4.output.connectTo(Add3.left);
        Scale19.output.connectTo(Scale20.input);
        Structure2.output.connectTo(Scale20.factor);
        Scale20.output.connectTo(SimplexPerlinD20.seed);
        SimplexPerlinD20.output.connectTo(Abs12.input);
        Abs12.output.connectTo(Multiply40.left);
        Multiply38.output.connectTo(Multiply39.left);
        amp2.output.connectTo(Multiply39.right);
        Multiply39.output.connectTo(Multiply40.right);
        Multiply40.output.connectTo(Add3.right);
        Add3.output.connectTo(Add2.left);
        Scale20.output.connectTo(Scale21.input);
        Structure2.output.connectTo(Scale21.factor);
        Scale21.output.connectTo(SimplexPerlinD21.seed);
        SimplexPerlinD21.output.connectTo(Abs13.input);
        Abs13.output.connectTo(Multiply41.left);
        Multiply39.output.connectTo(Multiply42.left);
        amp2.output.connectTo(Multiply42.right);
        Multiply42.output.connectTo(Multiply41.right);
        Multiply41.output.connectTo(Add2.right);
        Add2.output.connectTo(Add1.left);
        Scale21.output.connectTo(Scale22.input);
        Structure2.output.connectTo(Scale22.factor);
        Scale22.output.connectTo(SimplexPerlinD22.seed);
        SimplexPerlinD22.output.connectTo(Abs14.input);
        Abs14.output.connectTo(Multiply44.left);
        Multiply42.output.connectTo(Multiply43.left);
        amp2.output.connectTo(Multiply43.right);
        Multiply43.output.connectTo(Multiply44.right);
        Multiply44.output.connectTo(Add1.right);
        Add1.output.connectTo(VectorMerger.x);
        Add1.output.connectTo(VectorMerger.y);
        Add1.output.connectTo(VectorMerger.z);
        VectorMerger.xyz.connectTo(Remap.input);
        Remap.output.connectTo(Multiply.right);
        Multiply.output.connectTo(Scale.input);
        InputBlock_127.output.connectTo(Scale.factor);
        Scale.output.connectTo(Add.right);
        Add.output.connectTo(worldPos.vector);
        world.output.connectTo(worldPos.transform);
        worldPos.output.connectTo(worldPosviewProjectionTransform.vector);
        viewProjection.output.connectTo(worldPosviewProjectionTransform.transform);
        worldPosviewProjectionTransform.output.connectTo(vertexOutput.vector);
        VectorMerger1.xyz.connectTo(Remap2.input);
        Remap2.output.connectTo(SimplexPerlinD1.seed);
        SimplexPerlinD1.output.connectTo(Abs1.input);
        Abs1.output.connectTo(Multiply2.left);
        amp.output.connectTo(Multiply2.right);
        Multiply2.output.connectTo(Add17.left);
        Remap2.output.connectTo(Scale2.input);
        Structure.output.connectTo(Scale2.factor);
        Scale2.output.connectTo(SimplexPerlinD2.seed);
        SimplexPerlinD2.output.connectTo(Abs2.input);
        Abs2.output.connectTo(Multiply4.left);
        amp.output.connectTo(Multiply3.left);
        amp.output.connectTo(Multiply3.right);
        Multiply3.output.connectTo(Multiply4.right);
        Multiply4.output.connectTo(Add17.right);
        Add17.output.connectTo(Add16.left);
        Scale2.output.connectTo(Scale3.input);
        Structure.output.connectTo(Scale3.factor);
        Scale3.output.connectTo(SimplexPerlinD3.seed);
        SimplexPerlinD3.output.connectTo(Abs3.input);
        Abs3.output.connectTo(Multiply5.left);
        Multiply3.output.connectTo(Multiply6.left);
        amp.output.connectTo(Multiply6.right);
        Multiply6.output.connectTo(Multiply5.right);
        Multiply5.output.connectTo(Add16.right);
        Add16.output.connectTo(Add15.left);
        Scale3.output.connectTo(Scale4.input);
        Structure.output.connectTo(Scale4.factor);
        Scale4.output.connectTo(SimplexPerlinD4.seed);
        SimplexPerlinD4.output.connectTo(Abs4.input);
        Abs4.output.connectTo(Multiply8.left);
        Multiply6.output.connectTo(Multiply7.left);
        amp.output.connectTo(Multiply7.right);
        Multiply7.output.connectTo(Multiply8.right);
        Multiply8.output.connectTo(Add15.right);
        Add15.output.connectTo(Add14.left);
        Scale4.output.connectTo(Scale5.input);
        Structure.output.connectTo(Scale5.factor);
        Scale5.output.connectTo(SimplexPerlinD5.seed);
        SimplexPerlinD5.output.connectTo(Abs5.input);
        Abs5.output.connectTo(Multiply9.left);
        Multiply7.output.connectTo(Multiply10.left);
        amp.output.connectTo(Multiply10.right);
        Multiply10.output.connectTo(Multiply9.right);
        Multiply9.output.connectTo(Add14.right);
        Add14.output.connectTo(Add13.left);
        Scale5.output.connectTo(Scale6.input);
        Structure.output.connectTo(Scale6.factor);
        Scale6.output.connectTo(SimplexPerlinD6.seed);
        SimplexPerlinD6.output.connectTo(Abs6.input);
        Abs6.output.connectTo(Multiply12.left);
        Multiply10.output.connectTo(Multiply11.left);
        amp.output.connectTo(Multiply11.right);
        Multiply11.output.connectTo(Multiply12.right);
        Multiply12.output.connectTo(Add13.right);
        Add13.output.connectTo(Add12.left);
        Scale6.output.connectTo(Scale7.input);
        Structure.output.connectTo(Scale7.factor);
        Scale7.output.connectTo(SimplexPerlinD7.seed);
        SimplexPerlinD7.output.connectTo(Abs7.input);
        Abs7.output.connectTo(Multiply13.left);
        Multiply11.output.connectTo(Multiply14.left);
        amp.output.connectTo(Multiply14.right);
        Multiply14.output.connectTo(Multiply13.right);
        Multiply13.output.connectTo(Add12.right);
        Add12.output.connectTo(Add11.left);
        Scale7.output.connectTo(Scale8.input);
        Structure.output.connectTo(Scale8.factor);
        Scale8.output.connectTo(SimplexPerlinD8.seed);
        SimplexPerlinD8.output.connectTo(Abs8.input);
        Abs8.output.connectTo(Multiply16.left);
        Multiply14.output.connectTo(Multiply15.left);
        amp.output.connectTo(Multiply15.right);
        Multiply15.output.connectTo(Multiply16.right);
        Multiply16.output.connectTo(Add11.right);
        Add11.output.connectTo(VectorMerger2.x);
        Add11.output.connectTo(VectorMerger2.y);
        Add11.output.connectTo(VectorMerger2.z);
        VectorMerger2.xyz.connectTo(Remap3.input);
        Remap3.output.connectTo(Oneminus.input);
        Oneminus.output.connectTo(Gradient.gradient);
        Gradient.output.connectTo(fragmentOutput.rgb);

        // Output nodes
        this.addOutputNode(vertexOutput);
        this.addOutputNode(fragmentOutput);
        this.build();

        return this;
    }
}

/**
 * https://nme.babylonjs.com/#QPRJU9#20
 */
export class WaterFlowShader extends BABYLON.NodeMaterial {
    constructor() {
        super("node");

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

        // GradientBlock
        var Gradient = new BABYLON.GradientBlock("Gradient");
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0, new BABYLON.Color3(0.30196078431372547, 0.6274509803921569, 1)));
        Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(1, new BABYLON.Color3(0.050980392156862744, 0, 0.9568627450980393)));

        // ClampBlock
        var Clamp = new BABYLON.ClampBlock("Clamp");
        Clamp.minimum = 0;
        Clamp.maximum = 1;

        // MultiplyBlock
        var Multiply1 = new BABYLON.MultiplyBlock("Multiply");

        // TrigonometryBlock
        var Sin = new BABYLON.TrigonometryBlock("Sin");
        Sin.operation = BABYLON.TrigonometryBlockOperations.Sin;

        // DivideBlock
        var Divide = new BABYLON.DivideBlock("Divide");

        // SubtractBlock
        var Subtract = new BABYLON.SubtractBlock("Subtract");

        // MultiplyBlock
        var Multiply2 = new BABYLON.MultiplyBlock("Multiply");

        // InputBlock
        var Time = new BABYLON.InputBlock("Time");
        Time.value = 1;
        Time.min = 0;
        Time.max = 0;
        Time.isBoolean = false;
        Time.matrixMode = 0;
        Time.animationType = BABYLON.AnimatedInputBlockTypes.Time;
        Time.isConstant = false;
        Time.visibleInInspector = false;

        // InputBlock
        var waveSpeed = new BABYLON.InputBlock("waveSpeed");
        waveSpeed.value = 5;
        waveSpeed.min = 0;
        waveSpeed.max = 0;
        waveSpeed.isBoolean = false;
        waveSpeed.matrixMode = 0;
        waveSpeed.animationType = BABYLON.AnimatedInputBlockTypes.None;
        waveSpeed.isConstant = false;
        waveSpeed.visibleInInspector = false;

        // InputBlock
        var waveLength = new BABYLON.InputBlock("waveLength");
        waveLength.value = 3;
        waveLength.min = 0;
        waveLength.max = 0;
        waveLength.isBoolean = false;
        waveLength.matrixMode = 0;
        waveLength.animationType = BABYLON.AnimatedInputBlockTypes.None;
        waveLength.isConstant = false;
        waveLength.visibleInInspector = false;

        // InputBlock
        var waveHeight = new BABYLON.InputBlock("waveHeight");
        waveHeight.value = 1;
        waveHeight.min = 0;
        waveHeight.max = 0;
        waveHeight.isBoolean = false;
        waveHeight.matrixMode = 0;
        waveHeight.animationType = BABYLON.AnimatedInputBlockTypes.None;
        waveHeight.isConstant = false;
        waveHeight.visibleInInspector = false;

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
        VectorSplitter.x.connectTo(Subtract.left);
        Time.output.connectTo(Multiply2.left);
        waveSpeed.output.connectTo(Multiply2.right);
        Multiply2.output.connectTo(Subtract.right);
        Subtract.output.connectTo(Divide.left);
        waveLength.output.connectTo(Divide.right);
        Divide.output.connectTo(Sin.input);
        Sin.output.connectTo(Multiply1.left);
        waveHeight.output.connectTo(Multiply1.right);
        Multiply1.output.connectTo(Clamp.value);
        Clamp.output.connectTo(Gradient.gradient);
        Gradient.output.connectTo(Multiply.right);
        Multiply.output.connectTo(fragmentOutput.rgb);

        // Output nodes
        this.addOutputNode(vertexOutput);
        this.addOutputNode(fragmentOutput);
        this.build();

        return this;
    }
}