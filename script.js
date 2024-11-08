let w;
let h;
let canvas;
let scene;
let camera;
let renderer;
let object;

let arToolkitSource;
let arToolkitContext;

const init = () => {
  w = window.innerWidth;
  h = window.innerHeight;
  canvas = document.getElementById("canvas");
  setScene();
  setCamera();
  setObject();
  setArToolkit();
  setRenderer();
};

const setScene = () => {
  scene = new THREE.Scene();
  scene.visible = false;
};

const setCamera = () => {
  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 30);
  scene.add(camera);
};

const setArToolkit = () => {
  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: "webcam",
  });

  arToolkitSource.init(() => {
    setTimeout(() => {
      onResize();
    }, 2000);
  });

  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl:
      THREEx.ArToolkitContext.baseURL + "../data/data/camera_para.dat",
    detectionMode: "mono",
    // ※1 作ったマーカーのPattern Ratioを入れる
    //patternRatio: 0.8,
  });

  arToolkitContext.init(
    (onCompleted = () => {
      camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    })
  );

  let onRenderFcts = [];
  onRenderFcts.push(() => {
    if (arToolkitSource.ready === false) return;
    arToolkitContext.update(arToolkitSource.domElement);
    scene.visible = camera.visible;
  });

  const markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type: "pattern",
    // ※2 マーカーのpattファイルのパスを入れる
    patternUrl: THREEx.ArToolkitContext.baseURL + "../data/data/patt.hiro",
    changeMatrixMode: "cameraTransformMatrix",
  });
};

const setObject = () => {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshNormalMaterial();
  object = new THREE.Mesh(geometry, material);
  object.position.set(0, 0, 0);
  scene.add(object);
};

const setRenderer = () => {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    canvas: canvas,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(w, h);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setAnimationLoop(() => {
    render();
  });
};

const render = () => {
  if (arToolkitSource.ready) {
    arToolkitContext.update(arToolkitSource.domElement);
    scene.visible = camera.visible;
  }
  renderer.render(scene, camera);
};

const onResize = () => {
  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);
  if (arToolkitContext.arController !== null) {
    arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
  }
};

window.addEventListener("resize", () => {
  onResize();
});

window.onload = () => {
  init();
};