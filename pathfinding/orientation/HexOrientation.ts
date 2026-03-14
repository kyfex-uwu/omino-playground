import Orientation from "omino/pathfinding/orientation/Orientation.js";
import Vector from "omino/Vector.js";

const dir = (dir:HexOrienVal)=>
    {return {up:0,upright:1,downright:2,down:3,downleft:4, upleft:5}[dir]}
const str = (dir:number)=>
    (["up","upright","downright","down","downleft","upleft"])[dir]! as HexOrienVal;

export type HexOrienVal="up"|"upright"|"downright"|"down"|"downleft"|"upleft";
export const hexOrienDirs:{[key in HexOrienVal]:Vector} = {
    up:new Vector(0,-1),
    upright:new Vector(Math.sin(Math.PI/3), -Math.cos(Math.PI/3)),
    downright:new Vector(Math.sin(Math.PI/3), Math.cos(Math.PI/3)),
    down:new Vector(0,1),
    downleft:new Vector(-Math.sin(Math.PI/3), Math.cos(Math.PI/3)),
    upleft:new Vector(-Math.sin(Math.PI/3), -Math.cos(Math.PI/3)),
}
export default class HexOrientation extends Orientation<HexOrienVal> {
    private constructor(orientation:HexOrienVal) {
        super(orientation);
    }

    apply(direc:HexOrienVal) {
        return str((dir(direc) + dir(this.direc)) % 6);
    }

    toString() {
        return `HexOrientation{${this.direc}}`;
    }

    getOtherOrientation(thisDirec:HexOrienVal, otherDirec:any, otherClass:Orientation<any>) {
        if(otherClass instanceof HexOrientation)
            return new HexOrientation(str((dir(otherDirec) - dir(thisDirec) + 3 + dir(this.direc) + 12) % 6));
    }

    static readonly default = new HexOrientation("up");
    static readonly up = HexOrientation.default;
    static readonly down = new HexOrientation("down");
    static readonly upleft = new HexOrientation("upleft");
    static readonly upright = new HexOrientation("upright");
    static readonly downleft = new HexOrientation("downleft");
    static readonly downright = new HexOrientation("downright");
    static readonly clockwise = [
        HexOrientation.up,
        HexOrientation.upright,
        HexOrientation.downright,
        HexOrientation.down,
        HexOrientation.downleft,
        HexOrientation.upleft
    ];
}
