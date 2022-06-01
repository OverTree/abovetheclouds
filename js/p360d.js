var P360D = P360D || {};

var touchSupport = "ontouchstart" in window.document ? true : false;
var prefixes = ["webkit", "moz", "ms", "o", ""];

P360D.Stage = function () {
  (this.webglSupport = null),
    (this.clickEvent = null),
    (this.startEvent = null),
    (this.moveEvent = null),
    (this.endEvent = null),
    (this.windowHiddenEvent = null),
    (this.mobile = function () {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    });

  this.init = function () {
    this.clickEvent = touchSupport ? "touchstart" : "click";
    this.startEvent = touchSupport ? "touchstart" : "mousedown";
    this.moveEvent = touchSupport ? "touchmove" : "mousemove";
    this.endEvent = touchSupport ? "touchend" : "mouseup";
    this.windowHiddenEvent =
      this.getHiddenProperty().replace(/[H|h]idden/, "") + "visibilitychange";

    this.getWebglSupport();
  };

  this.getWebglSupport = function () {
    try {
      this.webglSupport =
        !!window.WebGLRenderingContext &&
        !!document.createElement("canvas").getContext("experimental-webgl");
    } catch (error) {
      return false;
    }
  };

  this.windowHidden = function () {
    return document[this.getHiddenProperty()] || false;
  };

  this.disabledTouch = function (domElement) {
    var _domElement = domElement === undefined ? window.document : domElement;
    _domElement.addEventListener(
      "touchstart",
      function (event) {
        event.preventDefault();
      },
      false
    );
    _domElement.addEventListener(
      "touchmove",
      function (event) {
        event.preventDefault();
      },
      false
    );
    _domElement.addEventListener(
      "touchend",
      function (event) {
        event.preventDefault();
      },
      false
    );
  };

  this.enabledTouch = function (domElement) {
    var _domElement = domElement === undefined ? window.document : domElement;
    _domElement.addEventListener(
      "touchstart",
      function (event) {
        return true;
      },
      true
    );
    _domElement.addEventListener(
      "touchmove",
      function (event) {
        return true;
      },
      true
    );
    _domElement.addEventListener(
      "touchend",
      function (event) {
        return true;
      },
      true
    );
  };

  this.disabledScroll = function (domElement) {
    var _domElement = domElement === undefined ? window.document : domElement;
    _domElement.addEventListener(
      MouseEvent.MOUSE_WHEEL,
      function (event) {
        event.preventDefault();
      },
      false
    );
    _domElement.addEventListener(
      MouseEvent.DOM_MOUSE_SCROLL,
      function (event) {
        event.preventDefault();
      },
      false
    );
  };

  this.addEventListener = function (event, callback, useCapture) {
    if (event === "fullscreenchange") {
      document.addEventListener("fullscreenchange", callback, useCapture);
      document.addEventListener("mozfullscreenchange", callback, useCapture);
      document.addEventListener("webkitfullscreenchange", callback, useCapture);
      document.addEventListener("msfullscreenchange", callback, useCapture);
    } else {
      document.addEventListener(event, callback, useCapture);
    }
  };

  this.removeEventListener = function (event, callback, useCapture) {
    if (event === "fullscreenchange") {
      document.removeEventListener("fullscreenchange", callback, useCapture);
      document.removeEventListener("mozfullscreenchange", callback, useCapture);
      document.removeEventListener(
        "webkitfullscreenchange",
        callback,
        useCapture
      );
      document.removeEventListener("msfullscreenchange", callback, useCapture);
    } else {
      document.removeEventListener(event, callback, useCapture);
    }
  };

  this.getHiddenProperty = function () {
    if ("hidden" in document) return "hidden";

    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + "Hidden" in document) return prefixes[i] + "Hidden";
    }
    return null;
  };

  this.getScreenType = function () {
    var mediaScreen = "desktop";

    if (screen.availWidth > 640 && screen.availWidth <= 1024) {
      mediaScreen = "tablet";
    } else if (screen.availWidth <= 640 || screen.availHeight <= 362) {
      mediaScreen = "phone";
    } else if (screen.availWidth > 1014) {
      mediaScreen = "desktop";
    }

    return mediaScreen;
  };

  this.init();
};

