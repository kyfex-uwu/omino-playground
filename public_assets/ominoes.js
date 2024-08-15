
class Vector{
  constructor(x,y){
    this.x=x;
    this.y=y;
  }
  
  add(other){ return new Vector(this.x+other.x,this.y+other.y); }
  sub(other){ return new Vector(this.x-other.x,this.y-other.y); }
  scale(amt){ return new Vector(this.x*amt,this.y*amt); }
  round(){ return new Vector(Math.round(this.x),Math.round(this.y)); }

  left(){ return new Vector(this.x-1,this.y); }
  right(){ return new Vector(this.x+1,this.y); }
  up(){ return new Vector(this.x,this.y-1); }
  down(){ return new Vector(this.x,this.y+1); }
  
  equals(other){ return this.x==other.x&&this.y==other.y; }
}
Vector.dirs="left,right,up,down".split(",");

//--

const ominoSpacing=0.05;
const ominoRadius = 0.15;
class Omino{
  constructor(pos, color, vectors){
    this.pos=pos;
    this.color=color;
    this.vectors = vectors;
    
    this.tiles = [];
    let maxWidth=0;
    for(const vector of vectors){
      while(!this.tiles[vector.y]) this.tiles.push([]);
      this.tiles[vector.y][vector.x]=true;
      maxWidth=Math.max(maxWidth,vector.x+1);
    }
    for(const row of this.tiles)
      while(row.length<maxWidth) row.push(false);
  }
  
  get(pos){
    let newPos = pos.sub(this.pos);
    if(this.tiles[newPos.y]) return !!this.tiles[newPos.y][newPos.x];
    return false;
  }
  height(){ return Math.max(...this.vectors.map(t=>t.y))+1; }
  width(){ return Math.max(...this.vectors.map(t=>t.x))+1; }
  
  render(scale, pos){
    fill.apply(null,this.color);
    for(let y=0;y<this.tiles.length;y++){
      for(let x=0;x<this.tiles[y].length;x++){
        if(!this.tiles[y][x]) continue;
        rect(pos.x+(this.pos.x+x+ominoSpacing)*scale,
          pos.y+(this.pos.y+y+ominoSpacing)*scale,
          scale*(1-ominoSpacing*2),scale*(1-ominoSpacing*2),
          scale*ominoRadius);
        
        let corner=0;
        if(this.tiles[y][x+1]){
          rect(pos.x+(this.pos.x+x+1-ominoSpacing-ominoRadius)*scale,
            pos.y+(this.pos.y+y+ominoSpacing)*scale,
            scale*(ominoRadius*2+ominoSpacing)+1,scale*(1-ominoSpacing*2));
          corner++;
        }
        if(this.tiles[y+1]&&this.tiles[y+1][x]){
          rect(pos.x+(this.pos.x+x+ominoSpacing)*scale,
            pos.y+(this.pos.y+y+1-ominoSpacing-ominoRadius)*scale,
            scale*(1-ominoSpacing*2),scale*(ominoRadius*2+ominoSpacing)+1);
          corner++;
        }
        if(corner==2&&this.tiles[y+1]&&this.tiles[y+1][x+1]){
          rect(pos.x+(this.pos.x+x+1-ominoSpacing)*scale-1,
            pos.y+(this.pos.y+y+1-ominoSpacing)*scale-1,
            scale*ominoSpacing*2+2,scale*ominoSpacing*2+2);
        }
      }
    }
  }
  
  clone(){
    return new Omino(this.pos,this.color,this.vectors);
  }
  rotatedCCW(){
    return new Omino(this.pos,this.color,this.vectors.map(v=>
      new Vector(v.y,this.tiles[0].length-v.x-1)));
  }
  rotatedCW(){
    return new Omino(this.pos,this.color,this.vectors.map(v=>
      new Vector(this.tiles.length-v.y-1,v.x)));
  }
  rotated180(){
    return new Omino(this.pos,this.color,this.vectors.map(v=>
      new Vector(this.tiles[0].length-v.x-1,this.tiles.length-v.y-1)));
  }
  mirroredV(){
    return new Omino(this.pos,this.color,this.vectors.map(v=>
      new Vector(v.x,this.tiles.length-v.y-1)));
  }
  mirroredH(){
    return new Omino(this.pos,this.color,this.vectors.map(v=>
      new Vector(this.tiles[0].length-v.x-1,v.y)));
  }
}
class LockedOmino extends Omino{
  constructor(vectors){
    super(new Vector(0,0), [0,0,0], vectors);
  }
  
