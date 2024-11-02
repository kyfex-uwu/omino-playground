import Vector from "/assets/omino/Vector.js";
import {Colors, background, getColor, fill} from "/assets/omino/Colors.js";
import OminoEl from "/assets/omino/pathfinding/OminoEl.js";
import RectOrientation from "/assets/omino/pathfinding/orientation/RectOrientation.js";

const ominoSpacing=0.05;
const ominoRadius = 0.15;

function toTree(vectors, currVector){
  let toReturn={};

  for(const [index, dir] of [
    [0,"up"],
    [1,"right"],
    [2,"down"],
    [3,"left"]
  ]){
    let next;
    if(next = vectors.find(v=>!v.parsed&&v[dir]().equals(currVector))){
      next.parsed=true;
      toReturn[index]=toTree(vectors, next);
    }
  }

  return toReturn;
}

class Omino{
  constructor(pos, color, vectors){
    this.pos=pos;
    this.color=color;
    this.vectors = vectors;

    this.elementFactory = OminoEl.factory(toTree(vectors, vectors[0]));
    
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
        let loopedPositions = this.vectors.map(p => p.add(pos));
        for(const subPos of loopedPositions) {
            while(subPos.x < 0) subPos.x += board.width;
            while(subPos.x >= board.width) subPos.x -= board.width;
            while(subPos.y < 0) subPos.y += board.height;
            while(subPos.y >= board.height) subPos.y -= board.height;
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
  
  renderWithClip(scale, pos, func, {env=p5, stroke=0}={}){
    env.push();
    env.beginClip();
    env.fill(0);
    for(let y=0;y<this.tiles.length;y++){
      for(let x=0;x<this.tiles[y].length;x++){
        if(!this.tiles[y][x]) continue;
        env.rect(pos.x+(this.pos.x+x+ominoSpacing)*scale-stroke,
          pos.y+(this.pos.y+y+ominoSpacing)*scale-stroke,
          scale*(1-ominoSpacing*2)+stroke*2,scale*(1-ominoSpacing*2)+stroke*2,
          scale*ominoRadius+stroke);
        if(isNaN(stroke)) console.trace()

        let corner=0;
        if(this.tiles[y][x+1]){
          env.rect(pos.x+(this.pos.x+x+1-ominoSpacing-ominoRadius)*scale-stroke,
            pos.y+(this.pos.y+y+ominoSpacing)*scale-stroke,
            scale*(ominoSpacing+ominoRadius)*2+stroke*2,scale*(1-ominoSpacing*2)+stroke*2);
          corner++;
        }
        if(this.tiles[y+1]&&this.tiles[y+1][x]){
          env.rect(pos.x+(this.pos.x+x+ominoSpacing)*scale-stroke,
            pos.y+(this.pos.y+y+1-ominoSpacing-ominoRadius)*scale-stroke,
            scale*(1-ominoSpacing*2)+stroke*2,scale*(ominoSpacing+ominoRadius)*2+stroke*2);
          corner++;
        }
        if(corner==2&&this.tiles[y+1]&&this.tiles[y+1][x+1]){
          env.rect(pos.x+(this.pos.x+x+1-ominoSpacing-0.01)*scale-stroke,
            pos.y+(this.pos.y+y+1-ominoSpacing-0.01)*scale-stroke,
            scale*(ominoSpacing+0.01)*2+stroke*2,scale*(ominoSpacing+0.01)*2+stroke*2);
        }
      }
    }
    env.endClip();

    func();
    env.pop();
  }
  render(scale, pos, {env=p5, stroke=0}={}){
    this.renderWithClip(scale, pos, _=>{
      background(this.color, env);
    }, {env, stroke});
  }
  renderTransparent(scale, pos, {env=p5, transparency=170, stroke=0}={}){
    this.renderWithClip(scale, pos, _=>{
      let newColors=[...getColor(this.color)];
      newColors[3]=transparency;
      env.background.apply(env,newColors);
    }, {env, stroke});
  }
  renderHighlighted(scale, pos, {env=p5, stroke=0}={}){
    this.renderWithClip(scale, pos, _=>{
      background(this.color, env);

      env.push();
      env.translate(pos.x,pos.y);
      env.scale(scale);
      env.translate(this.pos.x,this.pos.y);
      let color=getColor(this.color).map(c=>255-c);
      color[3]=200;
      env.fill.apply(env, color);
      for(let i=-(p5.frameCount*0.004%0.7);i<this.width()+this.height()*0.5;i+=0.7){
        env.beginShape();
        env.vertex(i, -0.05);
        env.vertex(i+0.3,-0.05);
        env.vertex(i+0.3-this.height()*0.5,this.height()+0.05);
        env.vertex(i-this.height()*0.5, this.height()+0.05);
        env.endShape();
      }
      env.pop();
    }, {env, stroke});
  }
  
  clone(){
    let toReturn = new Omino(this.pos,this.color,this.vectors);
    toReturn.elementFactory = this.elementFactory;
    return toReturn;
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

  getEl(nodes){
    return this.elementFactory([...nodes].find(node=>
      node.custom.pos.equals(this.vectors[0].add(this.pos))), RectOrientation.default);
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
    let size = new Vector(Math.max(this.width(),other.width()),
      Math.max(this.height(),other.height()));

    for(let y=0;y<size.y;y++){
      for(let x=0;x<size.x;x++){
        let pos = new Vector(x,y).add(minPos);
        if(this.get(pos)!=other.get(pos))
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
  
  renderWithClip(){}
  clone(){
    let cloneFrom = super.clone();
    let toReturn = new LockedOmino([]);

    toReturn.pos=cloneFrom.pos;
    toReturn.vectors = cloneFrom.vectors;
    toReturn.tiles = cloneFrom.tiles;

    return toReturn;
  }
}

const colorNames="ILYWVTPNFXZU".split("");
function genHashColor(tiles){
  let w=0;
  for(const tile of tiles)
    if(tile.x>w) w=tile.x;

  let data=0;
  for(const num of tiles.map(t=>t.x+t.y*w)){
    data=data^num;
  }

  return "ominoColors."+colorNames[data%colorNames.length];
}

export {
  Omino,
  LockedOmino,
  genHashColor
};