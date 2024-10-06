var ASSETS_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/122460/';

var Utils = {
    windowRatio: function () {
        return window.innerWidth / window.innerHeight;
    }
};

var Renderer = (function () {
    var _Renderer = function () {
        var params = {
            webGLRenderer: {
                antialias: false,
                alpha: true,
                clearColor: 0x000000,
                canvasId: 'canvas-earth'
            }
        };

        this.init = function () {
            this.webGLRenderer = new THREE.WebGLRenderer({
                antialias: params.webGLRenderer.antialias,
                alpha: params.webGLRenderer.alpha
            });

            this.webGLRenderer.setClearColor(params.webGLRenderer.clearColor);
            this.webGLRenderer.setPixelRatio(window.devicePixelRatio);
            this.webGLRenderer.domElement.id = params.webGLRenderer.canvasId;

            this.renderView();
        };

        this.renderView = function () {
            this.view = document.body;
            this.view.appendChild(this.webGLRenderer.domElement);
            this.updateSize();
        };

        this.updateSize = function () {
            this.webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        };

        this.init();
    };

    return new _Renderer();
})();

var Camera = (function () {
    var _Camera = function () {
        var params = {
            perspectiveCamera: {
                positionX: 0,
                positionY: 0,
                positionZ: 150,
                fov: 63,
                near: 1,
                far: 8000
            }
        };

        this.init = function () {
            this.perspectiveCamera = new THREE.PerspectiveCamera(
                params.perspectiveCamera.fov,
                Utils.windowRatio(),
                params.perspectiveCamera.near,
                params.perspectiveCamera.far
            );

            this.perspectiveCamera.position.set(
                params.perspectiveCamera.positionX,
                params.perspectiveCamera.positionY,
                params.perspectiveCamera.positionZ
            );
        };

        this.updateAspect = function () {
            this.perspectiveCamera.aspect = Utils.windowRatio();
            this.perspectiveCamera.updateProjectionMatrix();
        };

        this.updateLookAt = function (target) {
            this.perspectiveCamera.lookAt(target);
        };

        this.init();
    };

    return new _Camera();
})();

var Skymap = (function () {
    var _Skymap = function () {
        var params = {
            imgDef: 'hd',
            cubeTextureLoader: {
                positionTag: '{pos}',
                positions: ['posx', 'negx', 'posy', 'negy', 'posz', 'negz'],
                filename: {
                    sd: 'skymap_{pos}_512x512.jpg',
                    hd: 'skymap_{pos}_1024x1024.jpg'
                }
            }
        };

        this.init = function () {
        };

        this.setSceneBgCubeTexture = function (_scene) {
            _scene.background = this.getCubeTextureLoader();
        };

        this.getCubeTextureLoader = function () {
            return new THREE.CubeTextureLoader()
                .setPath(ASSETS_PATH)
                .load(this.getFilenames());
        };

        this.getFilenames = function () {
            var filenames = [];

            for (var i = 0; i < params.cubeTextureLoader.positions.length; i++) {
                filenames.push(
                    this.getFilename(params.cubeTextureLoader.positions[i])
                );
            }

            return filenames;
        };

        this.getFilename = function (position) {
            return params.cubeTextureLoader.filename[params.imgDef].replace(
                params.cubeTextureLoader.positionTag,
                position
            );
        };

        this.init();
    };

    return new _Skymap();
})();