  render(){}
}

const OminoColors = {
  I: [255, 23, 69],
  L: [255, 212, 23],
  Y: [8, 156, 8],
  W: [31, 181, 133],
  V: [212, 121, 237],
  T: [50, 82, 199],
  P: [87, 242, 110],
  N: [133, 253, 255],
  F: [237, 123, 36],
  X: [255, 133, 222],
  Z: [107, 64, 33],
  U: [100, 14, 176],
};
function genHashColor(tiles){
  let w=0;
  for(const tile of tiles)
    if(tile.x>w) w=tile.x;

  let data=0;
  for(const num of tiles.map(t=>t.x+t.y*w)){
    data=data^num;
  }

  return Object.values(OminoColors)[data%Object.values(OminoColors).length];
}
class OminoPalette{
  constructor(ominoDatas, canDraw){
    this.data=ominoDatas;
    if(canDraw===undefined) canDraw = Object.values(ominoDatas).length>20;
    this.canDraw=canDraw;

    for(const data of Object.values(this.data))
      data.positions = data.positions
        .split("/")
        .map((l,y)=>
          l.split("").map((c,x)=>c==" "?undefined:new Vector(x,y))
            .filter(v=>v!=undefined))
        .flat();
  }
  get(key, pos){
    return new Omino(pos, this.data[key].color, this.data[key].positions);
  }
}
const Pentominoes = new OminoPalette({
  I:{ color: OminoColors.I, positions: "#/#/#/#/#" },
  L:{ color: OminoColors.L, positions: "#/#/#/##" },
  Y:{ color: OminoColors.Y, positions: " #/##/ #/ #" },
  W:{ color: OminoColors.W, positions: " ##/##/#" },
  V:{ color: OminoColors.V, positions: "  #/  #/###" },
  T:{ color: OminoColors.T, positions: "###/ # / # " },
  P:{ color: OminoColors.P, positions: "##/##/ #" },
  N:{ color: OminoColors.N, positions: " ###/##" },
  F:{ color: OminoColors.F, positions: " ##/##/ #" },
  X:{ color: OminoColors.X, positions: " #/###/ #" },
  Z:{ color: OminoColors.Z, positions: "##/ #/ ##" },
  U:{ color: OminoColors.U, positions: "##/#/##" },
});
const Tetronimoes = new OminoPalette({
  O:{ color: OminoColors.L, positions: "##/##" },
  I:{ color: OminoColors.N, positions: "####" },
  S:{ color: OminoColors.Y, positions: "##/ ##" },
  T:{ color: OminoColors.V, positions: "###/ #" },
  L:{ color: OminoColors.F, positions: "###/#" },
});

const ominoPalettes = [0,0,0, Tetronimoes, Pentominoes];

//--

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
      scale:20,
      pos:new Vector(0,0)
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
  
  render(pos){
    fill(255, 50);
    for(let y=0;y<this.height;y++){
      for(let x=0;x<this.width;x++){
        if(this.get(new Vector(x,y))) continue;
        
        rect((x+tileSpacing)*this.renderData.scale,
          (y+tileSpacing)*this.renderData.scale,
          this.renderData.scale*(1-tileSpacing*2),this.renderData.scale*(1-tileSpacing*2),
          this.renderData.scale*tileRadius);
      }
    }

    push();
    stroke(255, 100);
    scale(this.renderData.scale);
    translate(0.5,0.5);
    strokeWeight(0.1);
    for(let i=1;i<this.path.length;i++){
      line(this.path[i-1].x,this.path[i-1].y, this.path[i].x,this.path[i].y);
    }
    pop();

    fill(0);
    push();
    textAlign(CENTER,CENTER);
    textSize(this.renderData.scale*0.5);
    for(let i=0;i<this.path.length;i++){
      text(i+1,(this.path[i].x+0.5)*this.renderData.scale, (this.path[i].y+0.5)*this.renderData.scale);
    }
    pop();
    
    let over = this.get(new Vector(mouseX,mouseY).sub(pos).scale(1/this.renderData.scale)
      .sub(new Vector(0.5,0.5)).round());
    if(over&&!(over instanceof LockedOmino))
      cursor(MOVE);
    
    for(const omino of this.ominoes)
      omino.render(this.renderData.scale, new Vector(0,0));
  }
}

