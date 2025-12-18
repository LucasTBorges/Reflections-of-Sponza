export default class Interface {
    constructor(){
        this.root = document.createElement("div");
        document.body.appendChild(this.root);
        this.children = {};
    }

    // Adds a child to the Interface object
    // name: string - child name
    // component: Component - child component
    addComponent(name, component){
        this.children[name] = component;
        component.name = name;
        component.Interface = this;
        component.getElement().innerHTML = component.getHTML();
        component.init();
        this.root.appendChild(component.getElement());
        component.show();
        return component;
    }

    // Removes the child passed as parameter from the children dictionary
    removeChild(name){
        this.children[name] = undefined;
    }

    // Returns the child passed as parameter
    getChild(name){
        return this.children[name];
    }

    // Shows the child passed as parameter
    showChild(name){
        this.children[name].show();
    }

    // Hides the child passed as parameter
    hideChild(name){
        this.children[name].hide();
    }

    // Hides all children except the one passed as parameter
    switchTo(name){
        for(let key in this.children){
            this.children[key].hide();
        }
        this.children[name].show();
    }

}