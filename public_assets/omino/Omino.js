import Vector from "/assets/omino/Vector.js"

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
  getOnTorus(pos, boardDims){
    let newPos = pos.clone();
    while(newPos.x>=this.pos.x) newPos.x-=boardDims.x;
    while(newPos.x<this.pos.x) newPos.x+=boardDims.x;
    while(newPos.y>=this.pos.y) newPos.y-=boardDims.y;
    while(newPos.y<this.pos.y) newPos.y+=boardDims.y;

    let w=this.width();
    let h=this.height();
    for(let y=0;y<h;y+=boardDims.y){
      for(let x=0;x<w;x+=boardDims.x){
        if(this.get(newPos.add(new Vector(x,y)))) return true;
      }
    }
    return false;
  }
  canPlace(board, pos){
    if(board.torusMode) {
        while(pos.x < 0) pos.x += board.width;
        while(pos.y < 0) pos.y += board.height;
        pos.x %= board.width;
        pos.y %= board.height;
    }

    let valid = true;
    for(let y = 0; y < this.tiles.length; y++) {
        for(let x = 0; x < this.tiles[y].length; x++) {
            if(!this.tiles[y][x]) continue;
            let thisPos = pos.add(new Vector(x, y));
            if(board.torusMode) {
                while(thisPos.x < 0) thisPos.x += board.width;
                while(thisPos.y < 0) thisPos.y += board.height;
                thisPos.x %= board.width;
                thisPos.y %= board.height;
            }
            if(board.get(thisPos)) {
                valid = false;
                break;
            }
        }
        if(!valid) break;
    }
    if(board.torusMode) {
        let loopedPositions = this.vectors.map(p => p.add(this.pos));
        for(const pos of loopedPositions) {
            while(pos.x < 0) pos.x += board.width;
            while(pos.x >= board.width) pos.x -= board.width;
            while(pos.y < 0) pos.y += board.height;
            while(pos.y >= board.height) pos.y -= board.height;
        }
        for(let i = 0; i < loopedPositions.length; i++) {
            for(let j = i + 1; j < loopedPositions.length; j++) {
                if(loopedPositions[i].equals(loopedPositions[j])) {
                    valid = false;
                    break;
                }
            }
            if(!valid) break;
        }
    }

    return valid?pos:false;
}
  height(){ return Math.max(...this.vectors.map(t=>t.y))+1; }
  width(){ return Math.max(...this.vectors.map(t=>t.x))+1; }
  
  render(scale, pos, env=p5){
    env.fill.apply(env,this.color);
    for(let y=0;y<this.tiles.length;y++){
      for(let x=0;x<this.tiles[y].length;x++){
        if(!this.tiles[y][x]) continue;
        env.rect(pos.x+(this.pos.x+x+ominoSpacing)*scale,
          pos.y+(this.pos.y+y+ominoSpacing)*scale,
          scale*(1-ominoSpacing*2),scale*(1-ominoSpacing*2),
          scale*ominoRadius);
        
        let corner=0;
        if(this.tiles[y][x+1]){
          env.rect(pos.x+(this.pos.x+x+1-ominoSpacing-ominoRadius)*scale,
            pos.y+(this.pos.y+y+ominoSpacing)*scale,
            scale*(ominoSpacing+ominoRadius)*2,scale*(1-ominoSpacing*2));
          corner++;
        }
        if(this.tiles[y+1]&&this.tiles[y+1][x]){
          env.rect(pos.x+(this.pos.x+x+ominoSpacing)*scale,
            pos.y+(this.pos.y+y+1-ominoSpacing-ominoRadius)*scale,
            scale*(1-ominoSpacing*2),scale*(ominoSpacing+ominoRadius)*2);
          corner++;
        }
        if(corner==2&&this.tiles[y+1]&&this.tiles[y+1][x+1]){
          env.rect(pos.x+(this.pos.x+x+1-ominoSpacing-0.01)*scale,
            pos.y+(this.pos.y+y+1-ominoSpacing-0.01)*scale,
            scale*(ominoSpacing+0.01)*2,scale*(ominoSpacing+0.01)*2);
        }
      }
    }
  }
  renderTransparent(scale, pos, env=p5, transparency=170){
    env.push();
    env.beginClip();
    this.render(scale, pos);
    env.endClip();
    env.background.apply(env,[...this.color, transparency]);
    env.pop();
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

  equals(other){
    if(!(other instanceof Omino)) return false;

    let check1=this.clone();
    let check2=other.clone();
    check1.pos = new Vector(0,0);
    check2.pos = new Vector(0,0);

    for(let i=0;i<2;i++){
      for(let j=0;j<4;j++){
        if(check1.equalsExact(check2)) return true;

        check1 = check1.rotatedCW();
      }
      check1 = check1.mirroredH();
    }

    return false;
  }
  equalsExact(other){
    if(!(other instanceof Omino)) return false;

    let minPos = new Vector(Math.max(this.pos.x, other.pos.x),
      Math.max(this.pos.y, other.pos.y));
    let minSize = new Vector(Math.max(this.width(),other.width()),
      Math.max(this.height(),other.height()));

    for(let y=0;y<minSize.y;y++){
      for(let x=0;x<minSize.x;x++){
        if(this.get(new Vector(x,y))!=other.get(new Vector(x,y)))
          return false;
      }
    }
    return true;
  }
}
class LockedOmino extends Omino{
  constructor(vectors){
    super(new Vector(0,0), [0,0,0], vectors);
  }
  
  render(){}
  clone(){
    let cloneFrom = super.clone();
    let toReturn = new LockedOmino([]);

    toReturn.pos=cloneFrom.pos;
    toReturn.vectors = cloneFrom.vectors;
    toReturn.tiles = cloneFrom.tiles;

    return toReturn;
  }
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

export {
  Omino,
  LockedOmino,
  OminoColors,
  genHashColor
};