//--

class Scene{
  constructor(){
    this.pos=new Vector(0,0);
    this.subScenes=[];
    this.parent=undefined;
  }
  addScene(scene){
    this.subScenes.push(scene);
    scene.parent=this;

    return scene;
  }
  render(){
    for(const scene of this.subScenes){
      push();
      translate(scene.pos.x,scene.pos.y);
      scene.render();
      pop();
    }
  }
  mouseDown(x,y){
    for(const scene of this.subScenes){
      if(scene.mouseDown(x-scene.pos.x,y-scene.pos.y)) return true;
    }
  }
  mouseUp(x,y){
    for(const scene of this.subScenes){
      if(scene.mouseUp(x-scene.pos.x,y-scene.pos.y)) return true;
    }
  }
  keyPressed(key){
    for(const scene of this.subScenes){
      if(scene.keyPressed(key)) return true;
    }
  }
  scrolled(x, y, delta){
    for(const scene of this.subScenes){
      if(scene.scrolled(x-scene.pos.x,y-scene.pos.y, delta)) return true;
    }
  }

  getAbsolutePos(){
    if(!this.parent) return new Vector(0,0);
    return this.parent.getAbsolutePos().add(this.pos);
  }
  resized(oldDims, newDims){
    for(const scene of this.subScenes){
      scene.resized(oldDims, newDims);
    }
  }
}
class DimsScene extends Scene{
  constructor(){
    super();
    this.dims=new Vector(0,0);
  }
  isIn(){
    if(this.parent instanceof DimsScene && !this.parent.isIn()) return false;
    let absPos = this.getAbsolutePos();
    return mouseX>absPos.x&&mouseY>absPos.y&&mouseX<absPos.x+this.dims.x&&mouseY<absPos.y+this.dims.y;
  }
}
class ButtonScene extends DimsScene{
  constructor(){
    super();
  }
  mouseDown(x,y){
    if(this.isIn()){
      this.click(x, y);
      return true;
    }
  }
  click(){}
}
class OneTimeButtonScene extends ButtonScene{
  constructor(render, click){
    super();

    this.renderFunc=render;
    this.clickFunc=click;
  }
  render(){ this.renderFunc(this); }
  click(x, y){ this.clickFunc(this, x, y); return true; }
}

class BoardScene extends DimsScene{
  constructor(w,h){
    super();
    this.board = new Board(w,h);
  }
  render(){
    this.board.render(this.getAbsolutePos());
    this.dims = new Vector(this.board.width, this.board.height).scale(this.board.renderData.scale);
  }
  setBounds(width,height){
    this.board.renderData.scale = Math.min(width/this.board.width, height/this.board.height);
  }
  moveToCenter(){
    this.pos = new Vector(width/2-this.board.renderData.scale*this.board.width/2,10);
  }
  mouseUp(x,y){
    x=Math.floor(x/this.board.renderData.scale);
    y=Math.floor(y/this.board.renderData.scale);
    if(x<0||x>=this.board.width||y<0||y>=this.board.height) return false;

    if(!this.parent.mouseData.omino){
      let omino = this.board.get(new Vector(x,y));
      if(omino&&!(omino instanceof LockedOmino)){
        this.board.remove(omino);

        this.parent.mouseData.omino = omino;
        this.parent.mouseData.offs = new Vector(mouseX,mouseY).sub(
          this.parent.mouseData.omino.pos
            .scale(this.board.renderData.scale)
            .add(this.getAbsolutePos()));

        omino.pos = new Vector(0,0);
      }
    }else{
      let newPos = new Vector(mouseX,mouseY).sub(this.parent.mouseData.offs)
        .sub(this.pos).scale(1/this.board.renderData.scale)
        .round();

      let valid=true;
      for(let y=0;y<this.parent.mouseData.omino.tiles.length;y++){
        for(let x=0;x<this.parent.mouseData.omino.tiles[y].length;x++){
          if(!this.parent.mouseData.omino.tiles[y][x]) continue;
          if(this.board.get(newPos.add(new Vector(x,y)))){
            valid=false;
            break;
          }
        }
        if(!valid) break;
      }

      if(valid){
        this.parent.mouseData.omino.pos = newPos;
        this.board.add(this.parent.mouseData.omino);
        this.parent.mouseData = {
          omino:undefined,
          offs:undefined
        };
      }
    }
  }
}
class OminoPaletteSpace extends ButtonScene{
  constructor(omino, index){
    super();
    this.index=index;
    this.omino=omino;
  }
  render(){
    fill(0);
    if(this.isIn()) fill(80);
    rect(this.dims.x*0.05,this.dims.y*0.05,this.dims.x*0.9,this.dims.y*0.9,this.dims.x*0.1);

    let scale=this.dims.x*0.8/Math.max(this.omino.tiles.length,this.omino.tiles[0].length);
    this.omino.render(scale, new Vector(
      (this.dims.x-this.omino.tiles[0].length*scale)/2,
      (this.dims.y-this.omino.tiles.length*scale)/2));
  }
  click(x, y){
    this.parent.parent.parent.mouseData.omino = this.omino.clone();
    let scale = this.parent.parent.parent.boardScene.board.renderData.scale;
    this.parent.parent.parent.mouseData.offs = 
      new Vector(scale*this.omino.tiles[0].length/2, scale*this.omino.tiles.length/2);
    return true;
  }

