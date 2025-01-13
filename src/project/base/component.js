export default class Component {
    constructor(app) {
        this.app = app;
        this._visible = false;
        this.element = document.createElement('div');
        this.element.style.display = 'none';
    }

    set visible(value) {
        this._visible = value;
        if (value) {
            this.show();
        } else {
            this.hide();
        }
    }

    get visible() {
        return this._visible;
    }

    //Executado após a criação do elemento e o conteúdo HTML ser adicionado
    init() {
        return this;
    }

    //Retorna o HTML do componente
    getHTML() {
        return "";
    }

    //Retorna o elemento do componente
    getElement() {
        return this.element;
    }

    //Mostra o componente
    show() {
        this._visible = true;
        this.element.style.display = '';
        return this;
    }

    //Esconde o componente
    hide() {
        this._visible = false;
        this.element.style.display = 'none';
        return this;
    }

    //Destrói o componente
    destroy() {
        this.element.remove();
        //this.Interface é declarado na classe Interface durante o appendChild
        this.Interface.removeChild(this.name);
        return this;
    }
}