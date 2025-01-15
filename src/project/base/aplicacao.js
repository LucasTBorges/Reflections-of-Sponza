
import { THREE, FlyControls, GLTFLoader, RGBELoader, GroundedSkybox } from '../util/imports.js';
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
        this.info = this.ui.addComponent("info",new InfoComponent(this)).show();
        this.guiManager.addAlwaysOnItems(this.gui.add(this.info,'visible').name("Camera Info"));
    }

    init(){
        this.loadingService.show();
        const app = this;
        this.getModels().subscribe((models) => {
            const start = new Date();
            console.log("models",models);
            //Modelo base:
            const main = models[0];
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
            const statue = models[1];
            this.statue = statue.scene.children[0];

            //Cortinas:
            const curtains = models[2];
            curtains.scene.children.forEach((child) => {
                this.sponza.add(child);
            });


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
        this.camera.position.set(10.88,1.31,-0.08);
        this.setCamDirection(-0.97,0.26, 0.01)
        this.scene = new THREE.Scene();
        const hdrLoader = new RGBELoader();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.shadowMap.enabled = true;
        hdrLoader.loadAsync("/Assets/Models/glTF/Sponza-Intel/main1_sponza/textures/kloppenheim_05_4k.hdr")
        .then((texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        const skybox = new GroundedSkybox(texture,50,40);
        skybox.position.y = 25;
        this.scene.add(skybox);
        });
        this.scene.add(this.sponza);
        this.lights.forEach((light) => {
            this.applyToGroup(light, (obj) => {
            if(obj.isLight){
                switch(obj.name){
                    case 'SUN':
                        obj.position.set(6.94,58.29,4.84);
                        obj.lookAt(obj.position.clone().add(new THREE.Vector3(-0.15,-0.99,-0.09)));
                        obj.castShadow = true;
                        obj.intensity = 5;
                        obj.shadow.mapSize.width = 1024;
                        obj.shadow.mapSize.height = 1024;
                        break;
                    default:
                        obj.intensity = 5;
                        obj.castShadow = false;
                        break;
                }
                this.scene.add(obj);
                obj.escaneadoLight = true;
            }
            });
        });
        this.scene.children.forEach((child) => {
            this.applyToGroup(child, (obj) => {
                if(!obj.isLight){
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                }
                obj.escaneadoMain = true;
            });
        });
        this.flyControls = new FlyControls( this.camera, this.renderer.domElement );
        this.flyControls.movementSpeed = 10.0;
        this.flyControls.rollSpeed = Math.PI / 6.0;
        this.flyControls.autoForward = false;
        this.flyControls.dragToLook = true;
        this.guiManager.addAlwaysOnItems(this.gui.add(this.flyControls, 'enabled').name("Free Cam"));
        this.configEstatua();
        this.scene.add(this.statue);
        this.gui.show();
        this.onResize();
        this.renderer.setAnimationLoop(this.animate.bind(this));
        this.canvas.getElement().appendChild(this.renderer.domElement);
        window.addEventListener( 'resize', this.onResize.bind(this));
        console.log(this.scene);
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
        const ratio = window.innerWidth / window.innerHeight;
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

    getModels(){
        const gltfLoader = new GLTFLoader();
        const start = new Date();

        //Modelo base
        const main = new Observable();
        gltfLoader.load("/Assets/Models/glTF/Sponza-Intel/main1_sponza/NewSponza_Main_glTF_003.gltf",
            (gltf) => {
                console.log("Modelo base carregado em "+(new Date().getTime()-start.getTime())/1000+" segundos");
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
        gltfLoader.load("/src/assets/estatua/scene.gltf",
            (gltf) => {
                console.log("Modelo da estátua carregado em "+(new Date().getTime()-start.getTime())/1000+" segundos");
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
        gltfLoader.load("/Assets/Models/glTF/Sponza-Intel/pkg_a_curtains/NewSponza_Curtains_glTF.gltf",
            (gltf) => {
                console.log("Modelo das cortinas carregado em "+(new Date().getTime()-start.getTime())/1000+" segundos");
                curtains.emit(gltf);
            },
            (xhr) => {
            },
            (error) => {
                curtains.fail(error);
            }
        );
        return Observable.and(main,statue,curtains);
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

    configEstatua(){
        this.controls["statueScale"] = 0.42;
        this.controls["Auto Rotate"] = false
        this.controls["Rotate Speed"] = 1
        this.statue.castShadow = true;
        this.statue.receiveShadow = true;
        this.statue.position.set(-6.04,0,0);
        this.statue.rotation.set(-Math.PI/2,0,Math.PI/2);
        const baseScale = 0.42;
        this.statue.scale.set(baseScale,baseScale,baseScale);
        const statueControls = this.gui.addFolder("Estátua");
        statueControls.add(this.statue.position,'x',-10,10).name("Posição");
        statueControls.add(this.controls,'statueScale',0.15,0.6).name("Escala").onChange((value) => {
            this.statue.scale.set(value,value,value);
        });
        statueControls.add(this.controls,'Auto Rotate').name("Auto Rotacionar");
        statueControls.add(this.controls,'Rotate Speed',0.1,5).name("Velocidade de Rotação");
        this.onRender.subscribe((delta) => {
            if(this.controls["Auto Rotate"]){
                this.statue.rotation.z += this.controls["Rotate Speed"]*delta;
            }
        });
        this.guiManager.addAlwaysOnItems(statueControls)
    }
}