  recalc(palette){
    let scale=palette.dims.x/3;

    this.pos = new Vector(this.index%3*scale, Math.floor(this.index/3)*scale+palette.offs);
    this.dims = new Vector(scale, scale);
  }
}
class Scrollable extends DimsScene{
  constructor(){
    super();
    this.offs=0;
  }
  scrolled(x,y,delta){
    if(!this.isIn()) return false;

    this.offs-=delta*0.5;
    return true;
  }
}
class PaletteScene extends Scrollable{
  constructor(palette){
    super();
    this.palette=palette;

    this.piecesHolder = new DimsScene();
    this.drawButton = {};

    this.spaces=[];
    let i=0;
    for(const ominoName of Object.keys(palette.data)){
      this.spaces.push(this.piecesHolder.addScene(new OminoPaletteSpace(palette.get(ominoName,new Vector(0,0)), i)));
      i++;
    }
    this.addScene(this.piecesHolder);

    if(this.palette.canDraw){
      this.drawButton = this.addScene(new OneTimeButtonScene(s=>{
        fill(50);
        rect(s.dims.x/2-this.dims.x/2,-this.dims.y*0.01,this.dims.x,this.dims.y*0.1);
        fill(s.isIn()?150:100);
        rect(0, 0, s.dims.x,s.dims.y, (s.dims.x+s.dims.y)*0.05);
        fill(255);
        push();
        textAlign(CENTER,CENTER);
        textSize((s.dims.x+s.dims.y)*0.4);
        text("+", s.dims.x/2,s.dims.y/2);
        pop();
      },_=>{
        this.parent.enterDrawingMode();
      }))
    }
  }
  setXAndWidth(x,width){
    this.pos.x=x;
    this.dims.y=height;
    this.dims.x=width;
    this.piecesHolder.dims = new Vector(this.dims.x,this.dims.y*(this.palette.canDraw?0.9:1));
    
    for(const space of this.spaces){
      space.recalc(this);
    }

    this.drawButton.dims = new Vector(this.dims.y*0.08,this.dims.y*0.08);
    this.drawButton.pos = new Vector(this.dims.x/2-this.dims.y*0.08/2,this.dims.y*0.91);
  }
  addOmino(newOmino){
    let space = this.piecesHolder.addScene(new OminoPaletteSpace(newOmino, this.spaces.length));
    this.spaces.push(space);
    spage.recalc(this);
  }

  render(){
    fill(50);
    rect(0,0,this.dims.x,this.dims.y);

    super.render();
  }
  scrolled(x,y,delta){
    if(!super.scrolled(x,y,delta)) return false;

    this.offs = Math.min(Math.max(-(this.spaces[this.spaces.length-1].pos.y-this.spaces[0].pos.y),this.offs),0);
    for(const space of this.spaces){
      space.recalc(this);
    }
    return true;
  }
}

