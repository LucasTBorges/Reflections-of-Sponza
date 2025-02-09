
import { THREE, FlyControls, GLTFLoader, RGBELoader, GroundedSkybox, Water, Reflector } from '../util/imports.js';
import GuiManager from './guiManager.js';
import Interface from './interface.js';
import ThreeJsCanvas from '../components/threejsCanvas/threejsCanvas.js';
import Observable from '../util/observable.js';
import ToastService from '../services/toastService.js';
import GuiComponent from '../components/guiComponent/guiComponent.js';
import LoadingService from '../services/loadingService.js';
import InfoComponent from '../components/infoComponent/infoComponent.js';
export default class Aplicacao {
    constructor(title){
        this.controls = {};
        this.ui = new Interface();
        this.onInit = new Observable();
        this.onResizeEvent = new Observable();
        this.onRender = new Observable(); //Emite timeDelta
        this.guiComponent = this.ui.addComponent("gui", new GuiComponent(this));
        this.gui = this.guiComponent.gui;
        // A ordem de inicialização dos serviços é importante.
        // As dependências de um serviço devem ser inicializadas antes dele
        this.loadingService = new LoadingService(this);
        this.toastService = new ToastService(this);
        this.guiManager = new GuiManager(this.gui);
        this.canvas = this.ui.addComponent("canvas", new ThreeJsCanvas(this,title)).hide();
        this.clock = new THREE.Clock();
        this.time = 0;
        this.info = this.ui.addComponent("info",new InfoComponent(this)).hide();
        this.guiManager.addAlwaysOnItems(this.gui.add(this.info,'visible').name("Camera Info"));
    }

    init(){
        this.loadingService.show();
        const app = this;
        this.loadAssets().subscribe((assets) => {
            const start = new Date();
            /* console.log("models",assets); */
            //Modelo base:
            const main = assets[0];
            this.sponza = main.scene;
            const lights = main.parser.json.extensions?.KHR_lights_punctual?.lights || [];
            this.lights = [];
            lights.forEach((light, index) => {
                const lightNode = main.scene.getObjectById(index);
                if (lightNode) {
                    app.lights.push(lightNode);
                }
            });

            //Estátua:
            const statue = assets[1];
            this.statue = new THREE.Group();
            this.statue.add(statue.scene.children[0]);
    
            //Cortinas:
            const curtains = assets[2];
            curtains.scene.children.forEach((child) => {
                this.sponza.add(child);
            });

            //Envmap:
            this.envmap = assets[3];

            //Water Normals:
            this.waterNormals = assets[4];

            this.makeScene();
            this.onInit.emit();
            this.loadingService.hide();
            console.log("Cena iniciada em "+(new Date().getTime()-start.getTime())/1000+" segundos");
        }).onFail((error) => {
            this.toastService.show("error","Erro ao carregar modelos",error.message);
            this.loadingService.hide();
        });
        return this;
    }

    makeScene() {
        this.canvas.show();
        this.camera = new THREE.PerspectiveCamera( 75, 1, 0.01, 80 );
        this.configPOVs();
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.shadowMap.enabled = true;
        this.scene.add(this.sponza);
        this.scene.add(this.envmap);
        this.makeFlyControls();
        this.onSelectCamera(this.controls["SelectedCam"]);
        this.guiManager.addAlwaysOnItems(
            this.gui.add(this.controls,'SelectedCam',this.controls["POVs"]).name("POVs").onChange((camera) => {
                this.onSelectCamera(camera);
            })
        );
        this.configEstatua();
        this.configMirrors();
        this.makeWater();
        this.scene.add(this.statue);
        this.gui.show();
        this.onResize();
        this.configLighting();
        this.renderer.setAnimationLoop(this.animate.bind(this));
        this.canvas.getElement().appendChild(this.renderer.domElement);
        window.addEventListener( 'resize', this.onResize.bind(this));
        console.log(this.scene); //Remover posteriormente
    }

    onResize() {
        const dimensions = this.getDimensions();
        this.dimensions = dimensions;
        this.renderer.setSize(dimensions.x, dimensions.y);
        this.guiComponent.fixPosition(dimensions);
        this.camera.aspect = dimensions.ratio;
        this.camera.updateProjectionMatrix();
        this.onResizeEvent.emit(dimensions);
    }

