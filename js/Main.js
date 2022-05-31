// @author ivanmoreno

window.addEventListener("load", lateInit, false);

var browser;

var stats;
var path = "";
var guiPath = "";

var viewport, cameraOrbit, scene, renderer, controls;

var earthOrbit;

var orbit = new THREE.Object3D();

var speed = 0.0006;

var VIEW_HEIGHT = window.innerHeight;
var VIEW_WIDTH = window.innerWidth;

var postprocessing, renderTarget, renderTargetParameters;

var wrapper;

var postEnabled = true;
var isRendering = false;

var isMobile;

// var scenes = [];

var sceneTake = SceneTypes.ORBIT;

function lateInit() {
  browser = new P360D.Stage();
  isMobile = browser.mobile();

  if (isMobile) {
    path = "textures/mobile/";
  } else {
    path = "textures/desktop/";
  }

  if (window.devicePixelRatio > 1) {
    guiPath = "gui/retina/";
  } else {
    guiPath = "gui/regular/";
  }

  var loadingScreen;

  var loadingImage = new Image();
  loadingImage.src = guiPath + "loadingScreen.jpg";
  loadingImage.addEventListener("load", onLoadingImageLoaded, false);

  function onLoadingImageLoaded() {
    chromeExpImg = new Image();
    chromeExpImg.src = guiPath + "b4.png";
    chromeExpImg.addEventListener("load", onChromeExpIcon, false);

    function onChromeExpIcon() {
      loadingScreen = new P360D.LoadingScreen(
        loadingImage,
        chromeExpImg,
        browser
      );
      document.body.appendChild(loadingScreen.domElement);
      TweenMax.to(loadingScreen.domElement, 0.4, {
        opacity: 1.0,
        onComplete: function () {
          imgLoader.start();
        },
      });
    }
  }

  var imagesURL = [
    // Gallaxy skybox
    path + "skybox/posX.jpg",
    path + "skybox/negX.jpg",
    path + "skybox/posY.jpg",
    path + "skybox/negY.jpg",
    path + "skybox/posZ.jpg",
    path + "skybox/negZ.jpg",
    // Flares
    path + "flares/flare1.jpg",
    path + "flares/flare2.jpg",
    path + "flares/flare3.jpg",
    path + "flares/flare4.jpg",
    path + "flares/flare5.jpg",
    // Earth Orbit textures
    path + "earth/diffuse.jpg",
    path + "earth/bump.jpg",
    path + "earth/specular.jpg",
    path + "earth/clouds.png",
    path + "earth/night.jpg",
    path + "earth/moon.jpg",
    path + "earth/storm.png",
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
  cameraOrbit.position.set(841, -429, -500);
  controls.zoomSpeed = 0.07;
  controls.distance = 900;
  controls.minDistance = 900;
  controls.maxDistance = 1120;
  controls.enabledAll(false);

  scene.add(orbit);

  var ambientLight = new THREE.AmbientLight(0x07215c);
  ambientLight.color.setRGB(0.02, 0.02, 0.07);
  scene.add(ambientLight);

  var sunLight = new THREE.PointLight(0xe8f7ff, 1.2);
  var sunLight1 = new THREE.DirectionalLight(0x000000, 0.0);
  sunLight.position.set(10000, 0, 0);
  sunLight1.position.set(1, 0, 0).normalize();
  scene.add(sunLight);
  scene.add(sunLight1);

  wrapper = P360D.DOM.div("wrapper");
  document.body.appendChild(wrapper);

  wrapper.appendChild(viewport);

  browser.disabledTouch();


  var imagesLoaded = [],
    flareTextures = [],
    earthTextures = [],
    cubeTextures = [];

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

      if (i >= 0 && i <= 5) {
        var cubeTexture = new THREE.Texture(imagesLoaded[i]);
        cubeTexture.anisotropy = 8;
        cubeTexture.needsUpdate = true;
        cubeTextures.push(cubeTexture);
      }

      if (i >= 6 && i <= 10) {
        var flareTexture = new THREE.Texture(imagesLoaded[i]);
        flareTexture.anisotropy = 8;
        flareTexture.needsUpdate = true;
        flareTextures.push(flareTexture);
      }

      if (i >= 11 && i <= 17) {
        var earthTexture = new THREE.Texture(imagesLoaded[i]);
        earthTexture.anisotropy = 8;
        earthTexture.needsUpdate = true;
        earthTextures.push(earthTexture);
      }
    }

    //LENS FLARES
    var lensFlare = new THREE.LensFlare(
      flareTextures[0],
      400,
      0.0,
      THREE.AdditiveBlending
    );

    lensFlare.add(flareTextures[4], 900, 0.0, THREE.AdditiveBlending);

    lensFlare.add(flareTextures[2], 70, 0.1, THREE.AdditiveBlending);
    lensFlare.add(flareTextures[1], 80, 0.2, THREE.AdditiveBlending);
    lensFlare.add(
      flareTextures[3],
      220,
      0.3,
      THREE.AdditiveBlending,
      new THREE.Color("#0033ff")
    );
    lensFlare.add(
      flareTextures[1],
      100,
      0.4,
      THREE.AdditiveBlending,
      new THREE.Color("#004422")
    );
    lensFlare.add(
      flareTextures[1],
      310,
      0.5,
      THREE.AdditiveBlending,
      new THREE.Color("#6600cc")
    );
    lensFlare.add(
      flareTextures[3],
      490,
      0.6,
      THREE.AdditiveBlending,
      new THREE.Color("#003300")
    );
    lensFlare.add(
      flareTextures[2],
      150,
      0.6,
      THREE.AdditiveBlending,
      new THREE.Color("#0033ff")
    );
    lensFlare.add(
      flareTextures[3],
      700,
      0.9,
      THREE.AdditiveBlending,
      new THREE.Color("#ffffff")
    );

    lensFlare.customUpdateCallback = lensFlareCallback;
    lensFlare.position.copy(sunLight.position);
    scene.add(lensFlare);

    earthOrbit = new P360D.OrbitScene(cubeTextures, earthTextures);
    orbit.add(earthOrbit);
    orbit.visible = false;

    renderer.render(scene, cameraOrbit);
    backLoad();
  }

  function backLoad() {
    TweenMax.to(loadingScreen.domElement, 0.6, {
      opacity: 0.0,
      onComplete: function () {
        document.body.removeChild(loadingScreen.domElement);
        loadingScreen.domElement = null;
        loadingScreen = null;
        isRendering = true;

        orbit.visible = true;
        sceneTake = SceneTypes.ORBIT;
        controls.enabledAll(true);
        postEnabled = false;

        render();
      },
    });
  }

  function lensFlareCallback(object) {
    var flare;
    var vecX = -object.positionScreen.x * 2;
    var vecY = -object.positionScreen.y * 2;

    for (var f = 0; f < object.lensFlares.length; f++) {
      flare = object.lensFlares[f];

      flare.x = object.positionScreen.x + vecX * flare.distance;
      flare.y = object.positionScreen.y + vecY * flare.distance;

      flare.rotation = 0;
    }

    object.lensFlares[4].rotation = THREE.Math.degToRad(180);
    object.lensFlares[8].rotation = THREE.Math.degToRad(90);
  }

  //POSTPROCESSING
  // var copyShader = new THREE.ShaderPass(THREE.CopyShader);
  // copyShader.renderToScreen = true;

  // renderTargetParameters = {
  //   minFilter: THREE.LinearFilter,
  //   magFilter: THREE.LinearFilter,
  //   format: THREE.RGBAFormat,
  //   stencilBufer: true,
  // };
  // renderTarget = new THREE.WebGLRenderTarget(
  //   VIEW_WIDTH,
  //   VIEW_HEIGHT,
  //   renderTargetParameters
  // );

  // var vignettePass = new THREE.ShaderPass(THREE.VignetteShader);
  // vignettePass.uniforms["darkness"].value = 100.0;
  // vignettePass.uniforms["offset"].value = 100.0;

  // var hblur = new THREE.ShaderPass(THREE.HorizontalBlurShader);
  // hblur.uniforms["h"].value = 2.0 / 512;
  // var vblur = new THREE.ShaderPass(THREE.VerticalBlurShader);
  // vblur.uniforms["v"].value = 2.0 / 512;

  // postprocessing = new P360D.Postprocessing(
  //   scene,
  //   cameraOrbit,
  //   renderer,
  //   renderTarget
  // );
  // postprocessing.addFX(vignettePass);
  // postprocessing.addFX(hblur);
  // postprocessing.addFX(vblur);
  // postprocessing.addFX(copyShader);

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

  // renderTarget.setSize(VIEW_WIDTH, VIEW_HEIGHT);
  // postprocessing.composer.reset(renderTarget);
  // postprocessing.composer.setSize(VIEW_WIDTH, VIEW_HEIGHT);

  renderer.render(scene, cameraOrbit);
}

function render() {
  requestAnimationFrame(render);

  if (isRendering) {
    if (controls) {
      controls.update();
    }

    earthOrbit.update(speed, cameraOrbit);
    renderer.render(scene, cameraOrbit);
  }
}