class LeftBarScene extends Scrollable{
  constructor(){
    super();

    this.message="Changelog"+
      "\nv0.1.5 8/10/24"+
      "\n  - Added better omino rotation"+
      "\n  - Added better(?) fullscreen"+
      "\n  - Added changelog (+ arbitrary version "+
      "\n     number lol)"+
      "\n\nMore soon"+
      "\n- Sharing preset board"+
      "\n- Palette swaps/rendering changes"+
      "\n(most of these are possible if you\n know how to code in JS)"+
      "\n\nFor any bugs, pls dm me on discord\n @kyfexuwu"+
      "\n\nKey shortcuts: wasd + qe + x do stuff :3"+
      "\n\nURL params:"+
      "\n  - dims=X,Y - board dimensions"+
      "\n  - ominoPalette=N - omino size";
  }
  resized(old,n){
    this.dims.y=height;
    this.dims.x=width/4;
    super.resized(old,n);
  }
  scrolled(x,y,delta){
    if(!super.scrolled(x,y,delta)) return false;

    this.offs = Math.min(Math.max(-(this.message.split("\n").length-1)*13-7,this.offs),0);
    return true;
  }

  render(){
    push();
    fill(50);
    rect(0,0,this.dims.x,height);
    translate(0,this.offs);
    scale(this.dims.x/100);
    fill(255);
    textSize(5);
    text(this.message, 3,7);

    pop();
    super.render();
  }
}

class DrawingModeScene extends Scene{
  constructor(mainScene){
    super();
    this.mainScene=mainScene;

    this.newTiles=[];

    this.confButton = this.addScene(new OneTimeButtonScene(s=>{
      fill(s.isIn()?150:100);
      rect(0,0,s.dims.x,s.dims.y);
      fill(255);
      push();
      textAlign(CENTER,CENTER);
      textSize((s.dims.x+s.dims.y)*0.17);
      text("Confirm", s.dims.x/2,s.dims.y/2);
      pop();
    },s=>{
      if(this.newTiles.length==0) return;

      currScene = this.mainScene;

      let pos = new Vector(0,0);
      while(!this.newTiles.some(t=>t.x==0)){
        pos.x++;
        for(const tile of this.newTiles) tile.x--;
      }
      while(!this.newTiles.some(t=>t.y==0)){
        pos.y++;
        for(const tile of this.newTiles) tile.y--;
      }

      let color = genHashColor(this.newTiles);
      let forPalette = new Omino(new Vector(0,0), color, this.newTiles);
      let newOmino = new Omino(pos, color, this.newTiles);
      currScene.boardScene.board.add(newOmino);
      currScene.paletteScene.addOmino(forPalette);
    }));

    this.resized(new Vector(width,height),new Vector(width,height));
  }
  render(){
    this.mainScene.render();

    let board=this.mainScene.boardScene;
    fill(0,100);
    beginShape();
    vertex(board.pos.x,0);
    vertex(width,0);
    vertex(width,height);
    vertex(0,height);
    vertex(0,0);
    vertex(board.pos.x,0);
    vertex(board.pos.x,board.pos.y+board.dims.y);
    vertex(board.pos.x+board.dims.x,board.pos.y+board.dims.y);
    vertex(board.pos.x+board.dims.x,board.pos.y);
    vertex(board.pos.x,board.pos.y);
    endShape();

    push();
    translate(board.pos.x,board.pos.y);
    scale(board.board.renderData.scale);
    fill(255);
    for(const point of this.newTiles){
      rect(point.x,point.y,1,1);
    }
    pop();

    super.render();
  }

  mouseDown(x,y){
    let board=this.mainScene.boardScene;
    if(x>board.pos.x&&y>board.pos.y&&x<board.pos.x+board.dims.x&&y<board.pos.y+board.dims.y){
      let newX=Math.floor((x-board.pos.x)/board.dims.x*board.board.width);
      let newY=Math.floor((y-board.pos.y)/board.dims.y*board.board.height);

      var newPos = new Vector(newX,newY);
      if(this.newTiles.some(p=>p.equals(newPos))){
        this.newTiles.splice(this.newTiles.findIndex(p=>p.equals(newPos)),1);
      }else{
        this.newTiles.push(newPos);
      }
    }
    
    super.mouseDown(x,y);
  }