P360D.DOM = function () {};

P360D.DOM.div = function (id) {
  if (document.getElementById(id) == null) {
    var _div = document.createElement("div");
    _div.id = id;
    return _div;
  } else {
    return document.getElementById(id);
  }
};

P360D.DOM.canvas = function (id) {
  if (document.getElementById(id) == null) {
    var _canvas = document.createElement("canvas");
    _canvas.id = id;
    return _canvas;
  } else {
    return document.getElementById(id);
  }
};

P360D.DOM.element = function (domElementName, id) {
  var _element = document.createElement(domElementName);
  _element.id = id;
  return _element;
};

// PlanetMaker: http://planetmaker.wthr.us/
P360D.InsideGlowMaterial = function (
  color,
  aperture,
  scale,
  useLight,
  opacity
) {
  THREE.ShaderMaterial.call(this);

  var scope = this;
  var _color =
    color === undefined ? new THREE.Color("#95D3F4") : new THREE.Color(color);
  var _aperture = aperture === undefined ? 0.9999999999 : aperture;
  var _scale = scale === undefined ? 0.5555555555 : scale;
  var _useLight = useLight === undefined ? true : useLight;

  var vector = new THREE.Vector4(_color.r, _color.g, _color.b, 0.1);

  scope.uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib["lights"],
    {
      uColor: { type: "v4", value: vector },
      viewVector: { type: "v3", value: new THREE.Vector4(1.0, 1.0, 1.0, 1.0) },
      uTop: { type: "f", value: _aperture }, //0.94 },
      uPower: { type: "f", value: _scale }, //0.65555555555 },
      usingDirectionalLighting: { type: "i", value: _useLight },
    },
  ]);

  scope.vertexShader = [
    "uniform vec3 viewVector;",
    "attribute vec4 tangent;",
    "varying vec3 vNormal; ",
    "varying float intensity;",
    "uniform float uTop;",
    "uniform float uPower;",

    "void main() {",

    "vNormal = normalize( normalMatrix * normal );",
    "vec3 vNormel = normalize( normalMatrix * viewVector );",
    "intensity = pow( uTop - dot(vNormal, vNormel), uPower );",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}",
  ].join("\n");

  scope.fragmentShader = [
    "uniform vec4 uColor;",
    "varying vec3 vNormal;",
    "varying float intensity;",
    "uniform bool usingDirectionalLighting;",

    "#if MAX_DIR_LIGHTS > 0",

    "uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
    "uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",

    "#endif",

    "void main() {",

    "vec3 dirDiffuse = vec3( 0.0 );",
    "vec3 dirSpecular = vec3( 0.0 );",

    "#if MAX_DIR_LIGHTS > 0",

    "if ( usingDirectionalLighting ) {",

    "for ( int i = 0; i < MAX_DIR_LIGHTS; i++ ) {",

    "vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
    "vec3 dirVector = normalize( lDirection.xyz );",

    "float directionalLightWeightingFull = max( dot( vNormal, dirVector ), 0.0 );",
    "float directionalLightWeightingHalf = max( 10.0 * dot( vNormal, dirVector ) + 0.5, 0.0 );",
    "vec3 dirDiffuseWeight = mix( vec3( directionalLightWeightingFull ), vec3( directionalLightWeightingHalf ), uColor.xyz );",

    "dirDiffuse += dirDiffuseWeight;",

    "}",

    "} else {",

    "dirDiffuse = vec3( 1.0 );",

    "}",

    "#else",

    "dirDiffuse = vec3( 1.0 );",

    "#endif",

    "gl_FragColor = intensity * intensity * vec4( dirDiffuse, 1.0 );",

    "}",
  ].join("\n");

  scope.transparent = true;
  scope.blending = THREE.AdditiveBlending;
  scope.depthWrite = false;
  //	scope.alphaTest = 0.9;
  scope.depthTest = true;
  scope.needsUpdate = true;
  scope.lights = true;
};

