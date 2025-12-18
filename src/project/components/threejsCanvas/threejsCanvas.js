import Component from '../../base/component.js';
// Imports the component's CSS into the document (uses the file in the same directory with the same name as the js file)
const styleSheetUrl = import.meta.url.replace('.js', '.css');
const styleSheet = new URL(styleSheetUrl).href;
document.head.innerHTML += `<link rel="stylesheet" href="${styleSheet}">`;

export default class ThreeJsCanvas extends Component {
    //Component that contains the threejs canvas, and an overlay with a title
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

    //Closes the title overlay with an animation
    closeOverlay(){
        this.overlay.classList.add("closed-overlay");
        setTimeout(() => {
            //Destroys the overlay after the closing animation, set in threejsCanvas.css
            this.overlay.remove();
        }, 500);
    }

    // If the title is set, creates an overlay with the title and the close button.
    // Otherwise, returns only the canvas
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

    //SVG of the close title icon (Available at https://icons.getbootstrap.com/icons/x/)
    closeIconHTML() {
        return `
            <svg class="icon-close" fill="currentColor" viewBox="0 0 16 16">
                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
        `
    }
}