    getDimensions() {
        const ratio = window.innerWidth / window.innerHeight; //Para alterar a proporção da aplicação, modificar esse valor
        const width = ratio > 1 ? window.innerWidth : window.innerHeight * ratio;
        const height = ratio > 1 ? window.innerWidth / ratio : window.innerHeight;
        return {x: width, y: height, ratio:ratio};
    }

    animate() {
        this.renderer.render(this.scene, this.camera);
        const delta = this.clock.getDelta();
        this.time += delta;
        this.onRender.emit(delta);
        this.flyControls.update(delta);
    }

    loadAssets(){
        const gltfLoader = new GLTFLoader();

        //Modelo base
        const main = new Observable();
        const startMain = new Date();
        gltfLoader.load("/Assets/Models/glTF/Sponza-Intel/main1_sponza/NewSponza_Main_glTF_003.gltf",
            (gltf) => {
                console.log("Modelo base carregado em "+(new Date().getTime()-startMain.getTime())/1000+" segundos");
                main.emit(gltf);
            },
            (xhr) => {
            },
            (error) => {
                main.fail(error);
            }
        )

        //Modelo da estátua
        const statue = new Observable();
        const startStatue = new Date();
        gltfLoader.load("./src/assets/estatua/scene.gltf",
            (gltf) => {
                console.log("Modelo da estátua carregado em "+(new Date().getTime()-startStatue.getTime())/1000+" segundos");
                statue.emit(gltf);
            },
            (xhr) => {
            },
            (error) => {
                statue.fail(error);
            }
        )

        //Modelo das cortinas
        const curtains = new Observable();
        const startCurtains = new Date();
        gltfLoader.load("/Assets/Models/glTF/Sponza-Intel/pkg_a_curtains/NewSponza_Curtains_glTF.gltf",
            (gltf) => {
                console.log("Modelo das cortinas carregado em "+(new Date().getTime()-startCurtains.getTime())/1000+" segundos");
                curtains.emit(gltf);
            },
            (xhr) => {
            },
            (error) => {
                curtains.fail(error);
            }
        );

        //Envmap
        const envmap = new Observable();
        const startEnvmap = new Date();
        const hdrLoader = new RGBELoader();
        hdrLoader.loadAsync("/Assets/Models/glTF/Sponza-Intel/main1_sponza/textures/kloppenheim_05_4k.hdr")
        .then((texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                const skybox = new GroundedSkybox(texture,50,40);
                skybox.position.y = 25;
                console.log("Envmap carregado em "+(new Date().getTime()-startEnvmap.getTime())/1000+" segundos");
                envmap.emit(skybox);
            },
            (error) => {
                envmap.fail(error)
            }
        );

        //Water Normals
        const waterNormals = new Observable();
        const startWater = new Date();
        const loader = new THREE.TextureLoader();
        loader.load("./src/assets/waternormals.jpg",
            (texture) => {
                console.log("Water Normals carregado em "+(new Date().getTime()-startWater.getTime())/1000+" segundos");
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.repeat.set(4,4);
                waterNormals.emit(texture);
            },
            (xhr) => {
            },
            (error) => {
                waterNormals.fail(error);
            }
        );

        return Observable.and(main,statue,curtains,envmap,waterNormals);
    }

    setCamDirection(x,y,z){
        let position = new THREE.Vector3();
        this.camera.getWorldPosition(position);
        if (!(x instanceof THREE.Vector3)) {
            x = new THREE.Vector3(x, y, z);
        }
        this.camera.lookAt(position.add(x));
    }

    applyToGroup(group, func){
        func(group);
        if (group.children){
            group.children.forEach((child) => {
                this.applyToGroup(child,func);
            });
        }
    }