var Cloud = (function () {
    var _Cloud = function () {
        var params = {
            imgDef: 'hd',
            visible: true,
            material: {
                wireframe: false,
                transparent: true,
                color: 0xffffff,
                bumpScale: 0.13,
                opacity: 0.9,
                alphaMap: {
                    sd: ASSETS_PATH + 'earth_clouds_1024x512.jpg',
                    hd: ASSETS_PATH + 'earth_clouds_2048x1024.jpg'
                },
                bumpMap: {
                    sd: ASSETS_PATH + 'earth_clouds_1024x512.jpg',
                    hd: ASSETS_PATH + 'earth_clouds_2048x1024.jpg'
                }
            },
            geometry: {
                radius: 50.3,
                widthSegments: 64,
                heightSegments: 32
            },
            animate: {
                enabled: true,
                rotationsYPerSecond: -0.0012
            }
        };

        this.init = function () {
            this.material = new THREE.MeshPhongMaterial({
                wireframe: params.material.wireframe,
                color: params.material.color,
                opacity: params.material.opacity,
                transparent: params.material.transparent,
                bumpScale: params.material.bumpScale
            });

            this.setMaterialTextures();

            this.geometry = new THREE.SphereGeometry(
                params.geometry.radius,
                params.geometry.widthSegments,
                params.geometry.heightSegments
            );


            this.cloudMesh = new THREE.Mesh(this.geometry, this.material);
            this.cloudMesh.visible = params.visible;
        };


        this.animate = function (delta) {
            if (params.animate.enabled) {
                this.cloudMesh.rotation.y += delta * 2 * Math.PI * params.animate.rotationsYPerSecond;
            }
        };

        this.setMaterialTextures = function () {
            this.material.alphaMap = new THREE.TextureLoader().load(params.material.alphaMap[params.imgDef]);
            this.material.bumpMap = new THREE.TextureLoader().load(params.material.bumpMap[params.imgDef]);
        };

        this.init();
    };

    return new _Cloud();
})();

var Earth = (function (Cloud) {
    var _Earth = function () {
        var params = {
            imgDef: 'hd',
            visible: true,
            material: {
                wireframe: false,
                map: {
                    sd: ASSETS_PATH + 'earth_map_1024x512.jpg',
                    hd: ASSETS_PATH + 'earth_map_2048x1024.jpg'
                },
                bumpMap: {
                    sd: ASSETS_PATH + 'earth_bump_1024x512.jpg',
                    hd: ASSETS_PATH + 'earth_bump_2048x1024.jpg'
                },
                bumpScale: 0.45,
                specularMap: {
                    sd: ASSETS_PATH + 'earth_specular_1024x512.jpg',
                    hd: ASSETS_PATH + 'earth_specular_2048x1024.jpg'
                },
                specular: 0x2d4ea0,
                shininess: 6
            },
            geometry: {
                radius: 50,
                widthSegments: 64,
                heightSegments: 32
            },
            animate: {
                enabled: true,
                rotationsYPerSecond: 0.01
            }
        };

        this.init = function () {
            this.geometry = new THREE.SphereGeometry(
                params.geometry.radius,
                params.geometry.widthSegments,
                params.geometry.heightSegments
            );

            this.material = new THREE.MeshPhongMaterial({
                wireframe: params.material.wireframe,
                bumpScale: params.material.bumpScale,
                specular: params.material.specular,
                shininess: params.material.shininess
            });

            this.setMaterialTextures();

            this.earthMesh = new THREE.Mesh(this.geometry, this.material);
            this.earthMesh.visible = params.visible;

            this.earthMesh.add(Cloud.cloudMesh);
        };

        this.animate = function (delta) {
            if (params.animate.enabled) {
                this.earthMesh.rotation.y += delta * 2 * Math.PI * params.animate.rotationsYPerSecond;
            }
        };

        this.setMaterialTextures = function () {
            this.material.map = new THREE.TextureLoader().load(params.material.map[params.imgDef]);
            this.material.bumpMap = new THREE.TextureLoader().load(params.material.bumpMap[params.imgDef]);
            this.material.specularMap = new THREE.TextureLoader().load(params.material.specularMap[params.imgDef]);
        };

        this.init();
    };

    return new _Earth();
})(Cloud);

