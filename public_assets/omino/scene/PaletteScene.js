import Vector from "/assets/omino/Vector.js";
import {Omino} from "/assets/omino/Omino.js";
import {ButtonScene, ScrollableScene, DimsScene,
  OneTimeButtonScene, hover} from "/assets/omino/scene/Scene.js";
import Data from "/assets/omino/Main.js";
import {fill, background} from "/assets/omino/Colors.js";

class OminoPaletteSpace extends ButtonScene{
  constructor(omino, index){
    super();
    this.index=index;
    this.omino=omino;
  }
  render(){
    fill(this.isIn()?"scenes.sidebar.button.bgHover":"scenes.sidebar.button.bg");
    p5.rect(this.dims.x*0.05,this.dims.y*0.05,this.dims.x*0.9,this.dims.y*0.9,this.dims.x*0.1);

    let scale=this.dims.x*0.8/Math.max(this.omino.tiles.length,this.omino.tiles[0].length);
    this.omino.renderWithClip(
      scale, new Vector(
        (this.dims.x-this.omino.tiles[0].length*scale)/2,
        (this.dims.y-this.omino.tiles.length*scale)/2), 
      _=>background("ominoColors.outline"), {stroke:scale*0.1});

    this.omino[Data.mainBoard.renderType(this.omino)](
      scale, new Vector(
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

    this.pos = new Vector(this.index%3*scale, Math.floor(this.index/3)*scale-palette.offs);
    this.dims = new Vector(scale, scale);
  }
}

class PieceHolder extends ScrollableScene{
  constructor(){ super({min:0}); }
  resized(oldDims, newDims=oldDims){
    const unit = this.dims.x/3;
    for(let i=0;i<this.subScenes.length;i++){
      const child = this.subScenes[i];
      child.pos = new Vector(i%3*unit, Math.floor(i/3)*unit);
      child.dims = new Vector(unit,unit);
    }

    this.scrollLimits.max=Math.ceil((this.subScenes.length-1)/3)*unit-this.dims.y;

    return super.resized(oldDims, newDims);
  }
}

class PaletteScene extends DimsScene{
  constructor(data){
    super();
    this.palette=data.palette;

    this.piecesHolder = new PieceHolder();
    this.drawButton = {};

    this.spaces=[];
    let i=0;
    for(const ominoName of Object.keys(this.palette.data)){
      this.spaces.push(this.piecesHolder.addScene(new OminoPaletteSpace(this.palette.get(ominoName,new Vector(0,0)), i)));
      i++;
    }
    this.addScene(this.piecesHolder);

    this.drawButton = this.addScene(new OneTimeButtonScene(s=>{
      let scale = this.dims.x/100;
      let sbSize = Math.min(this.dims.x/3, scale*30);
      fill("scenes.sidebar.bg");
      p5.rect(-s.pos.x,-s.pos.y+this.dims.y-sbSize,this.dims.x,sbSize);

      fill(s.isIn()?"scenes.sidebar.button.bgHover":"scenes.sidebar.button.bg");
      p5.rect(0, 0, s.dims.x,s.dims.y, (s.dims.x+s.dims.y)*0.1);
      fill("scenes.sidebar.button.color");
      p5.push();
      p5.translate(s.dims.x/2,s.dims.y/2);
      p5.scale(s.dims.x/100*(s.isIn()?1.1:1));
      p5.rect(-30,-5,60,10);
      p5.rect(-5,-30,10,60);
      p5.pop();

      if(s.isIn()) hover.set("Add Omino", s);
    },_=>{
      this.parent.enterDrawingMode();
    }));
  }
  resized(oldDims, newDims=oldDims){
    this.pos.x = newDims.x*3/4;
    this.dims = new Vector(newDims.x/4, newDims.y);

    let scale = this.dims.x/100;
    let sbSize = Math.min(this.dims.x/3, scale*30);

    this.drawButton.dims = new Vector(sbSize*0.8, sbSize*0.8);
    this.drawButton.pos = new Vector((this.dims.x-sbSize*0.9)/2,this.dims.y-sbSize*0.9);

    this.piecesHolder.dims = new Vector(this.dims.x,this.dims.y-sbSize);

    super.resized(oldDims, newDims);
  }

  addOmino(newOmino){
    let space = this.piecesHolder.addScene(new OminoPaletteSpace(newOmino, this.spaces.length));
    this.spaces.push(space);
    space.recalc(this);
  }

  render(){
    fill("scenes.sidebar.bg");
    p5.rect(0,0,this.dims.x,this.dims.y);

    super.render();
  }
}

export default PaletteScene;