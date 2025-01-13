import Component from '../../base/component.js';
// Importa o css do componente para o documento (utiliza o arquivo no mesmo diretório com o mesmo nome do arquivo js)
const styleSheetUrl = import.meta.url.replace('.js', '.css');
const styleSheet = new URL(styleSheetUrl).href;
document.head.innerHTML += `<link rel="stylesheet" href="${styleSheet}">`;
export default class Dropup extends Component {
    static id = 0;
    constructor(app,label, items, callback){
        //label: string - texto do botão
        //items: {
        //label: string, - texto do item
        //value: any, - valor do item (Callback irá ser aplicado a este valor onClick)
        //onClick?: function - Se definido, sobrepõe o callback padrão para este item
        //}
        //callback: function - função que será chamada ao clicar em um item, será aplicada ao item.value
        super(app);
        this.id = "dropup"+Dropup.id++;
        this.label = label;
        let id = 0;
        this.items = items;
        this.items.forEach((item) => {
            item.id = this.id+"-"+id;
            id++;
        })
        this.callback = callback;
        this.element.classList.add("dropup");
    }
    
    init(){
        super.init();
        this.items.forEach((item) => {
            const element = this.element.querySelector("#"+item.id);
            element.onclick = () => item.onClick ? item.onClick(item.value) : this.callback(item.value);
        });
        return this;
    }

    getHTML() {
        return `
            <button class="dropbtn">${this.label}</button>
            <div class="dropup-content">
                ${this.items.map((item) =>`<a id="${item.id}">${item.label}</a>`).join('')}
            </div>
        `;
    }

    fixPosition(canvasDimensions){
        if(window.innerWidth - canvasDimensions.x >= this.element.clientWidth){
            this.element.style.left = canvasDimensions.x + "px";
            this.element.style.right = "";
        } else {
            this.element.style.left = "";
            this.element.style.right = "0";
        }
    }
}