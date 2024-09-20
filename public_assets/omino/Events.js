class ExternalPromise extends Promise{
	constructor(){
		let toCall=[];
		super(r=>toCall.push(r));
		this.resolveFunc=toCall[0];

		this.callbacks=[];
	}
	then(){}

	on(callback){
		this.callbacks.push(callback);
	}
	async resolve(){
		for(const callback of this.callbacks)
			await callback();
	}
}

const events={
	loaded:new ExternalPromise(),
};
export default events;