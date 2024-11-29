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
		case RectOrientation:
			return new RectOrientation((otherDirec-thisDirec+2+this.orientation +8)%4)

			//return new RectOrientation((this.orientation+(thisDirec-otherDirec+2) +8)%4);
		}
		throw Orientation.otherClassNotImpl(RectOrientation, otherClass);	
	}
}
RectOrientation.default = new RectOrientation(0);

export default RectOrientation;