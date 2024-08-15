import Vector from "/assets/omino/Vector.js";
import {LockedOmino} from "/assets/omino/Omino.js";
import {allPalettes} from "/assets/omino/Palettes.js";
import {pageData} from "/assets/omino/Options.js";
import Data from "/assets/omino-playground.js";

function findLongestShortest(currPoint, pool, maybePaths){
  let prevPoint;
  while(true){
    for(const point of pool) point.dist=undefined;
    let furthestDist=0;
    currPoint.dist=0;

    while(true){
      let distsMapped=true;
      for(const point of pool){
        if(point.dist!==undefined) continue;
        distsMapped=false;

        let dists=[
          pool.find(somePoint=>somePoint.pos.equals(point.pos.left())),
          pool.find(somePoint=>somePoint.pos.equals(point.pos.right())),
          pool.find(somePoint=>somePoint.pos.equals(point.pos.up())),
          pool.find(somePoint=>somePoint.pos.equals(point.pos.down()))
        ].filter(d=>d!==undefined&&d.dist!==undefined);
        if(dists.length!=0){
          point.dist=dists.reduce((a,c)=>Math.min(a,c.dist),Infinity)+1;
          furthestDist=Math.max(point.dist,furthestDist);
        }
      }
      if(distsMapped) break;
    }

    let furthestPoint = pool.find(p=>p.dist==furthestDist);
    if(furthestPoint==prevPoint){
      prevPoint=currPoint;
      currPoint=furthestPoint;
      break;
    }

    prevPoint=currPoint;
    currPoint=furthestPoint;
  }

  let maybePath=[currPoint];
  while(true){
    let last=maybePath[maybePath.length-1];
    if(last.dist==0) break;

    if(last.conns.left&&last.conns.left.dist==last.dist-1) maybePath.push(last.conns.left);
    else if(last.conns.right&&last.conns.right.dist==last.dist-1) maybePath.push(last.conns.right);
    else if(last.conns.up&&last.conns.up.dist==last.dist-1) maybePath.push(last.conns.up);
    else if(last.conns.down&&last.conns.down.dist==last.dist-1) maybePath.push(last.conns.down);
  }
  maybePaths.push(maybePath);
  return maybePath;
}

const tileSpacing=0.07;
const tileRadius = 0.2;
const borderOmino = new LockedOmino([]);
class Board{
  constructor(width, height, lockedTiles=[]){
    this.width=width;
    this.height=height;

    this.renderData = {
      scale:20
    };
    
    this.ominoes = [new LockedOmino(lockedTiles)];

    this.path = [];
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
    for(const omino of this.ominoes)
      if(omino.get(pos)) return omino;
    return false;
  }
  recalcPath(){
    let poolData=[];
    let currPool=0;
    for(let y=0;y<this.height;y++){
      poolData[y]=[];
      for(let x=0;x<this.width;x++){
        if(this.get(new Vector(x,y))){
          poolData[y][x]=undefined;
          continue;
        }

        let possiblePools = [];
        if(y>0&&poolData[y-1][x]!==undefined) possiblePools.push(poolData[y-1][x]);
        if(x>0&&poolData[y][x-1]!==undefined) possiblePools.push(poolData[y][x-1]);
        if(possiblePools.length==0) poolData[y][x]=currPool++;
        else if(possiblePools.length==1||
            (possiblePools.length==2&&possiblePools[0]==possiblePools[1]))
          poolData[y][x]=possiblePools[0];
        else if(possiblePools.length==2){
          let b=false;
          for(let y2=0;y2<this.height;y2++){
            for(let x2=0;x2<this.width;x2++){
              b=x==x2&&y==y2;
              if(b) break;

              if(poolData[y2][x2]==possiblePools[1]) poolData[y2][x2]=possiblePools[0];
            }
            if(b) break;
          }

          poolData[y][x]=possiblePools[0];
        }
      }
    }

    let pools=[];
    for(let y=0;y<this.height;y++){
      for(let x=0;x<this.width;x++){
        if(poolData[y][x]===undefined) continue;
        if(pools[poolData[y][x]]==undefined) pools[poolData[y][x]]=[];

        pools[poolData[y][x]].push(new Vector(x,y));
      }
    }

    let maybePaths=[];
    for(let pool of pools.filter(p=>p!==undefined)){
      pool=pool.map(pos=>{return{
        pos,
        conns:{},
      };});
      for(const data of pool){
        data.conns.left=pool.find(d=>data.pos.left().equals(d.pos));
        data.conns.right=pool.find(d=>data.pos.right().equals(d.pos));
        data.conns.up=pool.find(d=>data.pos.up().equals(d.pos));
        data.conns.down=pool.find(d=>data.pos.down().equals(d.pos));
      }

      let maybePath = findLongestShortest(pool[0], pool, maybePaths);

      for(let y=0;y<this.height;y++){
        for(let x=0;x<this.width;x++){
          let pos = new Vector(x,y);
          if(!pool.some(p=>p.pos.equals(pos))||
            maybePath.some(p=>p.pos.equals(pos))) continue;

          let map=[
            [[-1,-1],[0,-1],[1,-1]],
            [[-1,0],[1,0]],
            [[-1,1],[0,1],[1,1]],
          ].map(r=>r.map(p=>{
            let offs=new Vector(p[0],p[1]);
            return !!pool.find(p=>p.pos.equals(pos.add(offs)));
          })).flat().reduce((a,c)=>a*2+(c?0:1),0);

          if(map==0b0010_1111||
              map==0b1001_0111||
              map==0b1110_1001||
              map==0b1111_0100||

              (map|0b1010_0101)==0b1111_1101||
              (map|0b1010_0101)==0b1011_1111||
              (map|0b1010_0101)==0b1110_1111||
              (map|0b1010_0101)==0b1111_0111){
            //valid start
            findLongestShortest(pool.find(p=>p.pos.equals(pos)), pool, maybePaths);
          }
        }
      }
    }

    if(maybePaths.length==0) this.path=[];
    else
      this.path=maybePaths.sort((p1,p2)=>p2.length-p1.length)[0].map(p=>p.pos);
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
    
    for(const omino of this.ominoes)
      omino.render(this.renderData.scale, new Vector(0,0), env);
  }

  clone(){
    let toReturn = new Board(this.width, this.height);
    toReturn.ominoes=[...this.ominoes];
    toReturn.recalcPath();
    return toReturn;
  }

  toLink(){
    let args = {
      fullscreen:false,
      palette:allPalettes.indexOf(Data.scene.paletteScene.palette)+1,
      dims:this.width+"$"+this.height,
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