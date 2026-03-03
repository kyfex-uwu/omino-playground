import Orientation from "omino/pathfinding/orientation/Orientation.js";

const dir = (dir:RectOrienVal)=>{return {up:0,right:1,down:2,left:3}[dir]}
const str = (dir:number)=>(["up","right","down","left"])[dir]! as RectOrienVal;

type RectOrienVal="up"|"right"|"down"|"left";
export default class RectOrientation extends Orientation<RectOrienVal> {
    private readonly orientation:RectOrienVal;
    constructor(orientation:RectOrienVal) {
        super();
        this.orientation = orientation;
    }

    apply(direc:RectOrienVal) {
        return str((dir(direc) + dir(this.orientation)) % 4);
    }

    toString() {
        return `RectOrientation{${this.orientation}}`;
    }

    getOtherOrientation(thisDirec:RectOrienVal, otherDirec:any, otherClass:Orientation<any>) {
        if(otherClass instanceof RectOrientation)
            return new RectOrientation(str((dir(otherDirec) - dir(thisDirec) + 2 + dir(this.orientation) + 8) % 4));
    }

    static readonly default = new RectOrientation("up")
}
