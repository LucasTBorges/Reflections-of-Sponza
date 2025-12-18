import Component from '../../base/component.js';
import { GUI } from '../../util/imports.js';
// Imports the component's CSS into the document (uses the file in the same directory with the same name as the js file)
const styleSheetUrl = import.meta.url.replace('.js', '.css');
const styleSheet = new URL(styleSheetUrl).href;
document.head.innerHTML += `<link rel="stylesheet" href="${styleSheet}">`;

export default class GuiComponent extends Component {
    init() {
        super.init();
        this.gui = new GUI({container:this.getElement()}).hide();
        this.element.classList.add("lil-gui");
        this.element.classList.add("autoPlace");
        this.element.classList.add("root");
        this.app.onResizeEvent.subscribe((canvasDimensions) => this.fixPosition(canvasDimensions));
        return this
    }

    fixPosition(canvasDimensions){
        // Can be used to update the position of the GUI based on the canvas dimensions on resize
    }
}