
type Constructor<T> = new(...args: any[]) => T;
export function SingleEvent<T extends Constructor<{}>, Params extends any[]>(Base: T, _params:Params) {
    const listeners:((...params:Params)=>void)[] = [];

    return class extends Base {
        addListener(listener:(...params:Params)=>void){
            listeners.push(listener);
            return this;
        }
        emitEvent(...params:Params){
            for(const listener of listeners)
                listener(...params);
        }
    }
}
