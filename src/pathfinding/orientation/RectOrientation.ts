import Orientation from "omino/pathfinding/orientation/Orientation.js";
import Vector from "omino/Vector.js";

const dir = (dir:RectOrienVal)=>{return {up:0,right:1,down:2,left:3}[dir]}
const str = (dir:number)=>(["up","right","down","left"])[dir]! as RectOrienVal;

export type RectOrienVal="up"|"right"|"down"|"left";
export const rectOrienDirs:{[key in RectOrienVal]:Vector} = {
    up:new Vector(0,-1),
    down:new Vector(0,1),
    left:new Vector(-1,0),
    right:new Vector(1,0),
}
export default class RectOrientation extends Orientation<RectOrienVal> {
    private constructor(orientation:RectOrienVal) {
        super(orientation);
    }

    apply(direc:RectOrienVal) {
        return str((dir(direc) + dir(this.direc)) % 4);
    }

    toString() {
        return `RectOrientation{${this.direc}}`;
    }

    getOtherOrientation(thisDirec:RectOrienVal, otherDirec:any, otherClass:Orientation<any>) {
        if(otherClass instanceof RectOrientation)
            return new RectOrientation(str((dir(otherDirec) - dir(thisDirec) + 2 + dir(this.direc) + 8) % 4));
    }

    static readonly default = new RectOrientation("up");
    static readonly up = RectOrientation.default;
    static readonly down = new RectOrientation("down");
    static readonly left = new RectOrientation("left");
    static readonly right = new RectOrientation("right");
}
