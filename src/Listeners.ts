
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
