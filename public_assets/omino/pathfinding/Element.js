class Element{
	constructor(){}
	apply(nodes){}
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

//not working. do i even need
class ElementGroup extends Element{
	constructor(elements){
		super();
		this.elements=elements;
	}
	apply(nodes){
		let added=new Set();
		let removed=new Set();
		for(let element of this.elements){
			if(!(element instanceof Element)) element=element(nodes);

			let data = element.apply(nodes);
			nodes=nodes.union(data.added).difference(data.removed);

			added=added.add(data.added).difference(data.removed);
			removed=removed.add(data.removed).difference(data.added);
		}
		return new ApplyData(added, removed);
	}
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