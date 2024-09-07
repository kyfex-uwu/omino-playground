import Vector from "/assets/omino/Vector.js";
import {LockedOmino} from "/assets/omino/Omino.js";
import {nullPalette} from "/assets/omino/Palettes.js";
import * as FakeWebWorker from "/assets/omino/pathfinding/Pathfinder.js";

const defaultOptions = {
  lockedTiles:[],
  ominoes:[],
  torusMode:false,
  calcPath:true,
  path:[],
  startPoint:undefined,
  endPoint:undefined,
};
class Board{
  constructor(init=_=0,options={}){
    init(this);

    this.renderData = {
      scale:0,

      highlightDupes:false,
      highlightNotPalette:false,
    };

    let filledInOptions={};
    Object.assign(filledInOptions, defaultOptions);
    Object.assign(filledInOptions, options);

    this.torusMode=filledInOptions.torusMode;
    this.lockedTiles = new LockedOmino(filledInOptions.lockedTiles);
    this.ominoes = [...filledInOptions.ominoes];

    this.startPoint=filledInOptions.startPoint;
    this.endPoint=filledInOptions.endPoint;

    this.path = filledInOptions.path;
    this.shouldRecalcPath=filledInOptions.calcPath;
    this.recalcPath();
  }
  
  add(omino){
    this.ominoes.push(omino);
    this.recalcPath();
  }
  remove(omino){
    if(this.ominoes.includes(omino))
      this.ominoes.splice(this.ominoes.indexOf(omino),1);
    this.recalcPath();
  }
  
  get(pos){
    return false;
  }

  toData(){
    return undefined;
  }
  recalcPath(method){
    try{this.lengthWorker.terminate();}catch(e){}
    if(!this.shouldRecalcPath) return;
    this.path=[];

    //--

    let lengthWorker;
    this.lengthWorker=lengthWorker;
    try{
      lengthWorker = new Worker("/assets/omino/pathfinding/Pathfinder.js", { type: "module" });
    }catch(e){
      const fakePostMessage = data=>lengthWorker.onmessage({data});
      FakeWebWorker.fake(fakePostMessage);

      lengthWorker = {
        postMessage:data=>FakeWebWorker.onMessage({data}),
        terminate:_=>0,
      };
    }

    lengthWorker.onmessage = e => {
      this.path=e.data.map(p=>new Vector(...p));
      if(this.path[0]&&this.path[0].equals(this.endPoint)||
        this.path[this.path.length-1]&&this.path[this.path.length-1].equals(this.startPoint))
        this.path.reverse();
      lengthWorker.terminate();
    };

    lengthWorker.postMessage({
      board:this.toData(),
      method,
      
      startPoint:this.startPoint,
      endPoint:this.endPoint,
    });
  }
  
  render(pos, {palette=nullPalette, env=p5, mouse=true}={}){}

  clone(){
    return undefined;
  }
}
Board.borderOmino = new LockedOmino([]);

export default Board;