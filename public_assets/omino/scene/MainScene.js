import Vector from "/assets/omino/Vector.js";
import {Scene, DimsScene, focus, hover} from "/assets/omino/scene/Scene.js";
import OptionsScene from "/assets/omino/scene/OptionsScene.js";
import Data from "/assets/omino/Main.js";
import {fill, stroke, background, getColor} from "/assets/omino/Colors.js";
import Element from "/assets/omino/pathfinding/elements/Element.js";

class BoardContainer extends DimsScene{
  constructor(parent){
    super();
    this.parent=parent;

    this.dragging=false;
    this.lastPos=false;
  }
  resized(oldDims,newDims=oldDims){
    let size=Math.min(newDims.x/2,newDims.y);
    this.dims = new Vector(size,size);
    this.pos = new Vector((newDims.x-size)/2,0);
  }
  mouseUp(x,y){
    this.clicked=this.dragging?this.dragging.orig.distTo(this.dragging.curr)<0.1:true;
    this.dragging=false;
  }
  mouseDown(x,y){
    if(!this.isIn()) return false;
    this.dragging={
      orig:new Vector(x,y), 
      curr:new Vector(x,y),
      delta:new Vector(0,0),
    };
    return true;
  }
  render(){
    if(this.dragging){
      let pos=new Vector(p5.mouseX,p5.mouseY).sub(this.pos);
      this.dragging.delta=pos.sub(this.dragging.curr);
      this.dragging.curr=pos;
    }

    Element.render({
      container:this,
      board:this.parent.board,
      dragging:this.dragging,
      clicked:this.clicked,
      cursor:this.parent.cursor,
      elements:this.parent.board.elements,
    }, ...this.parent.board.elements);
    this.clicked=false;
  }
}

class MainScene extends Scene{
  constructor({board}={}){
    super();

    this.board=board;

    this.optionsScene = this.addScene(new OptionsScene());
    this.boardContainer = this.addScene(new BoardContainer(this));

    this.cursor={
      heldElement:undefined,
    };
  }
  // drawButton(clickFunc, hoverText){
  //   return s=>{
  //     fill(s.isIn()?"scenes.buttons.light.bgHover":"scenes.buttons.light.bg");
  //     p5.rect(0,0,s.dims.x,s.dims.y, Math.min(s.dims.x,s.dims.y)*0.1);

  //     p5.push();
  //     p5.translate(s.dims.x/2,s.dims.y/2);
  //     p5.scale((s.dims.x+s.dims.y)*0.01);
  //     clickFunc(s);
  //     p5.pop();

  //     if(hoverText&&s.isIn()) hover.set(hoverText, s);
  //   };
  // }

  render(){
    background("bg");
    super.render();
    hover.draw();
  }

  mouseUp(x, y){
    focus(this);

    return super.mouseUp(x, y);
  }
}

export default MainScene;