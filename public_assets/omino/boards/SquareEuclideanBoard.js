import Vector from "/assets/omino/Vector.js";
import {LockedOmino} from "/assets/omino/Omino.js";
import {allPalettes, nullPalette} from "/assets/omino/Palettes.js";
import {pageData} from "/assets/omino/Options.js";
import Data from "/assets/omino/Main.js";
import {fill, background} from "/assets/omino/Colors.js";
import * as FakeWebWorker from "/assets/omino/pathfinding/Pathfinder.js";

import Board from "/assets/omino/boards/Board.js";

const tileSpacing=0.07;
const tileRadius = 0.2;

class SquareEuclideanBoard extends Board{
  constructor(width, height, options={}){
    super(s=>{
      s.width=width;
      s.height=height;
    },options);
  }
  
  get(pos){
    if(pos.x<0||pos.y<0||pos.x>=this.width||pos.y>=this.height) return Board.borderOmino;
    for(const omino of [...this.ominoes, this.lockedTiles]){
      if(this.torusMode){
        if(omino.getOnTorus(pos, new Vector(this.width, this.height))) return omino;
      }else if(omino.get(pos)) return omino;
    }
    return false;
  }
  toData(){
    let thisAsBoolArr=[];
    for(let y=0;y<this.height;y++){
      thisAsBoolArr[y]=[];
      for(let x=0;x<this.width;x++){
        thisAsBoolArr[y][x]=!!this.get(new Vector(x,y));
      }
    }
    return thisAsBoolArr;
  }
  recalcPath(){
    super.recalcPath(this.torusMode?"SquareTorus":"SquareEuclidean");
  }
  
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

    let ominoesToDraw=[];
    for(const omino of this.ominoes){
      ominoesToDraw.push({
        omino,
        isDupe:this.ominoes.some(o=>o!=omino&&o.equals(omino)),
        isNotInPalette:!Object.values(palette.data).some(o=>o.orig&&o.omino.equals(omino)),
      });
    }
    for(const data of ominoesToDraw){
      let renderFunc=((this.renderData.highlightDupes&&data.isDupe)||
        (this.renderData.highlightNotPalette&&data.isNotInPalette))?"renderHighlighted":"render";
      if(this.torusMode){
        for(let y=0;y<data.omino.pos.y+data.omino.height();y+=this.height){
          for(let x=0;x<data.omino.pos.x+data.omino.width();x+=this.width){
            let newOmino = data.omino.clone();
            newOmino.pos = newOmino.pos.clone();
            newOmino.pos.x-=x;
            newOmino.pos.y-=y;
            newOmino[renderFunc](this.renderData.scale, new Vector(0,0), {env});
          }
        }
      }else data.omino[renderFunc](this.renderData.scale, new Vector(0,0), {env});
    }
    env.pop();
  }

  clone(){
    let toReturn = new SquareEuclidean(this.width, this.height, {
      torusMode:this.torusMode,
      calcPath:false,
      path:this.path,
      lockedTiles:[...this.lockedTiles.vectors.map(v=>v.clone())],
      ominoes:this.ominoes,
    });
    toReturn.renderData.highlightDupes=this.renderData.highlightDupes;
    toReturn.renderData.highlightNotPalette=this.renderData.highlightNotPalette;

    return toReturn;
  }
}

export default SquareEuclideanBoard;