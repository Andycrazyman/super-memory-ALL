// Week 4 Babylon.js scene
const canvas = document.getElementById("renderCanvas");

if (canvas && window.BABYLON) {
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.04, 0.06, 0.12, 1);

  const camera = new BABYLON.ArcRotateCamera(
    "camera", -Math.PI / 2, Math.PI / 3, 7,
    BABYLON.Vector3.Zero(), scene
  );
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight(
    "light", new BABYLON.Vector3(0, 1, 0), scene
  );
  light.intensity = 1.1;

  BABYLON.MeshBuilder.CreateGround("ground", { width: 8, height: 8 }, scene);

  const sphere = BABYLON.MeshBuilder.CreateSphere(
    "sphere", { diameter: 2, segments: 32 }, scene
  );
  sphere.position.y = 1;

  const status = document.getElementById("scene-status");
  if (status) status.textContent = "Interactive Week 4 scene ready.";

  const reset = document.getElementById("reset-view");
  if (reset) {
    reset.disabled = false;
    reset.onclick = () => {
      camera.alpha = -Math.PI / 2;
      camera.beta = Math.PI / 3;
      camera.radius = 7;
      camera.target = BABYLON.Vector3.Zero();
    };
  }

  engine.runRenderLoop(() => scene.render());
  window.addEventListener("resize", () => engine.resize());
} else {
  const status = document.getElementById("scene-status");
  if (status) status.textContent = "The 3D library could not load.";
}
