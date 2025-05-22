import Orientation from "/assets/omino/pathfinding/orientation/Orientation.js";

class RectOrientation extends Orientation{
	constructor(orientation){
		super();
		this.orientation=orientation;
	}
	apply(direc){
		return (direc+this.orientation)%4;
	}
	toString(){ return `RectOrientation{${this.orientation}}`;}

	getOtherOrientation(thisDirec, otherDirec, otherClass){
		switch(otherClass){
		case RectOrientation:{
			if(Number.isInteger(otherDirec))
				return new RectOrientation((otherDirec-thisDirec+2+this.orientation +8)%4);
			break;
			}
		}
		return super.getOtherOrientation(thisDirec,otherDirec,otherClass);
	}
}
RectOrientation.default = new RectOrientation(0);

export default RectOrientation;