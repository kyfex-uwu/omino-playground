class ExternalPromise<T=void> {
    private readonly callbacks:((p:T)=>Promise<void>|void)[]=[];
    private resolved:T|undefined;

    on(callback:(p:T)=>void) {
        if (this.resolved !== undefined) callback(this.resolved);
        else this.callbacks.push(callback);
    }

    async resolve(resolveVal:T) {
        this.resolved = resolveVal;
        for (const callback of this.callbacks)
            await callback(resolveVal);
    }
}

const events = {
    loaded: new ExternalPromise(),
};
export default events;
