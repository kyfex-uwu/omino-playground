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
class SelectableElement extends Element{
	isSelected(nodes,env,historicalNodes){
		return false;
	}
	tryPlace(nodes,env,historicalNodes){
		return false;
	}
	drawAtMouse(nodes,env,historicalNodes){
		
	}
}

Element.apply = (elements, env={}, historicalNodes={})=>{
	env.elements=elements;
	let nodes = {};

	let passes=elements.map(e=>e.applyPasses).flat().toSorted((p1,p2)=>p1.order-p2.order);

	for(let pass of passes){
		// if(!(element instanceof Element)) element=element(nodes);
		// //it can either be an element or a callable

		let data = pass.func(nodes, env);
		if(data){
			for(const node of Object.values(data.added)){
				nodes[node.id]=node;
				historicalNodes[node.id]=node;
			}
			for(const id of Object.keys(data.removed)) delete nodes[id];
		}
	}
	return nodes;
}
Element.render = (elements, nodes, historicalNodes, env={})=>{
	Object.assign(env,{
		drawData:{
			nodeToTexPos: n=>new Vector(0,0),
			context: p5,
			nodeSize: 0,
			notifyTexture: _=>{},
		},
		elements:elements,
	});

	let passes=elements.map(e=>e.renderPasses).flat().toSorted((p1,p2)=>p1.order-p2.order);

	for(let pass of passes){
		pass.func(nodes, env, historicalNodes);
	}
}
Element.applyAndRender = (elements, applyEnv, renderEnv=applyEnv) => {
	const historicalNodes = {};
	let nodes=Element.apply(elements, applyEnv, historicalNodes);
	Element.render(elements, nodes, historicalNodes, renderEnv);
	return {nodes,historicalNodes};
}

class ApplyData{
	constructor({added=[],removed=[]}={}){
		this.added={};
		for(const node of added) this.added[node.id]=node;
		this.removed={};
		for(const node of removed) this.removed[node.id]=node;
	}
	add(node){
		this.added[node.id]=node;
		return this;
	}
	remove(node){
		this.removed[node.id]=node;
		return this;
	}
}

export default Element;
export {Element, Pass, ApplyData,
	SelectableElement};