var Moon = (function (Earth) {
    var _Moon = function () {
        var params = {
            imgDef: 'hd',
            moonMesh: {
                visible: true,
                position: {
                    x: 0,
                    y: 0,
                    z: -100,
                },
            },
            material: {
                wireframe: false,
                map: {
                    sd: ASSETS_PATH + 'moon_map_512x256.jpg',
                    hd: ASSETS_PATH + 'moon_map_1024x512.jpg'
                },
                bumpMap: {
                    sd: ASSETS_PATH + 'moon_bump_512x256.jpg',
                    hd: ASSETS_PATH + 'moon_bump_1024x512.jpg'
                },
                bumpScale: 0.1,
                shininess: 0
            },
            geometry: {
                radius: 10,
                widthSegments: 32,
                heightSegments: 16
            },
            animate: {
                enabled: true,
                pivotRotationsPerSecond: 0.05
            }
        };

        this.init = function () {
            this.geometry = new THREE.SphereGeometry(
                params.geometry.radius,
                params.geometry.widthSegments,
                params.geometry.heightSegments
            );

            this.material = new THREE.MeshPhongMaterial({
                wireframe: params.material.wireframe,
                bumpScale: params.material.bumpScale,
                shininess: params.material.shininess
            });

            this.setMaterialTextures();

            this.moonMesh = new THREE.Mesh(this.geometry, this.material);

            this.moonMesh.position.set(
                params.moonMesh.position.x,
                params.moonMesh.position.y,
                params.moonMesh.position.z
            );

            this.moonMesh.visible = params.moonMesh.visible;
            this.pivot = this.createPivot();
        };


        this.createPivot = function () {
            var pivot = new THREE.Object3D();
            pivot.position = Earth.earthMesh.position;
            pivot.add(this.moonMesh);

            return pivot;
        };

        this.animate = function (delta) {
            if (params.animate.enabled) {
                this.pivot.rotation.y += delta * 2 * Math.PI * params.animate.pivotRotationsPerSecond;
            }
        };

        this.setMaterialTextures = function () {
            this.material.map = new THREE.TextureLoader().load(params.material.map[params.imgDef]);
            this.material.bumpMap = new THREE.TextureLoader().load(params.material.bumpMap[params.imgDef]);
        };

        this.init();
    };

    return new _Moon();
})(Earth);

