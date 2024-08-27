import Vector from "/assets/omino/Vector.js";
import {LockedOmino} from "/assets/omino/Omino.js";
import {allPalettes} from "/assets/omino/Palettes.js";
import {pageData} from "/assets/omino/Options.js";
import Data from "/assets/omino-playground.js";
import * as FakeWebWorker from "/assets/omino/BoardLengthCalculator.js";

const tileSpacing=0.07;
const tileRadius = 0.2;
const borderOmino = new LockedOmino([]);
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
  constructor(width, height, options={}){
    this.width=width;
    this.height=height;

    this.renderData = {
      scale:20
    };

    let filledInOptions={};
    Object.assign(filledInOptions, defaultOptions);
    Object.assign(filledInOptions, options);

    this.torusMode=filledInOptions.torusMode;
    this.ominoes = [new LockedOmino(filledInOptions.lockedTiles), ...filledInOptions.ominoes];

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
    if(pos.x<0||pos.y<0||pos.x>=this.width||pos.y>=this.height) return borderOmino;
    for(const omino of this.ominoes){
      if(this.torusMode){
        if(omino.getOnTorus(pos, new Vector(this.width, this.height))) return omino;
      }else if(omino.get(pos)) return omino;
    }
    return false;
  }
  recalcPath(){
    this.path=[];
    try{this.lengthWorker.terminate();}catch(e){}
    if(!this.shouldRecalcPath) return;

    let thisAsBoolArr=[];
    for(let y=0;y<this.height;y++){
      thisAsBoolArr[y]=[];
      for(let x=0;x<this.width;x++){
        thisAsBoolArr[y][x]=this.get(new Vector(x,y));
      }
    }

    //--

    let lengthWorker;
    this.lengthWorker=lengthWorker;
    try{
      lengthWorker = new Worker("/assets/omino/BoardLengthCalculator.js", { type: "module" });
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
      board:thisAsBoolArr, 
      torusMode:this.torusMode,
      
      startPoint:this.startPoint,
      endPoint:this.endPoint,
    });
  }
  
  render(pos, env=p5){
    for(let y=0;y<this.height;y++){
      for(let x=0;x<this.width;x++){
        let pos=new Vector(x,y);
        if(this.get(pos)) continue;
        
        env.fill(255, 50);
        if(pos.equals(this.startPoint)) env.fill(164, 255, 133, 50);
        else if(pos.equals(this.endPoint)) env.fill(255, 147, 133, 50);
        env.rect((x+tileSpacing)*this.renderData.scale,
          (y+tileSpacing)*this.renderData.scale,
          this.renderData.scale*(1-tileSpacing*2),this.renderData.scale*(1-tileSpacing*2),
          this.renderData.scale*tileRadius);
      }
    }

    env.push();
    env.beginClip();
    env.scale(this.renderData.scale);
    env.translate(0.5,0.5);
    const line=(x1,y1,x2,y2) => {
      if(x2<x1) [x1,x2]=[x2,x1];
      if(y2<y1) [y1,y2]=[y2,y1];
      env.rect(x1-0.05,y1-0.05,x2-x1+0.1,y2-y1+0.1, 0.05);
    };
    for(let i=1;i<this.path.length;i++){
      if(this.torusMode&&
        (Math.abs(this.path[i-1].x-this.path[i].x)>1||Math.abs(this.path[i-1].y-this.path[i].y)>1)){
        let portalDist = 0.5-tileSpacing;

        if(this.path[i-1].y!=this.path[i].y){
          line(this.path[i-1].x,this.path[i-1].y, this.path[i].x,
            this.path[i-1].y+(this.path[i].y>this.path[i-1].y?-1:1)*portalDist);
          line(this.path[i].x,this.path[i].y, this.path[i-1].x,
            this.path[i].y+(this.path[i-1].y>this.path[i].y?-1:1)*portalDist);
        }else{
          line(this.path[i-1].x,this.path[i-1].y,
            this.path[i-1].x+(this.path[i].x>this.path[i-1].x?-1:1)*portalDist, this.path[i].y);
          line(this.path[i].x,this.path[i].y,
            this.path[i].x+(this.path[i-1].x>this.path[i].x?-1:1)*portalDist, this.path[i].y);
        }
        continue;
      }

      line(this.path[i-1].x,this.path[i-1].y, this.path[i].x,this.path[i].y);
    }
    env.endClip();
    env.background(255,100);
    env.pop();

    env.fill(0);
    env.push();
    env.textAlign(env.CENTER,env.CENTER);
    env.textSize(this.renderData.scale*0.5);
    for(let i=0;i<this.path.length;i++){
      env.text(i+1,(this.path[i].x+0.5)*this.renderData.scale, (this.path[i].y+0.5)*this.renderData.scale);
    }
    env.pop();
    
    let over = this.get(new Vector(p5.mouseX,p5.mouseY).sub(pos).scale(1/this.renderData.scale)
      .sub(new Vector(0.5,0.5)).round());
    if(over&&!(over instanceof LockedOmino))
      p5.cursor(p5.MOVE);
    
    env.push();
    env.beginClip();
    env.rect(0,0,this.renderData.scale*this.width, this.renderData.scale*this.height, this.renderData.scale*(tileRadius+tileSpacing));
    env.endClip();
    for(const omino of this.ominoes){
      if(this.torusMode){
        for(let y=0;y<omino.pos.y+omino.height();y+=this.height){
          for(let x=0;x<omino.pos.x+omino.width();x+=this.width){
            let newOmino = omino.clone();
            newOmino.pos = newOmino.pos.clone();
            newOmino.pos.x-=x;
            newOmino.pos.y-=y;
            newOmino.render(this.renderData.scale, new Vector(0,0), env);
          }
        }
      }else omino.render(this.renderData.scale, new Vector(0,0), env);
    }
    env.pop();
  }

  clone(){
    let toReturn = new Board(this.width, this.height, {
      torusMode:this.torusMode,
      calcPath:false,
      path:this.path,
    });
    toReturn.ominoes=[...this.ominoes];
    return toReturn;
  }
}

export default Board;