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

    this.path = filledInOptions.path;
    if(filledInOptions.calcPath) this.recalcPath();
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
    if(!this.torusMode) if(pos.x<0||pos.y<0||pos.x>=this.width||pos.y>=this.height) return borderOmino;
    for(const omino of this.ominoes){
      if(this.torusMode){
        if(omino.getOnTorus(pos, new Vector(this.width, this.height))) return omino;
      }else if(omino.get(pos)) return omino;
    }
    return false;
  }
  recalcPath(){
    this.path=[];

    let thisAsBoolArr=[];
    for(let y=0;y<this.height;y++){
      thisAsBoolArr[y]=[];
      for(let x=0;x<this.width;x++){
        thisAsBoolArr[y][x]=this.get(new Vector(x,y));
      }
    }

    //--

    let lengthWorker;
    try{
      lengthWorker = new Worker("/assets/omino/BoardLengthCalculator.js", { type: "module" });
    }catch(e){
      const fakePostMessage = data=>lengthWorker.onmessage({data});
      FakeWebWorker.fake(fakePostMessage);

      lengthWorker = {
        postMessage:data=>FakeWebWorker.onMessage({data}),
      };
    }

    lengthWorker.onmessage = e => {
      this.path=e.data;
    };

    lengthWorker.postMessage({
      board:thisAsBoolArr, 
      torusMode:this.torusMode,
    });
  }
  
  render(pos, env=p5){
    env.fill(255, 50);
    for(let y=0;y<this.height;y++){
      for(let x=0;x<this.width;x++){
        if(this.get(new Vector(x,y))) continue;
        
        env.rect((x+tileSpacing)*this.renderData.scale,
          (y+tileSpacing)*this.renderData.scale,
          this.renderData.scale*(1-tileSpacing*2),this.renderData.scale*(1-tileSpacing*2),
          this.renderData.scale*tileRadius);
      }
    }

    env.push();
    env.stroke(255, 100);
    env.scale(this.renderData.scale);
    env.translate(0.5,0.5);
    env.strokeWeight(0.1);
    for(let i=1;i<this.path.length;i++){
      if(this.torusMode&&
        (Math.abs(this.path[i-1].x-this.path[i].x)>1||Math.abs(this.path[i-1].y-this.path[i].y)>1)){
        let portalDist = 0.5-tileSpacing;

        if(this.path[i-1].y!=this.path[i].y){
          env.line(this.path[i-1].x,this.path[i-1].y, this.path[i].x,
            this.path[i-1].y+(this.path[i].y>this.path[i-1].y?-1:1)*portalDist);
          env.line(this.path[i].x,this.path[i].y, this.path[i-1].x,
            this.path[i].y+(this.path[i-1].y>this.path[i].y?-1:1)*portalDist);
        }else{
          env.line(this.path[i-1].x,this.path[i-1].y,
            this.path[i-1].x+(this.path[i].x>this.path[i-1].x?-1:1)*portalDist, this.path[i].y);
          env.line(this.path[i].x,this.path[i].y,
            this.path[i].x+(this.path[i-1].x>this.path[i].x?-1:1)*portalDist, this.path[i].y);
        }
        continue;
      }

      env.line(this.path[i-1].x,this.path[i-1].y, this.path[i].x,this.path[i].y);
    }
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

  toLink(){
    let args = {
      fullscreen:false,
      palette:allPalettes.indexOf(Data.scene.paletteScene.palette)+1,
      dims:this.width+"$"+this.height,
      torus:this.torusMode,
      boardData:this.ominoes.map(omino=>{
        if(omino instanceof LockedOmino) return undefined;//todo

        for(const [key,data] of Object.entries(pageData.palette.data)){
          if(!data.orig) continue;

          if(data.omino.equals(omino)){
            let posReset = omino.clone();
            posReset.pos=new Vector(0,0);
            let transform=-1;
            for(let i=0;i<2;i++){
              for(let j=0;j<4;j++){
                if(posReset.equalsExact(data.omino)){
                  transform=j+i*4;
                  break;
                }
                posReset=i==0?posReset.rotatedCCW():posReset.rotatedCW();
              }
              if(transform!=-1) break;
              posReset=posReset.mirroredH();
            }

            return `${key}-${omino.pos.toURLStr()}-${transform}`;
          }
        }

        return omino.pos.toURLStr()+"-"+omino.vectors.map(v=>v.toURLStr()).join("-");
      }).filter(o=>o).join("!")
    };

    return window.location.origin+window.location.pathname+"?"+
      Object.entries(args).map(([k,v])=>k+"="+v).join("&");
  }
}

export default Board;