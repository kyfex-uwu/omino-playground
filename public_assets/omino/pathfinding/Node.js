class ConnWrapper{
	constructor(connection, node){
		this.connection=connection;
		this.node=node;
	}
}
class Connection{
	constructor(node1,direc1, node2,direc2){
		this.node1=node1;
		this.direc1=direc1;
		this.node2=node2;
		this.direc2=direc2;

		this.view1=new ConnWrapper(this, node2);
		this.view2=new ConnWrapper(this, node1);

		if(node1.connections[direc1]) node1.connections[direc1].connection.disconnect();
		if(node2.connections[direc2]) node2.connections[direc2].connection.disconnect();

		node1.connections[direc1]=this.view1;
		node2.connections[direc2]=this.view2;
	}

	disconnect(){
		delete this.node1.connections[this.direc1];
		delete this.node2.connections[this.direc2];
	}
}

export default class Node{
	constructor(orientation){
		this.connections={};
		this.orientation=orientation;
		this.custom={};
	}
	connect(direc, destDirec, dest){
		new Connection(this, direc, dest, destDirec);
	}
	disconnect(whichDirec){
		this.getConn(whichDirec).disconnect();
	}
	detach(){
		for(const dir of Object.keys(this.connections))
			this.disconnect(dir);
		this.detached=true;
	}
	getConn(whichDirec){
		return this.connections[whichDirec].connection;
	}
	getNode(whichDirec){
		return this.connections[whichDirec].node;
	}
}