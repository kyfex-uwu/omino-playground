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
            scale*(ominoRadius*2+ominoSpacing)+1,scale*(1-ominoSpacing*2));
          corner++;
        }
        if(this.tiles[y+1]&&this.tiles[y+1][x]){
          env.rect(pos.x+(this.pos.x+x+ominoSpacing)*scale,
            pos.y+(this.pos.y+y+1-ominoSpacing-ominoRadius)*scale,
            scale*(1-ominoSpacing*2),scale*(ominoRadius*2+ominoSpacing)+1);
          corner++;
        }
        if(corner==2&&this.tiles[y+1]&&this.tiles[y+1][x+1]){
          env.rect(pos.x+(this.pos.x+x+1-ominoSpacing)*scale-1,
            pos.y+(this.pos.y+y+1-ominoSpacing)*scale-1,
            scale*ominoSpacing*2+2,scale*ominoSpacing*2+2);
        }
      }
    }
  }
  renderTransparent(scale, pos, env=p5){
    env.push();
    env.beginClip();
    this.render(scale, pos);
    env.endClip();
    env.background.apply(env,[...this.color, 170]);
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