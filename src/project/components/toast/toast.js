import Component from "../../base/component.js";
// Importa o css do componente para o documento (utiliza o arquivo no mesmo diretório com o mesmo nome do arquivo js)
const styleSheetUrl = import.meta.url.replace('.js', '.css');
const styleSheet = new URL(styleSheetUrl).href;
document.head.innerHTML += `<link rel="stylesheet" href="${styleSheet}">`;

export default class Toast extends Component {
    static toastId = 0;
    constructor(app,type, title, message){
        super(app);
        this.type = type; //success, error, warning, info
        switch(type){
            case 'success':
                //https://icons.getbootstrap.com/icons/check-circle-fill/
                this.svgPath = '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"></path>;';
                break;
            case 'error':
                //https://icons.getbootstrap.com/icons/x-circle-fill/
                this.svgPath = '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>';
                break;
            case 'warning':
                //https://icons.getbootstrap.com/icons/exclamation-circle-fill/
                this.svgPath = '<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>';
                break;
            case 'info':
                //https://icons.getbootstrap.com/icons/info-circle-fill/
                this.svgPath = '<path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>';
                break;
            default:
                throw new Error(`Tipo de toast inválido: ${type}`);
        }
        this.id = "toast-" + Toast.toastId++;
        this.title = title;
        this.message = message;
        this.closed = false;
    }

    init(){
        super.init();
        this.element.classList.add('hide-toast');
        setTimeout(() => {
        this.element.style.transition = 'all 0.5s';
        this.closed = true;
        this.showToast();
        this.closeButton = this.element.querySelector(`#${this.id}-close-button`);
        this.closeButton.onclick = this.hideToast.bind(this);
        },50)
        return this;
    }

    showToast(){
        if (!this.closed) return;
        this.closed = false;
        this.element.classList.remove('hide-toast');
        this.element.classList.add('show-toast');
    }

    hideToast(){
        if (this.closed) return;
        this.closed = true;
        this.element.classList.remove('show-toast');
        this.element.classList.add('hide-toast');
        const toast = this;
        setTimeout(() => {
            toast.destroy();
        }, 500);
    }

    getHTML() {
        // Baseado no design encontrado em https://codingartistweb.com/2021/07/toast-notifications-ui-design-html-css/
        return `
        <div id="${this.id}" class="toast-wrapper">
          <div class="${this.type}-border toast">
              <div class="container-1 ${this.type}">
                <svg fill="currentColor" class="toast-icon" viewBox="0 0 16 16">
                  ${this.svgPath}
                </svg>
              </div>
              <div class="container-2">
                  <p class="toast-title">${this.title}</p>
                  <p class="toast-text">${this.message}</p>
              </div>
              <svg role="button" id="${this.id}-close-button" fill="currentColor" class="close-toast-icon" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
              </svg>
          </div>
        </div>
        `
    }


}