var Sun = (function () {
    var _Sun = function () {
        var params = {
            sunLight: {
                visible: true,
                color: 0xffffff,
                intensity: 1.3,
                position: {
                    x: -380,
                    y: 240,
                    z: -1000,
                }
            },
            sunLensFlare: {
                textures: {
                    sun: {
                        sd: ASSETS_PATH + 'lens_flare_sun_512x512.jpg',
                        hd: ASSETS_PATH + 'lens_flare_sun_1024x1024.jpg'
                    },
                    circle: {
                        sd: ASSETS_PATH + 'lens_flare_circle_32x32.jpg',
                        hd: ASSETS_PATH + 'lens_flare_circle_64x64.jpg'
                    },
                    hexagon: {
                        sd: ASSETS_PATH + 'lens_flare_hexagon_128x128.jpg',
                        hd: ASSETS_PATH + 'lens_flare_hexagon_256x256.jpg'
                    }
                },
                flareCircleSizeMax: 70,
                lensFlares: [{
                    size: 1400,
                    opacity: 1,
                    distance: 0
                }, {
                    size: 20,
                    opacity: 0.4,
                    distance: 0.63
                }, {
                    size: 40,
                    opacity: 0.3,
                    distance: 0.64
                }, {
                    size: 70,
                    opacity: 0.8,
                    distance: 0.7
                }, {
                    size: 110,
                    opacity: 0.7,
                    distance: 0.8
                }, {
                    size: 60,
                    opacity: 0.4,
                    distance: 0.85
                }, {
                    size: 30,
                    opacity: 0.4,
                    distance: 0.86
                }, {
                    size: 120,
                    opacity: 0.3,
                    distance: 0.9
                }, {
                    size: 260,
                    opacity: 0.4,
                    distance: 1
                }]
            }
        };

        this.init = function () {
            this.textureLoader = new THREE.TextureLoader();
            this.sunLight = new THREE.DirectionalLight(params.sunLight.color, params.sunLight.intensity);

            this.sunLight.position.set(
                params.sunLight.position.x,
                params.sunLight.position.y,
                params.sunLight.position.z
            );

            this.sunLight.visible = params.sunLight.visible;

            this.createLensFlare();
        };

        this.createLensFlare = function () {
            var textureFlare0 = this.textureLoader.load(params.sunLensFlare.textures.sun.hd);
            var textureFlare1 = this.textureLoader.load(params.sunLensFlare.textures.circle.hd);
            var textureFlare2 = this.textureLoader.load(params.sunLensFlare.textures.hexagon.hd);

            var lensFlare = new THREE.LensFlare(textureFlare0, 1400, 0.0, THREE.AdditiveBlending);
                lensFlare.add(textureFlare1, 20, 0.63, THREE.AdditiveBlending);
                lensFlare.add(textureFlare1, 40, 0.64, THREE.AdditiveBlending);
                lensFlare.add(textureFlare1, 70, 0.7, THREE.AdditiveBlending);
                lensFlare.add(textureFlare1, 110, 0.8, THREE.AdditiveBlending);
                lensFlare.add(textureFlare1, 60, 0.85, THREE.AdditiveBlending);
                lensFlare.add(textureFlare2, 30, 0.86, THREE.AdditiveBlending);
                lensFlare.add(textureFlare2, 120, 0.9, THREE.AdditiveBlending);
                lensFlare.add(textureFlare2, 260, 1.0, THREE.AdditiveBlending);
    
                this.sunLight.add(lensFlare);
            };
    
            this.init();
        };
    
        return new _Sun();
    })();
    
    // Define NEO as a global variable
    var NEO;

    (function (Earth) {
        NEO = {
            params: {
                apiKey: 'XohyYlbmddUdhOdJT3cRnOWQBgPdgZcz0XR2kb8D',
                apiUrl: 'https://api.nasa.gov/neo/rest/v1/feed',
                neoObjects: [],
                neoMeshes: []
            },

            init: function () {
                this.fetchNEOData();
            },

            fetchNEOData: function () {
                var today = new Date().toISOString().split('T')[0];
                var url = `${this.params.apiUrl}?start_date=${today}&end_date=${today}&api_key=${this.params.apiKey}`;

                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        this.processNEOData(data);
                    })
                    .catch(error => console.error('Error fetching NEO data:', error));
            },

            processNEOData: function (data) {
                var neoList = data.near_earth_objects[Object.keys(data.near_earth_objects)[0]];
                this.params.neoObjects = neoList.map(neo => ({
                    id: neo.id,
                    name: neo.name,
                    diameter: neo.estimated_diameter.kilometers.estimated_diameter_max,
                    distance: neo.close_approach_data[0].miss_distance.kilometers,
                    velocity: neo.close_approach_data[0].relative_velocity.kilometers_per_second
                }));

                this.createNEOMeshes();
            },

            createNEOMeshes: function () {
                this.params.neoObjects.forEach(neo => {
                    // Increase the size of the NEO object
                    var size = Math.max(1, neo.diameter * 0.5); // Minimum size of 1, scaled by diameter
                    var geometry = new THREE.SphereGeometry(size, 16, 16);
                    var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                    var mesh = new THREE.Mesh(geometry, material);

                    var distance = Earth.earthMesh.geometry.parameters.radius + parseFloat(neo.distance) / 1000000;
                    var position = new THREE.Vector3(
                        distance * Math.cos(Math.random() * Math.PI * 2),
                        distance * Math.sin(Math.random() * Math.PI * 2),
                        (Math.random() - 0.5) * distance
                    );
                    mesh.position.copy(position);

                    var label = this.createLabel(neo, size);
                    mesh.add(label);

                    this.params.neoMeshes.push(mesh);
                    Earth.earthMesh.add(mesh);
                });
            },

            createLabel: function (neo, size) {
                var canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 128;
                var context = canvas.getContext('2d');
                context.font = 'bold 24px Arial';
                context.fillStyle = 'white';
                context.textAlign = 'center';
                context.fillText(neo.name, 128, 44);
                context.font = '18px Arial';
                context.fillText(`Diameter: ${neo.diameter.toFixed(2)} km`, 128, 74);
                context.fillText(`Distance: ${(neo.distance / 1000).toFixed(0)} km`, 128, 104);

                var texture = new THREE.CanvasTexture(canvas);
                var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
                var sprite = new THREE.Sprite(spriteMaterial);
                sprite.scale.set(20, 10, 1); // Increase the scale of the sprite
                sprite.position.set(0, size + 2, 0); // Position the label above the NEO

                return sprite;
            },

            getNeoMeshes: function () {
                return this.params.neoMeshes;
            }
        };
    })(Earth);

    var Scene = (function () {
        var _Scene = function () {
            var params = {
                orbitControls: {
                    autoRotate: true,
                    autoRotateSpeed: 0.07
                }
            };
    
            this.init = function () {
                this.scene = new THREE.Scene();
                this.scene.add(Earth.earthMesh);
                this.scene.add(Moon.pivot);
                this.scene.add(Sun.sunLight);
    
                Skymap.setSceneBgCubeTexture(this.scene);
    
                this.activeOrbitControls();
    
                // Initialize NEO
                if (NEO && typeof NEO.init === 'function') {
                    NEO.init();
                } else {
                    console.error('NEO module is not initialized correctly.');
                }
            };
    
            this.activeOrbitControls = function () {
                this.orbitControls = new THREE.OrbitControls(
                    Camera.perspectiveCamera,
                    Renderer.webGLRenderer.domElement
                );
    
                this.orbitControls.autoRotate = params.orbitControls.autoRotate;
                this.orbitControls.autoRotateSpeed = params.orbitControls.autoRotateSpeed;
    
                this.orbitControls.enableDamping = true;
            };
    
            this.init();
        };
    
        return new _Scene();
    })();
    
    var SceneShadow = (function (Scene) {
        var _SceneShadow = function () {
            var params = {
                shadow: {
                    castShadow: true,
                    camera: {
                        near: 950,
                        far: 1250,
                        right: 150,
                        left: -150,
                        top: 150,
                        bottom: -150
                    },
                    mapSize: {
                        width: 512,
                        height: 512
                    },
                    bias: 0
                }
            };
    
            this.init = function () {
                this.setShadowConfiguration();
            };
    
            this.setShadowConfiguration = function () {
                Sun.sunLight.castShadow = params.shadow.castShadow;
                Sun.sunLight.shadow.camera.near = params.shadow.camera.near;
                Sun.sunLight.shadow.camera.far = params.shadow.camera.far;
                Sun.sunLight.shadow.mapSize.width = params.shadow.mapSize.width;
                Sun.sunLight.shadow.mapSize.height = params.shadow.mapSize.height;
                Sun.sunLight.shadow.bias = params.shadow.bias;
    
                Sun.sunLight.shadow.camera.right = params.shadow.camera.right;
                Sun.sunLight.shadow.camera.left = params.shadow.camera.left;
                Sun.sunLight.shadow.camera.top = params.shadow.camera.top;
                Sun.sunLight.shadow.camera.bottom = params.shadow.camera.bottom;
    
                Earth.earthMesh.castShadow = true;
                Earth.earthMesh.receiveShadow = true;
    
                Cloud.cloudMesh.receiveShadow = true;
    
                Moon.moonMesh.castShadow = true;
                Moon.moonMesh.receiveShadow = true;
    
                this.activeWebGLRendererShadowMap();
            };
    
            this.activeWebGLRendererShadowMap = function () {
                Renderer.webGLRenderer.shadowMap.enabled = true;
                Renderer.webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
                Renderer.webGLRenderer.shadowMapSoft = true;
            };
    
            this.init();
        };
    
        return new _SceneShadow();
    })(Scene);
    
    var View = (function () {
        var _View = function () {
            var clock, delta;
    
            this.init = function () {
                clock = new THREE.Clock();
    
                this.animate();
    
                window.addEventListener('resize', this.onWindowResize, false);
            };
    
            this.animate = function () {
                requestAnimationFrame(this.animate.bind(this));
    
                delta = clock.getDelta();
    
                Earth.animate(delta);
                Cloud.animate(delta);
                Moon.animate(delta);
    
                this.animateNEOs();
    
                Scene.orbitControls.update();
                Renderer.webGLRenderer.render(Scene.scene, Camera.perspectiveCamera);
            };
    
            this.animateNEOs = function () {
                if (NEO && typeof NEO.getNeoMeshes === 'function') {
                    var neoMeshes = NEO.getNeoMeshes();
                    if (neoMeshes && neoMeshes.length > 0) {
                        neoMeshes.forEach(mesh => {
                            mesh.lookAt(Camera.perspectiveCamera.position);
                        });
                    }
                }
            };
    
            this.onWindowResize = function () {
                Camera.updateAspect();
                Renderer.updateSize();
            };
    
            this.init();
        };
    
        return new _View();
    })();