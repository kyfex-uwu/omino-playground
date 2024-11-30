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
  }
  resized(oldDims,newDims=oldDims){
    let size=Math.min(newDims.x/2,newDims.y);
    this.dims = new Vector(size,size);
    this.pos = new Vector((newDims.x-size)/2,0);
  }
  render(){
    Element.render({
      container:this,
      board:this.parent.board,
    }, ...this.parent.board.elements);
  }
}

class MainScene extends Scene{
  constructor({board}={}){
    super();

    this.board=board;

    this.optionsScene = this.addScene(new OptionsScene());
    this.boardContainer = this.addScene(new BoardContainer(this));
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