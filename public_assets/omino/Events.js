class ExternalPromise extends Promise{
	constructor(){
		let toCall=[];
		super(r=>toCall.push(r));
		this.resolveFunc=toCall[0];

		this.callbacks=[];
		this.resolved=false;
	}
	then(){}

	on(callback){
		if(this.resolved) callback();
		else this.callbacks.push(callback);
	}
	async resolve(){
		this.resolved=true;
		for(const callback of this.callbacks)
			await callback();
	}
}

const events={
	loaded:new ExternalPromise(),
};
export default events;