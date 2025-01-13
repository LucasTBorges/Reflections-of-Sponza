import Component from '../../base/component.js';
import { THREE } from '../../util/imports.js';
// Importa o css do componente para o documento (utiliza o arquivo no mesmo diretório com o mesmo nome do arquivo js)
const styleSheetUrl = import.meta.url.replace('.js', '.css');
const styleSheet = new URL(styleSheetUrl).href;
document.head.innerHTML += `<link rel="stylesheet" href="${styleSheet}">`;

const fields = ['camPos','camRot'];
export default class InfoComponent extends Component {
    //Componente que exibe informações sobre a apicação
    init() {
        super.init();
        this.element.classList.add("info-component");
        this.makeChildren();
        this.app.onRender.subscribe(() => {if(this.visible) this.update()});
        return this
    }
    getHTML() {
        return `
        `;
    }
    makeChildren(){
        fields.forEach((field) => {
            this[field] = document.createElement("span");
            this.element.appendChild(this[field]);
        });
    }
    update(){
        this.camPos.innerText = `Camera position: x: ${this.app.camera.position.x.toFixed(2)} y: ${this.app.camera.position.y.toFixed(2)} z: ${this.app.camera.position.z.toFixed(2)}`;
        let direction = new THREE.Vector3();
        this.app.camera.getWorldDirection(direction);
        this.camRot.innerText = `Camera direction: x: ${direction.x.toFixed(2)} y: ${direction.y.toFixed(2)} z: ${direction.z.toFixed(2)}`;
    }
}