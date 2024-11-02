import Orientation from "/assets/omino/pathfinding/orientation/Orientation.js";

class RectOrientation extends Orientation{
	constructor(orientation){
		super();
		this.orientation=orientation;
	}
	// if direc is the side that this node is connecting with,
	// the return value is the side that the other node is connecting with
	apply(other,direc){
		if(other instanceof RectOrientation)
			return (this.orientation+direc+2-other.orientation+4)%4;
	}
	clone(){ return new RectOrientation(this.orientation); }
}
RectOrientation.default = new RectOrientation(0);

export default RectOrientation;