import Vector from "/assets/omino/Vector.js";
import {Omino} from "/assets/omino/Omino.js";
import {ButtonScene, ScrollableScene, DimsScene,
  OneTimeButtonScene, hover} from "/assets/omino/scene/Scene.js";
import Data from "/assets/omino-playground.js";

class OminoPaletteSpace extends ButtonScene{
  constructor(omino, index){
    super();
    this.index=index;
    this.omino=omino;
  }
  render(){
    p5.fill(0);
    if(this.isIn()) p5.fill(80);
    p5.rect(this.dims.x*0.05,this.dims.y*0.05,this.dims.x*0.9,this.dims.y*0.9,this.dims.x*0.1);

    let scale=this.dims.x*0.8/Math.max(this.omino.tiles.length,this.omino.tiles[0].length);
    this.omino[(Data.mainBoard.renderData.highlightDupes&&
        Data.mainBoard.ominoes.some(o=>o.equals(this.omino)))?"renderHighlighted":"render"](
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
class PaletteScene extends ScrollableScene{
  constructor(data){
    super();
    this.palette=data.palette;

    this.piecesHolder = new DimsScene();
    this.drawButton = {};

    this.spaces=[];
    let i=0;
    for(const ominoName of Object.keys(this.palette.data)){
      this.spaces.push(this.piecesHolder.addScene(new OminoPaletteSpace(this.palette.get(ominoName,new Vector(0,0)), i)));
      i++;
    }
    this.addScene(this.piecesHolder);

    this.drawButton = this.addScene(new OneTimeButtonScene(s=>{
      p5.fill(50);
      p5.rect(s.dims.x/2-this.dims.x/2,-this.dims.y*0.01,this.dims.x,this.dims.y*0.1);
      p5.fill(s.isIn()?150:100);
      p5.rect(0, 0, s.dims.x,s.dims.y, (s.dims.x+s.dims.y)*0.05);
      p5.fill(255);
      p5.push();
      p5.textAlign(p5.CENTER,p5.CENTER);
      p5.textSize((s.dims.x+s.dims.y)*0.4);
      p5.text("+", s.dims.x/2,s.dims.y/2);
      p5.pop();

      if(s.isIn()) hover.set("Add Omino", s);
    },_=>{
      this.parent.enterDrawingMode();
    }));
  }
  setXAndWidth(x,width){
    this.pos.x=x;
    this.dims.y=p5.height;
    this.dims.x=width;
    this.piecesHolder.dims = new Vector(this.dims.x,this.dims.y*0.9);
    
    for(const space of this.spaces){
      space.recalc(this);
    }

    this.drawButton.dims = new Vector(this.dims.y*0.08,this.dims.y*0.08);
    this.drawButton.pos = new Vector(this.dims.x/2-this.dims.y*0.08/2,this.dims.y*0.91);
  }
  addOmino(newOmino){
    let space = this.piecesHolder.addScene(new OminoPaletteSpace(newOmino, this.spaces.length));
    this.spaces.push(space);
    space.recalc(this);
  }

  render(){
    p5.fill(50);
    p5.rect(0,0,this.dims.x,this.dims.y);

    super.render();
  }
  scrolled(x,y,delta){
    if(!super.scrolled(x,y,delta)) return false;

    let oldOffs=this.offs;
    this.offs = Math.max(Math.min(this.spaces[this.spaces.length-1].pos.y-this.spaces[0].pos.y,this.offs),0);
    for(const space of this.spaces)
      space.recalc(this);

    return true;;
  }
}

export default PaletteScene;