    configLighting(){
        this.lightObjs = [];
        this.controls["lightsIntensity"] = 5;
        this.controls["lightsVisible"] = true;
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        this.scene.add(ambientLight);
        this.lights.forEach((light) => {
            this.applyToGroup(light, (obj) => {
            if(obj.isLight){
                switch(obj.name){
                    case 'SUN':
                        obj.position.set(22.44,30,30.6);
                        obj.lookAt(obj.position.clone().add(new THREE.Vector3(-0.15,-0.99,-0.09)));
                        obj.castShadow = true;
                        obj.intensity = 6.25;
                        obj.shadow.mapSize.width = 2048;
                        obj.shadow.mapSize.height = 2048;
                        obj.shadow.camera.far = 60;
                        this.sun = obj;
                        this.sun.shadow.camera.right = 50;
                        this.sun.shadow.camera.left = -50;
                        this.sun.shadow.camera.top = 50;
                        this.sun.shadow.camera.updateProjectionMatrix();
                        this.water.material.uniforms.sunColor.value.set(obj.color.getHex());
                        this.water.material.uniforms.sunDirection.value = obj.position.clone().normalize();
                        break;
                    default:
                        obj.intensity = this.controls["lightsIntensity"];
                        obj.castShadow = false;
                        this.controls["lightsColor"] = obj.color.getHex();
                        this.lightObjs.push(obj);
                        break;
                }
                this.scene.add(obj);
                obj.escaneadoLight = true;
            }
            });
        });
        this.scene.traverse((obj) => {
            if(obj.isMesh){
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });
        
        //Configuração da GUI
        const lightControls = this.gui.addFolder("Iluminação").close();

        //Sun controls
        const sunControls = lightControls.addFolder("Sol").close();
        sunControls.add(this.sun,'visible').name("Ligado");
        sunControls.addColor(this.sun,'color').name("Cor").onChange((value) => {
            this.water.material.uniforms.sunColor.value.set(value);
        });
        sunControls.add(this.sun,'intensity',0,10).name("Intensidade");
        //Lantern controls
        const lanterns = lightControls.addFolder("Luminárias").close();
        lanterns.add(this.controls,'lightsVisible').name("Ligadas").onChange((value) => {
            this.lightObjs.forEach((light) => {
                light.visible = value;
            }
        )});
        lanterns.addColor(this.controls,'lightsColor').name("Cor").onChange((value) => {
            this.lightObjs.forEach((light) => {
                light.color.set(value);
            }
        )});
        lanterns.add(this.controls,'lightsIntensity',0,10).name("Intensidade").onChange((value) => {
            this.lightObjs.forEach((light) => {
                light.intensity = value;
            }
        )});
        //Ambient light controls
        const ambientLightControls = lightControls.addFolder("Luz Ambiente").close();
        ambientLightControls.add(ambientLight,'visible').name("Ligada");
        ambientLightControls.addColor(ambientLight,'color').name("Cor");
        ambientLightControls.add(ambientLight,'intensity',0,0.5).name("Intensidade");
        this.guiManager.addAlwaysOnItems(lightControls);
    }

    configEstatua(){
        this.controls["statueScale"] = 0.42;
        this.controls["Auto Rotate"] = true
        this.controls["Rotate Speed"] = 1
        this.statue.castShadow = true;
        this.statue.receiveShadow = true;
        this.statue.position.set(-6.04,0,0);
        this.statue.rotation.set(0,Math.PI/2,0);
        const baseScale = 0.42;
        this.statue.scale.set(baseScale,baseScale,baseScale);
        this.statueControls = this.gui.addFolder("Estátua").close();
        this.statueControls.add(this.statue.children[0],'visible').name("Visível");
        this.mirrors = [];
        this.controls["mirrorVisible"] = true;
        this.statueControls.add(this.controls,'mirrorVisible').name("Espelhos").onChange((value) => {   
            this.mirrors.forEach((mirror) => {
                mirror.visible = value;
            });
        });
        this.statueControls.add(this.statue.position,'x',-10,10).name("Posição").onChange((value) => {
            if(this.controls["SelectedCam"] === this.controls["POVs"]["Câmera de Segurança"]){
                this.lookAtStatue();
            }
        });
        this.statueControls.add(this.controls,'statueScale',0.15,0.6).name("Escala").onChange((value) => {
            this.statue.scale.set(value,value,value);
            if(this.controls["SelectedCam"] === this.controls["POVs"]["Câmera de Segurança"]){
                this.lookAtStatue();
            }
        });
        this.statueControls.add(this.controls,'Auto Rotate').name("Auto Rotacionar");
        this.statueControls.add(this.controls,'Rotate Speed',0.1,5).name("Velocidade de Rotação");
        this.onRender.subscribe((delta) => {
            if(this.controls["Auto Rotate"]){
                this.statue.children[0].rotation.z += this.controls["Rotate Speed"]*delta;
            }
        });
        this.guiManager.addAlwaysOnItems(this.statueControls)
    }

    makeFlyControls(){
        this.flyControls = new FlyControls( this.camera, this.renderer.domElement );
        this.flyControls.movementSpeed = 10.0;
        this.flyControls.rollSpeed = Math.PI / 6.0;
        this.flyControls.autoForward = false;
        this.flyControls.dragToLook = true;
        this.flyControlsGui = this.gui.add(this.flyControls, 'enabled').name("Free Cam");
        this.guiManager.addAlwaysOnItems(this.flyControlsGui);
    }

    makeWater(){
        const geometry = new THREE.PlaneGeometry( 50, 50 );
        this.water = new Water(
            geometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: this.waterNormals,
                sunDirection: new THREE.Vector3(0.70707, 0.70707, 0),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 0.85,
                size: 10.0,
                flowDirection: new THREE.Vector2(0.5, 0.5),
                fog: this.scene.fog !== undefined
            }
        );
        this.water.rotation.x = -Math.PI/2;
        this.water.position.set(0.3,0.035,0.3)
        this.water.scale.set(0.84,0.45,0.84);
        this.scene.add(this.water);
        const waterFolder = this.gui.addFolder("Água").close();
        waterFolder.add(this.water,'visible').name("Ligada");
        waterFolder.add(this.water.position,'y',0.035,1).name("Altura");
        waterFolder.add(this.water.material.uniforms.size,'value',0.1,10).name("Escala");
        waterFolder.add(this.water.material.uniforms.distortionScale,'value',0,10).name("Ondulação");
        waterFolder.addColor(this.water.material.uniforms.waterColor,'value').name("Cor");
        this.controls["Water Flow"] = 0.25;
        waterFolder.add(this.controls,'Water Flow',0,1).name("Velocidade de Fluxo");
        this.onRender.subscribe((delta) => {
            this.water.material.uniforms.time.value += delta*this.controls["Water Flow"];
        });
        this.guiManager.addAlwaysOnItems(waterFolder);
    }

