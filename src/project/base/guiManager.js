export default class GuiManager {
    constructor(gui){
        this.gui = gui;
        this.alwaysOn = []; //itens que sempre estarão visíveis
        this.hideable = []; //Guis que podem ser escondidos
        this.tabs = {}; //Conjuntos de guis que podem ser alternados
    }

    getGui(){
        return this.gui;
    }

    close(){
        return this.gui.close();
    }

    open(){
        return this.gui.open();
    }

    //Adiciona um conjunto de itens do gui que sempre estarão visíveis
    //itens: array - item ou lista de itens do gui (controls e folders)
    addAlwaysOnItems(items){
        if (!Array.isArray(items)) items = [items];
        items.forEach(item => {
            this.alwaysOn.push(item);
        });
        return this;
    }

    //Adiciona um conjunto de itens do gui, que podem ser referenciados pelo nome do conjunto
    //itens: array - lista de itens do gui (controls e folders)
    addTab(name, itens){
        const tab = [];
        itens.forEach(item => {
            this.hideable.push(item);
            tab.push(item);
        });
        this.tabs[name] = itens;
        return this;
    }

    //Retorna um conjunto de guis
    getTab(name){
        return this.tabs[name];
    }

    //Esconde uma aba
    hideTab(name){
        this.tabs[name].forEach(item => item.hide());
        return this;
    }

    //Mostra uma aba
    showTab(name){
        this.tabs[name].forEach(item => item.show());
        return this;
    }

    //Remove uma aba
    removeTab(name){
        this.tabs[name].forEach(item => item.destroy());
        delete this.tabs[name];
        return this;
    }
    //Adiciona um item a um conjunto de guis
    appendToTab(name, item){
        this.hideable.push(item);
        this.tabs[name].push(item);
        return this;
    }

    //Esconde todos os guis que podem ser escondidos menos os que estão na lista de guis que sempre estarão visíveis
    switchTo(name){
        this.hideable.forEach(item => item.hide());
        (this.tabs[name]??[]).forEach(item => item.show());
        return this;
    }


}