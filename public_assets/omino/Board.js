import Vector from "/assets/omino/Vector.js";
import Element from "/assets/omino/pathfinding/elements/Element.js";
import * as FakeWebWorker from "/assets/omino/pathfinding/Pathfinder.js";

const defaultOptions = {
  elements:[],
  calcPath:true,
  path:[],
  startPoint:undefined,
  endPoint:undefined,
};
class Board{
  constructor(options={}){
    let filledInOptions={};
    Object.assign(filledInOptions, defaultOptions);
    Object.assign(filledInOptions, options);

    this.elements = [...filledInOptions.elements];

    this.startPoint=filledInOptions.startPoint;//id
    this.endPoint=filledInOptions.endPoint;//id

    this.path = filledInOptions.path;//list of ids
    this.shouldRecalcPath=filledInOptions.calcPath;
    this.recalcPath();
  }
  
  add(element){
    this.elements.push(element);
    this.recalcPath();
  }
  remove(element){
    if(this.elements.includes(element))
      this.elements.splice(this.elements.indexOf(element),1);
    this.recalcPath();
  }
  
  getNodes(){
    return Element.apply(...this.elements);
  }
  recalcPath(){
    try{this.lengthWorker.terminate();}catch(e){}
    if(!this.shouldRecalcPath) return;
    this.path=[];

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

    const nodes = this.getNodes();

    lengthWorker.onmessage = e => {
      this.path=e.data;
      if(this.path[0]&&this.path[0].id==this.endPoint||
        this.path[this.path.length-1]&&this.path[this.path.length-1].id==this.startPoint)
        this.path.reverse();
      lengthWorker.terminate();
    };

    lengthWorker.postMessage({
      startPoint:this.startPoint,
      endPoint:this.endPoint,
      nodes:[...nodes].map(n=>[n.id, Object.values(n.connections).map(c=>c.node.id)]),
    });
  }

  clone(){
    let toReturn = new Board({
      startPoint:this.startPoint,
      endPoint:this.endPoint,
      calcPath:this.shouldRecalcPath,
      path:this.path,
      elements:this.elements,
    });

    return toReturn;
  }
}

export default Board;