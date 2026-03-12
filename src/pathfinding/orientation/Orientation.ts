//todo: caching

export type OType=string

//instances of this class should not change!!! instead they should return new instances
export default abstract class Orientation<ThisOType extends OType> {
    public __only_for_ts:ThisOType=undefined!;

    // direc: the direction from this orientation's perspective
    // returns: the direction translated to the default/absolute perspective
    abstract apply(direc:ThisOType):ThisOType;

    //thisDirec: the absolute direction out of this node
    //otherDirec: the absolute direction of the other node that this node is connecting to
    //otherClass: the type of orientation that this function should return
    //	(also the orientation that otherDirec is attached to)
    abstract getOtherOrientation<OtherOType extends OType>(
        thisDirec:ThisOType, otherDirec:OtherOType, otherClass:Orientation<OtherOType>):Orientation<any>|undefined;

    getOtherOrientationSelf(thisDirec:ThisOType, otherDirec:ThisOType):Orientation<ThisOType>{
        return this.getOtherOrientation(thisDirec,otherDirec,this)!;
    }

    abstract toString():string;

    // static otherClassNotImpl = (thisClass, otherClass) =>
    //     `Orientation [${thisClass}] doesn't know how to get the correct orientation of orientation [${otherClass}]`;
}
