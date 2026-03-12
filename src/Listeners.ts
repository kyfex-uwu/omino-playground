
type Constructor<T> = new(...args: any[]) => T;
export function SingleEvent<T extends Constructor<{}>, Params extends any[]>(Base: T, _params:Params) {
    return class extends Base {
        public __listeners:((...params:Params)=>void)[] = [];
        addListener(listener:(...params:Params)=>void){
            this.__listeners.push(listener);
            return this;
        }
        emitEvent(...params:Params){
            for(const listener of this.__listeners)
                listener(...params);
        }
    }
}
export function MultipleEvents<T extends Constructor<{}>, Params extends {[key:string]:any[]}>(Base: T, _params:Params) {
    return class extends Base {
        public __listeners: {[key in keyof Params]?:((...params: Params[key])=>void)[]}={};
        addListener(name:keyof Params, listener:(...params:Params[typeof name])=>void){
            if(this.__listeners[name] === undefined)
                this.__listeners[name] = [];
            this.__listeners[name].push(listener);
            return this;
        }
        emitEvent(name:keyof Params, ...params:Params[typeof name]){
            for(const listener of this.__listeners[name] ?? [])
                listener(...params);
        }
    }
}
