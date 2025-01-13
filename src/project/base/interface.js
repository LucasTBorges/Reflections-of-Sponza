export default class Interface {
    constructor(){
        this.root = document.createElement("div");
        document.body.appendChild(this.root);
        this.children = {};
    }

    //Adiciona um filho ao objeto Interface
    //name: string - nome do filho
    //component: Component - componente filho
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

    //Remove o filho passado como parâmetro do diciionário de filhos
    removeChild(name){
        this.children[name] = undefined;
    }

    //Retorna o filho passado como parâmetro
    getChild(name){
        return this.children[name];
    }

    //Mostra o filho passado como parâmetro
    showChild(name){
        this.children[name].show();
    }

    //Esconde o filho passado como parâmetro
    hideChild(name){
        this.children[name].hide();
    }

    //Esconde todos os filhos exceto o que foi passado como parâmetro
    switchTo(name){
        for(let key in this.children){
            this.children[key].hide();
        }
        this.children[name].show();
    }

}