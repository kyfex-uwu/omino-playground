import Vector from "/assets/omino/Vector.js";
import {LockedOmino} from "/assets/omino/Omino.js";
import {allPalettes, nullPalette} from "/assets/omino/Palettes.js";
import {pageData} from "/assets/omino/Options.js";
import Data from "/assets/omino/Main.js";
import {fill, background} from "/assets/omino/Colors.js";
import Element from "/assets/omino/pathfinding/elements/Element.js";
import RectBoardEl from "/assets/omino/pathfinding/boards/RectBoardEl.js";
import OminoEl from "/assets/omino/pathfinding/elements/OminoEl.js";
import * as FakeWebWorker from "/assets/omino/pathfinding/Pathfinder.js";

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
      scale:20,

      highlightFunc:_=>"render",
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
    if(pos.x<0||pos.y<0||pos.x>=this.width||pos.y>=this.height) return borderOmino;
    for(const omino of [...this.ominoes, this.lockedTiles]){
      if(this.torusMode){
        if(omino.getOnTorus(pos, new Vector(this.width, this.height))) return omino;
      }else if(omino.get(pos)) return omino;
    }
    return false;
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

    const nodes = [...Element.apply(
      new RectBoardEl(this.width,this.height),
      ...this.ominoes.map(omino=>nodes=>omino.getEl(nodes))
    )];
    let currNodeId=0;
    for(const node of nodes) node.id=currNodeId++;
    
    if(false){
      let toPrint=[];
      for(const node of nodes){
        for(let i=0;i<=node.custom.pos.y;i++) if(!toPrint[i])
          toPrint[i]=[];
        for(let i=0;i<=node.custom.pos.x;i++) if(!toPrint[node.custom.pos.y][i])
          toPrint[node.custom.pos.y][i]=".";
        toPrint[node.custom.pos.y][node.custom.pos.x]="#";
      }
      console.log(toPrint.map(r=>r.join("")).join("\n"))
    }

    lengthWorker.onmessage = e => {
      this.path=e.data.map(id=>nodes.find(n=>n.id==id).custom.pos);
      if(this.path[0]&&this.path[0].equals(this.endPoint)||
        this.path[this.path.length-1]&&this.path[this.path.length-1].equals(this.startPoint))
        this.path.reverse();
      lengthWorker.terminate();
    };

    lengthWorker.postMessage({
      startPoint:this.startPoint?nodes.find(n=>n.custom.pos.equals(this.startPoint)).id:undefined,
      endPoint:this.endPoint?nodes.find(n=>n.custom.pos.equals(this.endPoint)).id:undefined,

      nodes:nodes.map(n=>[n.id, Object.values(n.connections).map(c=>c.node.id)]), 
      //torusMode:this.torusMode,
    });
  }
  
  renderType(omino, palette=nullPalette){ return this.renderData.highlightFunc(omino, this.ominoes, palette); }
  render(pos, {palette=nullPalette, env=p5, mouse=true}={}){
    for(let y=0;y<this.height;y++){
      for(let x=0;x<this.width;x++){
        let pos=new Vector(x,y);
        fill(this.get(pos)?"board.filled":"board.grid",env);
        
        if(pos.equals(this.startPoint)) fill("board.start", env);
        else if(pos.equals(this.endPoint)) fill("board.end", env);
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
    background("board.pathColor");
    env.pop();

    env.fill(0);
    fill("board.text",env);
    env.push();
    env.textAlign(env.CENTER,env.CENTER);
    env.textSize(this.renderData.scale*0.5);
    for(let i=0;i<this.path.length;i++){
      env.text(i+1,(this.path[i].x+0.5)*this.renderData.scale, (this.path[i].y+0.5)*this.renderData.scale);
    }
    env.pop();
    
    let over = this.get(new Vector(p5.mouseX,p5.mouseY).sub(pos).scale(1/this.renderData.scale)
      .sub(new Vector(0.5,0.5)).round());
    if(mouse&&over&&!(over instanceof LockedOmino))
      p5.cursor(p5.MOVE);
    
    env.push();
    env.beginClip();
    env.rect(0,0,this.renderData.scale*this.width, this.renderData.scale*this.height, this.renderData.scale*(tileRadius+tileSpacing));
    env.endClip();

    for(const omino of this.ominoes){
      let renderFunc = this.renderType(omino, palette);
      if(this.torusMode){
        for(let y=0;y<omino.pos.y+omino.height();y+=this.height){
          for(let x=0;x<omino.pos.x+omino.width();x+=this.width){
            let newOmino = omino.clone();
            newOmino.pos = newOmino.pos.clone();
            newOmino.pos.x-=x;
            newOmino.pos.y-=y;
            newOmino[renderFunc](this.renderData.scale, new Vector(0,0), {env});
          }
        }
      }else omino[renderFunc](this.renderData.scale, new Vector(0,0), {env});
    }
    env.pop();
  }

  clone(){
    let toReturn = new Board(this.width, this.height, {
      torusMode:this.torusMode,
      calcPath:false,
      path:this.path,
      lockedTiles:[...this.lockedTiles.vectors.map(v=>v.clone())],
      ominoes:this.ominoes,
    });

    return toReturn;
  }
}

export default Board;