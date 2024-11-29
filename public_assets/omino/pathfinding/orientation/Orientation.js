//todo: caching
//instances of this class should not change!!! instead they should return new instances
class Orientation{
	// direc: the direction from this orientation's perspective
	// returns: the direction translated to the default/absolute perspective
	apply(direc){}

	//thisDirec: the absolute direction out of this node
	//otherDirec: the absolute direction of the other node that this node is connecting to
	//otherClass: the type of orientation that this function should return
	//	(also the orientation that otherDirec is attached to)
	getOtherOrientation(thisDirec, otherDirec, otherClass){}
	toString(){ return "Orientation{}"; }
}
Orientation.otherClassNotImpl = (thisClass,otherClass)=>
	`Orientation [${thisClass}] doesn't know how to get the correct orientation of orientation [${otherClass}]`;
export default Orientation;