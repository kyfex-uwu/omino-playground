import {Element, ApplyData} from "/assets/omino/pathfinding/Element.js";
import Node from "/assets/omino/pathfinding/Node.js";

export default class RootEl extends Element{
	constructor(orientation){
		this.node = new Node(orientation);
	}
	apply(nodes){
		return new ApplyData({added:[this.node]});
	}
}