P360D.InsideGlowMaterial.prototype = Object.create(
  THREE.ShaderMaterial.prototype
);

// https://stemkoski.github.io/Three.js/
P360D.OutsideGlowMaterial = function (color, aperture, scale, opacity) {
  THREE.ShaderMaterial.call(this);

  var scope = this;

  scope.uniforms = {
    aperture: { type: "f", value: aperture },
    scale: { type: "f", value: scale },
    color: { type: "c", value: new THREE.Color(color) },
    opacity: { type: "f", value: opacity },
  };

  scope.vertexShader = [
    "varying vec3 vVertexWorldPosition;",
    "varying vec3 vVertexNormal;",

    "void main(){",

    "vVertexNormal = normalize( normalMatrix * normal );",
    "vVertexWorldPosition = ( modelMatrix * vec4( position, 1.0 ) ).xyz;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}",
  ].join("\n");

  scope.fragmentShader = [
    "uniform vec3 color;",
    "uniform float aperture;",
    "uniform float scale;",
    "uniform float opacity;",

    "varying vec3 vVertexNormal;",
    "varying vec3 vVertexWorldPosition;",

    "void main() {",

    "vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;",
    "vec3 viewCameraToVertex = ( viewMatrix * vec4( worldCameraToVertex, 0.0 ) ).xyz;",
    "viewCameraToVertex	= normalize( viewCameraToVertex );",
    "float intensity = pow( aperture + dot( vVertexNormal, viewCameraToVertex ), scale );",
    "gl_FragColor = vec4( color, intensity ) * opacity;",

    "}",
  ].join("\n");

  scope.transparent = true;
  //	scope.alphaTest = 0.9;
  scope.depthWrite = false;
  scope.needsUpdate = true;
  scope.side = THREE.BackSide;
};

P360D.OutsideGlowMaterial.prototype = Object.create(
  THREE.ShaderMaterial.prototype
);

P360D.EarthMaterial = function (diffuse, bumpMap, specularMap) {
  THREE.MeshPhongMaterial.call(this);

  var scope = this;

  scope.map = diffuse || null;
  scope.bumpMap = bumpMap || null;
  scope.specularMap = specularMap || null;
  scope.shininess = 40;
  scope.bumpScale = 2.0;
  scope.specular.setStyle("#141310");
};

P360D.EarthMaterial.prototype = Object.create(
  THREE.MeshPhongMaterial.prototype
);

P360D.CloudsMaterial = function (diffuse) {
  THREE.MeshLambertMaterial.call(this);

  var scope = this;

  scope.map = diffuse || null;
  scope.transparent = true;
  scope.depthWrite = false;
  scope.opacity = 0.6;
};

P360D.CloudsMaterial.prototype = Object.create(
  THREE.MeshLambertMaterial.prototype
);

P360D.NightLightsMaterial = function (diffuse) {
  THREE.MeshLambertMaterial.call(this);

  var scope = this;

  scope.map = diffuse || null;
  scope.color.setStyle("#f1ba3c");
  scope.opacity = 1;
  scope.side = THREE.BackSide;
  scope.transparent = true;
  //	scope.alphaTest = 0.1;
  scope.depthWrite = false;
  scope.blending = THREE.AdditiveBlending;
  scope.blendDst = THREE.OneFactor;
  scope.blendSrc = THREE.OneFactor;
};

P360D.NightLightsMaterial.prototype = Object.create(
  THREE.MeshLambertMaterial.prototype
);

P360D.LoadingScreen = function () {
  var scope = this;

  scope.domElement = P360D.DOM.div("loadingScreen");

  var fakeLoading = P360D.DOM.div("fakeLoading");
  scope.domElement.appendChild(fakeLoading);

  scope.beginButton = P360D.DOM.div("beginButton");
  scope.domElement.appendChild(scope.beginButton);

  scope.loadingText = P360D.DOM.div("loadingText");
  scope.loadingText.innerHTML = "LOADING";
  scope.domElement.appendChild(scope.loadingText);
};