    configMirrors(){
        const basicGeometry = new THREE.PlaneGeometry(6.5, 12);
        this.mirrors[0] = 
        new Reflector(
            basicGeometry,{
            textureWidth: (window.innerWidth * window.devicePixelRatio)/1.5,
            textureHeight: (window.innerHeight * window.devicePixelRatio)/1.5,
            clipBias: 0.003,
            shader: Reflector.ReflectorShader
            });
        this.mirrors[1] =
        new Reflector(
            basicGeometry,{
            textureWidth: (window.innerWidth * window.devicePixelRatio)/1.5,
            textureHeight: (window.innerHeight * window.devicePixelRatio)/1.5,
            clipBias: 0.003,
            shader: Reflector.ReflectorShader
            });
        this.mirrors[0].position.set(2.297,5.5,-2.7);
        this.mirrors[0].rotation.set(0,-Math.PI/4,0)
        this.mirrors[1].position.set(-2.297,5.5,-2.7);
        this.mirrors[1].rotation.set(0,Math.PI/4,0)
        this.statue.add(this.mirrors[0]);
        this.statue.add(this.mirrors[1]);
    }

    configPOVs(){
        this.controls["POVs"] = {
            "Entrada": {pos: [10.88,1.31,-0.08], dir: [-0.97,0.26,0.01]},
            "Segundo Andar": {pos: [8.39,7.28,-1.71], dir: [-0.88,-0.38,0.27]},
            "Vendo o Céu": {pos: [5.48,1.6,-0.52], dir: [-0.44,0.9,0.02]},
            "Top-Down": {pos: [0.11, 14.43, 0.29], dir:[0,-1,0]},
            "Câmera de Segurança": {pos: [0.06,5.95,-1.47], dir: [-0.82,-0.53,0.23]}
        };
        this.controls["SelectedCam"] = this.controls["POVs"]["Entrada"];
    }

    onSelectCamera(cam){
        this.flyControlsGui.setValue(false);
        this.camera.position.set(...this.controls["SelectedCam"].pos);
        if(cam === this.controls["POVs"]["Câmera de Segurança"]){
            this.lookAtStatue();
        } else {
            this.setCamDirection(...this.controls["SelectedCam"].dir);
        }
    }

    lookAtStatue(){
        if(!this.flyControlsGui.getValue()){
            this.camera.lookAt(
                this.statue.position.x,
                this.statue.position.y + 4 * this.statue.scale.y,
                this.statue.position.z
            );
        }
    }
}