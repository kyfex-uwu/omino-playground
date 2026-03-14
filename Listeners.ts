
type Constructor<T> = new(...args: any[]) => T;
export function SingleEvent<Params extends any[]>() {
    return function<T extends Constructor<{}>>(base: T) {
        return class extends base {
            #__listeners: ((...params: Params) => void)[]= [];

            addListener(listener:(...params: Params) => void){
                this.#__listeners.push(listener);
                return this;
            }

            emitEvent(...params: Params){
                for(const listener of this.#__listeners)
                    listener(...params);
            }
        }
    }
}

export function MultipleEvents<Params extends {[key: string]: any[]}>() {
    return function<T extends Constructor<{}>>(base: T) {
        return class extends base {
            #__listeners: {
                [key in keyof Params]?: ((...params: Params[key]) => void)[]
            } = {};

            addListener(name: keyof Params, listener:(...params: Params[typeof name]) => void){

                if(this.#__listeners[name] === undefined)
                    this.#__listeners[name] = [];

                this.#__listeners[name].push(listener);
                return this;
            }

            emitEvent(name: keyof Params, ...params: Params[typeof name]){
                for(const listener of this.#__listeners[name] ?? [])
                    listener(...params);
            }
        }
    }
}
