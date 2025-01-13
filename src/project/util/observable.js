export default class Observable {
    constructor(){
        this.subscriptions = [];
        this.failCallbacks = [];
        this.completed = false;
        this.response = undefined;
        this.failed = false;
        this.error = undefined;
    }

    // Retorna se o evento já deu algum tipo de resposta, seja ela sucesso ou falha
    get finished(){
        return this.completed || this.failed;
    }

    // Adiciona um callback a ser chamado quando o evento for executado
    subscribe(callback){
        this.subscriptions.push(callback);
        return this
    }

    // Remove um callback da lista de callbacks
    unsubscribe(callback){
        this.subscriptions = this.subscriptions.filter(subscription => subscription !== callback);
        return this
    }

    // Executa todos os callbacks, passando o response como parâmetro
    emit(response=null){
        this.subscriptions.forEach(callback => callback(response));
        this.completed = true;
        this.response = response;
        return this
    }

    // Adiciona um callback a ser chamado quando e se o evento falhar
    onFail(callback){
        this.failCallbacks.push(callback);
        return this
    }

    // Executa todos os callbacks de falha, passando o response como parâmetro
    fail(response=null){
        this.failCallbacks.forEach(callback => callback(response));
        this.failed = true;
        this.error = response;
        return this
    }
    
    // Recebe uma lista de observables e retorna um novo observable que emite a resposta de todos os observables, quando todos forem bem sucedidos
    // Se algum falhar, o novo observable falha e não emite resposta em nenhum dos callbacks
    static and(...observables){
        const newObservable = new Observable();
        let responses = [];
        let errors = [];
        let completed = 0;
        observables.forEach((observable, index) => {
            if(!observable.finished){
                observable.subscribe((response)=>{
                    responses[index] = response;
                    completed++;
                    if(completed === observables.length&&errors.length===0){
                        newObservable.emit(responses);
                    }
                }).onFail((error)=>{
                    errors[index] = error;
                    completed++;
                    if (errors.length > 0) {
                        newObservable.fail(error);
                    }
                });
            } else {
                if(observable.failed){
                    errors[index] = observable.error;
                } else {
                    responses[index] = observable.response;
                    completed++;
                }
                if(completed === observables.length&&errors.length===0){
                    newObservable.emit(responses);
                }
                else if (errors.length > 0) {
                    newObservable.fail(observable.error);
                }
            }

        });
        return newObservable;
    }

    // Recebe uma lista de observables e retorna um novo observable que emite a resposta do primeiro observable bem sucedido
    // Se todos falharem, o novo observable falha e retorna a lista com todos os erros
    static or(...observables){
        const newObservable = new Observable();
        let errors = [];
        observables.forEach((observable, index) => {
            if (observable.finished) {
                if (observable.failed) {
                    errors[index] = observable.error;
                    if(errors.length === observables.length){
                        newObservable.fail(errors);
                    }
                } else {
                    newObservable.emit(observable.response);
                }
                return;
            }
            observable.subscribe((response)=>{
                newObservable.emit(response);
            }).onFail((error)=>{
                errors[index] = error;
                if(errors.length === observables.length){
                    newObservable.fail(errors);
                }
            });
        });
        return newObservable;
    }
}