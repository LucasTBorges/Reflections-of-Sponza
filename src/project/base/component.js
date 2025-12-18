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

    // Executed after element creation and HTML content is added
    init() {
        return this;
    }

    // Returns the component's HTML
    getHTML() {
        return "";
    }

    // Returns the component's element
    getElement() {
        return this.element;
    }

    // Shows the component
    show() {
        this._visible = true;
        this.element.style.display = '';
        return this;
    }

    // Hides the component
    hide() {
        this._visible = false;
        this.element.style.display = 'none';
        return this;
    }

    // Destroys the component
    destroy() {
        this.element.remove();
        // this.Interface is declared in the Interface class during appendChild
        this.Interface.removeChild(this.name);
        return this;
    }
}