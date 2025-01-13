import Component from '../../base/component.js';
// Importa o css do componente para o documento (utiliza o arquivo no mesmo diretório com o mesmo nome do arquivo js)
const styleSheetUrl = import.meta.url.replace('.js', '.css');
const styleSheet = new URL(styleSheetUrl).href;
document.head.innerHTML += `<link rel="stylesheet" href="${styleSheet}">`;

export default class ThreeJsCanvas extends Component {
    //Componente que contém o canvas do threejs, e um overlay com um título
    constructor(app,title){
        super(app);
        this.title = title;
    }

    init(){
        super.init();
        if(this.title){
            this.closeButton = this.element.querySelector("#close-button");
            this.closeButton.onclick = () => this.closeOverlay();
            this.overlay = this.element.querySelector("#title-overlay");
        }
        return this;
    }

    //Fecha o overlay
    closeOverlay(){
        this.overlay.classList.add("closed-overlay");
        setTimeout(() => {
            //Destrói o overlay após a animação de fechamento, configurada no threejsCanvas.css
            this.overlay.remove();
        }, 500);
    }

    // Se o título for definido, cria um overlay com o título e o botão de fechar.
    // Caso contrário, retorna apenas o canvas
    getHTML() {
        const overlay = `    
            <div id="title-overlay">
                <h3 id="output-text">${this.title}</h3>
                <div id="close-button" role="button">
                    ${this.closeIconHTML()}
                </div>
            </div>
        `
        let output = this.title ? overlay : '';
        output = output + '<div id="threejs-canvas"></div>';
        return output;
    }

    //SVG do ícone de fechar título (Disponível em https://icons.getbootstrap.com/icons/x/)
    closeIconHTML() {
        return `
            <svg class="icon-close" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
            </svg>
        `
    }
}

