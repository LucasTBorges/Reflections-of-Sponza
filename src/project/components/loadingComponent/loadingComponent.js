import Component from '../../base/component.js';
// Imports the component's CSS into the document (uses the file in the same directory with the same name as the js file)
const styleSheetUrl = import.meta.url.replace('.js', '.css');
const styleSheet = new URL(styleSheetUrl).href;
document.head.innerHTML += `<link rel="stylesheet" href="${styleSheet}">`;

export default class LoadingComponent extends Component {
    //Component that displays a loading spinner
    getHTML() {
        return `
        <div class="loading-overlay" id="loading-screen"> <div class="spinner"></div>
            <h2>Sponza Palace</h2>
        </div>
        `;
    }
}