
import { THREE, FlyControls, GLTFLoader } from '../util/imports.js';
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
        this.getModels().subscribe((main) => {
            this.sponza = main.scene;
            this.makeScene();
            this.onInit.emit();
            this.loadingService.hide();
        }).onFail((error) => {
            this.toastService.show("error","Erro ao carregar modelos",error.message);
            this.loadingService.hide();
        });
        return this;
    }

    makeScene() {
        this.canvas.show();
        this.camera = new THREE.PerspectiveCamera( 75, 1, 0.01, 80 );
        this.camera.position.z = 0.01;
        this.scene = new THREE.Scene();
        /* const geometry = new THREE.PlaneGeometry( 1, 1 );
        geometry.scale( 0.5, 0.5, 0.5 );
        this.plane = new THREE.Mesh( new THREE.PlaneGeometry(), new THREE.MeshBasicMaterial( {color:0x444}) );
        this.plane.position.set(0.5, 0.5, -0.5);
        this.plane.name = "plano";
        this.scene.add( this.plane ); */
        this.scene.add(this.sponza);
        this.scene.add( new THREE.AmbientLight( 0xFFFFFF ) );
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.gui.show();
        this.onResize();
        this.renderer.setAnimationLoop(this.animate.bind(this));
        this.canvas.getElement().appendChild(this.renderer.domElement);
        window.addEventListener( 'resize', this.onResize.bind(this));
        this.flyControls = new FlyControls( this.camera, this.renderer.domElement );
        this.flyControls.movementSpeed = 10.0;
        this.flyControls.rollSpeed = Math.PI / 6.0;
        this.flyControls.autoForward = false;
        this.flyControls.dragToLook = true;
        this.guiManager.addAlwaysOnItems(this.gui.add(this.flyControls, 'enabled').name("Free Cam"));
    }

    onResize() {
        const dimensions = this.getDimensions();
        this.dimensions = dimensions;
        this.renderer.setSize(dimensions.x, dimensions.y);
        this.guiComponent.fixPosition(dimensions);
        this.camera.aspect = dimensions.ratio;
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
        const main = new Observable();
        const gltfLoader = new GLTFLoader();
        const start = new Date();
        gltfLoader.load("/Assets/Models/glTF/Sponza-Intel/main1_sponza/NewSponza_Main_glTF_003.gltf",
            (gltf) => {
                console.log("Modelo carregado em "+(new Date().getTime()-start.getTime())/1000+" segundos");
                main.emit(gltf);
            },
            (xhr) => {
            },
            (error) => {
                main.fail(error);
            }
        )
        return main;
    }
}