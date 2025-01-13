import Service from "../base/service.js";
import LoadingComponent from "../components/loadingComponent/loadingComponent.js";
export default class LoadingService extends Service {
    constructor(app) {
        super(app);
        this.loading = false;
    }

    show(){
        if (this.loading) return;
        this.loading = true;
        this.component = this.ui.addComponent("loading", new LoadingComponent()).show();
    }

    hide(){
        if (!this.loading) return;
        this.loading = false;
        this.component.destroy();
        this.component = undefined;
    }
}
