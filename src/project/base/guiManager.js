export default class GuiManager {
    constructor(gui){
        this.gui = gui;
        this.alwaysOn = []; // items that will always be visible
        this.hideable = []; // Guis that can be hidden
        this.tabs = {}; // Sets of guis that can be toggled
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

    // Adds a set of gui items that will always be visible
    // items: array - item or list of gui items (controls and folders)
    addAlwaysOnItems(items){
        if (!Array.isArray(items)) items = [items];
        items.forEach(item => {
            this.alwaysOn.push(item);
        });
        return this;
    }

    // Adds a set of gui items, which can be referenced by the set name
    // itens: array - list of gui items (controls and folders)
    addTab(name, itens){
        const tab = [];
        itens.forEach(item => {
            this.hideable.push(item);
            tab.push(item);
        });
        this.tabs[name] = itens;
        return this;
    }

    // Returns a set of guis
    getTab(name){
        return this.tabs[name];
    }

    // Hides a tab
    hideTab(name){
        this.tabs[name].forEach(item => item.hide());
        return this;
    }

    // Shows a tab
    showTab(name){
        this.tabs[name].forEach(item => item.show());
        return this;
    }

    // Removes a tab
    removeTab(name){
        this.tabs[name].forEach(item => item.destroy());
        delete this.tabs[name];
        return this;
    }
    // Adds an item to a set of guis
    appendToTab(name, item){
        this.hideable.push(item);
        this.tabs[name].push(item);
        return this;
    }

    // Hides all guis that can be hidden except those in the always visible list
    switchTo(name){
        this.hideable.forEach(item => item.hide());
        (this.tabs[name]??[]).forEach(item => item.show());
        return this;
    }


}