class Element{
	constructor(){
		this.renderOrder=0;
	}
	apply(nodes){}

	addSetting(setting){}
	prerender(nodes, env){}
	render(nodes, env){} 
}
Element.apply = (...elements)=>{
	let nodes = new Set();
	for(let element of elements){
		if(!(element instanceof Element)) element=element(nodes);
		//it can either be an element or a callable

		let data = element.apply(nodes);
		nodes=nodes.union(data.added).difference(data.removed);
	}
	return nodes;
}
Element.render = (env, ...elements)=>{
	const nodes = Element.apply(...elements);

	elements.sort((e1,e2)=>e1.renderOrder-e2.renderOrder);
	for(let element of elements)
		element.prerender(nodes,env);
	for(let element of elements)
		element.render(nodes,env);
}

class ApplyData{
	constructor({added=[],removed=[]}={}){
		this.added=new Set(added);
		this.removed=new Set(removed);
	}
	add(node){
		this.added.add(node);
		return this;
	}
	remove(node){
		this.removed.add(node);
		return this;
	}
}

export default Element;
export {Element, ApplyData};