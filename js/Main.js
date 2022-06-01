// @author ivanmoreno

window.addEventListener("load", lateInit, false);

var browser;

var path = "";

var viewport, cameraOrbit, scene, renderer, controls;

var earthOrbit;

var speed = 0.001;

var VIEW_HEIGHT = window.innerHeight;
var VIEW_WIDTH = window.innerWidth;

var postprocessing, renderTarget, renderTargetParameters;

var wrapper;

var isRendering = true;

// var scenes = [];

function lateInit() {
  browser = new P360D.Stage();
  path = "textures/desktop/";

  var loadingScreen = new P360D.LoadingScreen();
  document.body.appendChild(loadingScreen.domElement);
  TweenMax.to(loadingScreen.domElement, 0.4, {
    opacity: 1.0,
    onComplete: function () {
      imgLoader.start();
    },
  });

  var imagesURL = [
    // Earth Orbit textures
    path + "earth/diffuse.jpg",
    path + "earth/bump.jpg",
    path + "earth/specular.jpg",
    path + "earth/clouds.png",
    path + "earth/night.jpg",
  ];

  viewport = P360D.DOM.div("viewport");
  viewport.style.position = "absolute";

  scene = new THREE.Scene();

  cameraOrbit = new THREE.PerspectiveCamera(
    40,
    VIEW_WIDTH / VIEW_HEIGHT,
    1,
    40000
  );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(VIEW_WIDTH, VIEW_HEIGHT);
  renderer.setClearColor(0x000000, 1);
  renderer.sortObjects = false;
  viewport.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(cameraOrbit, viewport);
  cameraOrbit.position.set(
    -49.437098958727915,
    604.1678835313752,
    -477.4532156787878
  );
  controls.zoomSpeed = 0.1;
  controls.distance = 500;
  controls.minDistance = 400;
  controls.maxDistance = 900;
  controls.enabledAll(false);

  var ambientLight = new THREE.AmbientLight(0x07215c);
  ambientLight.color.setRGB(0.02, 0.02, 0.07);
  scene.add(ambientLight);

  var sunLight = new THREE.PointLight(0xffffff, 0.9);
  var sunLight2 = new THREE.PointLight(0xffffff, 0.9);
  // var sunLight1 = new THREE.DirectionalLight(0x000000, 0.2);
  sunLight.position.set(10000, 0, 0);
  sunLight2.position.set(10000, 0, 2500);

  // sunLight1.position.set(1, 0, 0).normalize();
  scene.add(sunLight);
  scene.add(sunLight2);
  // scene.add(sunLight1);

  wrapper = P360D.DOM.div("wrapper");
  document.body.appendChild(wrapper);

  wrapper.appendChild(viewport);

  browser.disabledTouch();

  var imagesLoaded = [],
    earthTextures = [];

  var imgLoader = new PxLoader();

  for (var i = 0, il = imagesURL.length; i < il; i++) {
    var imageLoaded = imgLoader.addImage(imagesURL[i]);
    imagesLoaded.push(imageLoaded);
  }

  imgLoader.addEventListener("progress", imageLoaderProgress);
  imgLoader.addEventListener("complete", imageLoaderComplete);

  function imageLoaderProgress(event) {
    var percentage = 200;

    if (event.totalCount) {
      percentage = Math.floor(
        (percentage * event.completedCount) / event.totalCount
      );
      loadingScreen.beginButton.style.width = percentage + "px";
    }
  }

  function imageLoaderComplete() {
    var cross = undefined;

    for (var i = 0, il = imagesLoaded.length; i < il; i++) {
      imagesLoaded[i].crossOrigin = cross;

      if (i >= 0 && i <= 4) {
        var earthTexture = new THREE.Texture(imagesLoaded[i]);
        earthTexture.anisotropy = 8;
        earthTexture.needsUpdate = true;
        earthTextures.push(earthTexture);
      }
    }

    earthOrbit = new P360D.OrbitScene(earthTextures);
    scene.add(earthOrbit);

    controls.enabledAll(true);
    render();
    backLoad();
  }

  function backLoad() {
    TweenMax.to(loadingScreen.domElement, 0.6, {
      opacity: 0.0,
      onComplete: function () {
        document.body.removeChild(loadingScreen.domElement);
        loadingScreen.domElement = null;
        loadingScreen = null;
      },
    });
  }

  window.addEventListener("resize", resize, false);
  document.addEventListener(browser.windowHiddenEvent, windowHidden, false);

  function windowHidden(event) {
    if (browser.windowHidden()) {
      isRendering = false;
    } else {
      isRendering = true;
    }
  }
}

function resize(/* event */) {
  VIEW_WIDTH = window.innerWidth;
  VIEW_HEIGHT = window.innerHeight;

  cameraOrbit.aspect = window.innerWidth / window.innerHeight;
  cameraOrbit.updateProjectionMatrix();
  renderer.setSize(VIEW_WIDTH, VIEW_HEIGHT);
}

function render() {
  requestAnimationFrame(render);

  if (isRendering) {
    controls.update();
    earthOrbit.update(speed, cameraOrbit);
    renderer.render(scene, cameraOrbit);
  }
}
