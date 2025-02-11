import Vector from "/assets/omino/Vector.js";

class Pass{
	constructor(order,func){
		this.func=func;
		this.order=order;
	}
}

class Element{
	constructor(){
		this.applyPasses=[];
		this.renderPasses=[];
	}
	addSetting(){

	}
}
Element.apply = (elements)=>{
	const env={};

	let nodes = new Set();

	let passes=elements.map(e=>e.applyPasses).flat().toSorted((p1,p2)=>p1.order-p2.order);

	for(let pass of passes){
		// if(!(element instanceof Element)) element=element(nodes);
		// //it can either be an element or a callable

		let data = pass.func(nodes, env);
		nodes=nodes.union(data.added).difference(data.removed);
	}
	return nodes;
}
Element.render = (env={}, elements, nodes)=>{
	Object.assign(env,{
		drawData:{
			nodeToTexPos: n=>new Vector(0,0),
			canvas: p5.canvas,
			nodeSize: 0,
			notifyTexture: _=>{},
		},
		elements:elements,
	});

	let passes=elements.map(e=>e.renderPasses).flat().toSorted((p1,p2)=>p1.order-p2.order);

	for(let pass of passes){
		// if(!(element instanceof Element)) element=element(nodes);
		// //it can either be an element or a callable

		pass.func(nodes, env);
	}
}
Element.applyAndRender = (env={},elements) => {
	Element.render(env,elements,Element.apply(elements));
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
export {Element, Pass, ApplyData};