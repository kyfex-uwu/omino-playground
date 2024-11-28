import Orientation from "/assets/omino/pathfinding/orientation/Orientation.js";

class RectOrientation extends Orientation{
	constructor(orientation){
		super();
		this.orientation=orientation;
	}
	apply(direc){
		return (direc+this.orientation)%4;
	}

	getOtherOrientation(thisDirec, otherDirec, otherClass){
		switch(otherClass){
		case RectOrientation:
			// if(thisDirec==(otherDirec+2)%4) return new RectOrientation(this.orientation);
			// else if (thisDirec==(otherDirec+3)%4) return new RectOrientation((this.orientation+1)%4);
			// else if (thisDirec==(otherDirec)%4) return new RectOrientation((this.orientation+2)%4);
			// else if (thisDirec==(otherDirec+1)%4) return new RectOrientation((this.orientation+3)%4);

			return new RectOrientation((this.orientation+(thisDirec-otherDirec+2 +4))%4);
		}
		throw Orientation.otherClassNotImpl(RectOrientation, otherClass);	
	}
}
RectOrientation.default = new RectOrientation(0);

export default RectOrientation;