  resized(oldDims, newDims){
    this.mainScene.resized(oldDims, newDims);

    this.confButton.dims = new Vector(width/6, width/6*0.3);
    this.confButton.pos = new Vector(width/2-width/6/2,
      this.mainScene.boardScene.pos.y+this.mainScene.boardScene.dims.y+height*0.01);

    super.resized(oldDims, newDims);
  }
}

class MainScene extends Scene{
  constructor(){
    super();

    this.boardScene = this.addScene(new BoardScene(pageData.dims[0],pageData.dims[1]));
    this.paletteScene = this.addScene(new PaletteScene(ominoPalettes[pageData.ominoPalette]));
    this.leftBarScene = this.addScene(new LeftBarScene());

    this.drawingMode=false;

    const drawText = (m, xOffs)=>{
      return s=>{
        fill(255,s.isIn()?150:100);
        rect(0,0,s.dims.x,s.dims.y, Math.min(s.dims.x,s.dims.y)*0.1);

        push();
        scale((s.dims.x+s.dims.y)*0.01);
        textSize(30);
        textAlign(CENTER,CENTER);
        fill(0);
        text(m, 25,25);
        pop();
      }
    }

    this.buttonGrid = [
      [
        {b:this.addScene(new OneTimeButtonScene(drawText("↶", 40),()=>{
          if(!this.mouseData.omino) return;
          let oldWidth=this.mouseData.omino.width();
          this.mouseData.omino = this.mouseData.omino.rotatedCCW();
          this.mouseData.offs = new Vector(this.mouseData.offs.y,
            oldWidth*this.boardScene.board.renderData.scale-
              this.mouseData.offs.x);
        })), key:"CCW"},
        {b:this.addScene(new OneTimeButtonScene(drawText("↷", 30),()=>{
          if(!this.mouseData.omino) return;
          let oldHeight = this.mouseData.omino.height();
          this.mouseData.omino = this.mouseData.omino.rotatedCW();
          this.mouseData.offs = new Vector(
            oldHeight*this.boardScene.board.renderData.scale-this.mouseData.offs.y,
            this.mouseData.offs.x);
        })), key:"CW"},
        {b:{}},
        {b:this.addScene(new OneTimeButtonScene(drawText("X", 25),()=>{
          this.mouseData.omino=undefined;
        })), key:"X"}
      ],
      [
        {b:this.addScene(new OneTimeButtonScene(drawText("↕", 20),()=>{
          if(!this.mouseData.omino) return;
          this.mouseData.omino = this.mouseData.omino.mirroredV();
          this.mouseData.offs.y=this.mouseData.omino.height()*this.boardScene.board.renderData.scale-
            this.mouseData.offs.y;
        })), key:"MV"},
        {b:this.addScene(new OneTimeButtonScene(drawText("↔", 40),()=>{
          if(!this.mouseData.omino) return;
          this.mouseData.omino = this.mouseData.omino.mirroredH();
          this.mouseData.offs.x=this.mouseData.omino.width()*this.boardScene.board.renderData.scale-
            this.mouseData.offs.x;
        })), key:"MH"},
        {b:{}},
        {b:this.addScene(new OneTimeButtonScene(drawText("⛶", 35),()=>{
          isFullscreened=!isFullscreened;
          windowResized();
        }))},
      ],
    ];

    this.mouseData = {
      omino:undefined,
      offs:undefined
    };
  }

  enterDrawingMode(){
    this.mouseData.omino=undefined;

    currScene = new DrawingModeScene(this);
  }

