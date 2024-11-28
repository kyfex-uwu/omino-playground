class ConnWrapper{
	constructor(connection, node){
		this.connection=connection;
		this.node=node;
	}
}
class Connection{
	//these directions are absolute
	constructor(node1,direc1, node2,direc2){
		this.node1=node1;
		this.direc1=direc1;
		this.node2=node2;
		this.direc2=direc2;

		this.wrapper1=new ConnWrapper(this, node2);
		this.wrapper2=new ConnWrapper(this, node1);

		this.o2from1 = (node1Orientation, otherOClass)=>
			node1Orientation.getOtherOrientation(this.direc1, this.direc2, otherOClass);
		this.o1from2 = (node2Orientation, otherOClass)=>
			node2Orientation.getOtherOrientation(this.direc2, this.direc1, otherOClass);

		if(node1.connections[direc1]) node1.connections[direc1].connection.disconnect();
		if(node2.connections[direc2]) node2.connections[direc2].connection.disconnect();

		node1.connections[direc1]=this.wrapper1;
		node2.connections[direc2]=this.wrapper2;
	}

	disconnect(){
		delete this.node1.connections[this.direc1];
		delete this.node2.connections[this.direc2];
	}
	calcOtherOrientation(node, orientation){
		if(node==this.node1) return this.o2from1(orientation, 
			this.node2.defaultOrientation.constructor);
		if(node==this.node2) return this.o1from2(orientation, 
			this.node1.defaultOrientation.constructor);
	}
}

class NodeView{
	constructor(node, orientation){
		this.node=node;
		this.orientation=orientation;
	}

	get(whichDirec){
		return new NodeView(this.getNode(whichDirec),
			this.getConn(whichDirec).calcOtherOrientation(this.node,this.orientation));
	}
	getConnWrapper(whichDirec){
		return this.node.connections[this.orientation.apply(whichDirec)];
	}
	getConn(whichDirec){
		return this.getConnWrapper(whichDirec).connection;
	}
	getNode(whichDirec){
		return this.getConnWrapper(whichDirec).node;
	}

	//thisDirec and destDirec are both absolute
	connectNode(thisDirec, destDirec, destNode){
		new Connection(this.node, thisDirec,
			destNode, destDirec);
	}
	//whichDirec is relative
	disconnect(whichDirec){
		this.node.connections[this.orientation.apply(whichDirec)].connection.disconnect();
	}
	detach(){
		for(const connWrapper of Object.values(this.node.connections))
			connWrapper.connection.disconnect();
	}
}

//see nodeview for the useful stuff
export default class Node{
	constructor(defaultOrientation){
		this.connections={};
		this.custom={};
		this.defaultOrientation = defaultOrientation;
	}

	getView(orientation=this.defaultOrientation){
		return new NodeView(this, orientation);
	}
}