P360D.Earth = function (diffuse, bumpMap, specularMap, cloudsMap, nightMap) {
  THREE.Object3D.call(this);

  var scope = this;

  var radius = 250;
  var segments = 5;

  var earth = new THREE.Object3D();
  earth.rotation.z = THREE.Math.degToRad(23);
  scope.add(earth);

  // EARTH
  var earthMaterial = new P360D.EarthMaterial(diffuse, bumpMap, specularMap);
  var earthGeometry = new THREE.OctahedronGeometry(radius, segments);
  var earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.rotation.y = THREE.Math.degToRad(180);
  earth.add(earthMesh);

  // Clouds
  var cloudsMaterial = new P360D.CloudsMaterial(cloudsMap);
  var cloudsGeometry = new THREE.OctahedronGeometry(radius + 0.3, segments);
  var clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
  clouds.rotation.y = THREE.Math.degToRad(180);
  scope.add(clouds);

  // Night lights
  var nightMaterial = new P360D.NightLightsMaterial(nightMap);

  var nightGeometry = new THREE.OctahedronGeometry(radius, segments);
  nightGeometry.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
  var night = new THREE.Mesh(nightGeometry, nightMaterial);
  night.rotation.y = THREE.Math.degToRad(180);
  earth.add(night);

  // Atmosphere
  var atmosphere = new P360D.Atmosphere(radius, segments);
  // scope.add(atmosphere);

  // Exports
  scope.earth = earthMesh;
  scope.night = night;
  scope.clouds = clouds;
  scope.nightMaterial = nightMaterial;
  scope.atmosphere = atmosphere;
  scope.clock = new THREE.Clock();
};

P360D.Earth.prototype = Object.create(THREE.Object3D.prototype);

P360D.Earth.prototype.update = function (speed, camera) {
  // Earth rotations
  if (speed === 0) {
    this.clouds.rotation.x += 0.00005;
  } else if (speed > 0) {
    this.earth.rotation.y += speed;
    this.night.rotation.y += speed;
    this.clouds.rotation.y += speed + 0.00005;
  }

  this.atmosphere.update(camera);
};

P360D.Atmosphere = function (radius, segments) {
  THREE.Object3D.call(this);

  var scope = this;

  var inGeometry = new THREE.OctahedronGeometry(radius + 0.6, segments);
  inGeometry.computeTangents();

  var outGeometry = new THREE.OctahedronGeometry(radius + 6.0, segments);
  outGeometry.computeTangents();

  var inMaterial = new P360D.InsideGlowMaterial("#000000", .8, 1.2);
  var outMaterial = new P360D.OutsideGlowMaterial("#00a6ff", 0.76, 10.0, .8);

  var inMesh = new THREE.Mesh(inGeometry, inMaterial);
  inMesh.flipSided = true;
  inMesh.matrixAutoUpdate = false;
  inMesh.updateMatrix();

  var outMesh = new THREE.Mesh(outGeometry, outMaterial);
  outMesh.position.set(1, 0, 0);

  scope.add(inMesh);
  scope.add(outMesh);

  scope.material = inMaterial;
};

P360D.Atmosphere.prototype = Object.create(THREE.Object3D.prototype);

P360D.Atmosphere.prototype.update = function (camera) {
  this.material.uniforms.viewVector.value = camera.position;
};

P360D.OrbitScene = function (earthTextures) {
  THREE.Object3D.call(this);
  this.earthTextures = earthTextures;
  var scope = this;
  scope.earth = new P360D.Earth(
    earthTextures[0],
    earthTextures[1],
    earthTextures[2],
    earthTextures[3],
    earthTextures[4]
  );
  scope.add(scope.earth);
};

P360D.OrbitScene.prototype = Object.create(THREE.Object3D.prototype);

P360D.OrbitScene.prototype.update = function (speed, camera) {
  this.earth.update(speed, camera);
};