  render(){
    background(173, 111, 153);

    super.render();

    if(this.mouseData.omino){
      this.mouseData.omino.render(this.boardScene.board.renderData.scale, new Vector(mouseX,mouseY).sub(this.mouseData.offs));
      cursor(MOVE);
    }
  }
  resized(oldDims, newDims){
    let oldScale = this.boardScene.board.renderData.scale;
    this.boardScene.setBounds(width/2, height*2/3);
    this.boardScene.moveToCenter();

    this.paletteScene.setXAndWidth(width*3/4,width/4);
    this.leftBarScene.dims.x=width/4;

    let size = Math.min(width/2/this.buttonGrid[0].length,height/3/this.buttonGrid.length);
    for(let y=0;y<this.buttonGrid.length;y++){
      for(let x=0;x<this.buttonGrid[y].length;x++){
        this.buttonGrid[y][x].b.dims = new Vector(size*0.8, size*0.8);
        this.buttonGrid[y][x].b.pos = new Vector(width/2-size*2+(x+0.1)*size, height*2/3+(y+0.1)*size);
      }
    }

    if(this.mouseData.omino){
      this.mouseData.offs=this.mouseData.offs.scale(this.boardScene.board.renderData.scale/oldScale);
    }

    super.resized(oldDims, newDims);
  }

  keyPressed(key){
    for(const [name,vals] of Object.entries(keys)){
      let consumed=false;
      if(vals.includes(key)){
        for(const row of this.buttonGrid){
          for(const button of row){
            if(button.key==name){
              button.b.click(0,0);
              consumed=true;
              break;
            }
          }
          if(consumed) break;
        }
        
        if(consumed) return true;
      }
    }

    return super.keyPressed(key);
  }
}

//--

const keys = {
  CCW:"q",
  CW:"e",
  MH:"ad",
  MV:"ws",
  DEL:"x",
};

//--

const pageData={
  dims:{
    val:"7,7",
    transform:d=>d.split(",").map(v=>parseInt(v)),
    validate:v=>v instanceof Object && !isNaN(v[0]) && !isNaN(v[1])
  },
  ominoPalette:{
    val:"5",
    transform:d=>parseInt(d)-1,
    validate:v=>{
      if(!Number.isInteger(v)) return false;
      if(!ominoPalettes[v]) ominoPalettes[v] = new OminoPalette([],true);
      return true;
    }
  }
};
for(const [key, val] of new URLSearchParams(window.location.search).entries()){
  if(!pageData[key]) continue;

  pageData[key].newVal=val;
}
for(const key of Object.keys(pageData)){
  let newVal;
  try{
    newVal = pageData[key].transform(pageData[key].newVal||pageData[key].val);
  }catch(e){
    console.log(`error with key ${key}: ${e}`);
  }
  if(!pageData[key].validate(newVal)){
    newVal = pageData[key].transform(pageData[key].val);
    console.log(`${key} not valid`);
  }

  pageData[key]=newVal;
}

//--

let currScene;
let isFullscreened;
let canvElt;
function setup() {
  noStroke();
  canvElt = createCanvas(0,0).elt;
  document.getElementById("app").appendChild(canvElt);
  canvElt.addEventListener("contextmenu", e=>e.preventDefault());
  canvElt.addEventListener("scroll", e=>e.preventDefault());

  currScene = new MainScene();
  windowResized();
}
function windowResized(){
  let oldWidth=width;
  let oldHeight=height;
  let newWidth;
  let newHeight;
  if(isFullscreened){
    newWidth=windowWidth;
    newHeight=windowHeight;

    Object.assign(canvElt.style,{
      position:"absolute",
      left:0,
      top:0
    });
    document.getElementById("lightmode-toggle").style.display="none";
  }else{
    newWidth = canvElt.parentElement.clientWidth;
    newHeight = Math.min(canvElt.parentElement.clientWidth*3/4, windowHeight*0.96);

    Object.assign(canvElt.style,{
      position:"static"
    });
    document.getElementById("lightmode-toggle").style.display="unset";
  }
  resizeCanvas(newWidth, newHeight);
  currScene.resized(new Vector(oldWidth, oldHeight), new Vector(width, height));
}

function mousePressed(){
  currScene.mouseDown(mouseX,mouseY);
}
function mouseReleased(){
  currScene.mouseUp(mouseX,mouseY);
}
function keyPressed(){
  currScene.keyPressed(key);
}
function mouseWheel(e){
  if(mouseX>=0&&mouseY>=0&&mouseX<width&&mouseY<height)
    currScene.scrolled(mouseX, mouseY, e.delta);
}

function draw() {
  clear();
  cursor(ARROW);
  textSize(30);
  noStroke();
  noFill();
  currScene.render();

  document.body.style.overflow=
    (mouseX>=0&&mouseY>=0&&mouseX<width&&mouseY<height)?"hidden":"unset";
}