import Vector from "/assets/omino/Vector.js";
import {Scene, focus, hover} from "/assets/omino/scene/Scene.js";
import BoardScene from "/assets/omino/scene/BoardScene.js";
import OptionsScene from "/assets/omino/scene/OptionsScene.js";
import Data from "/assets/omino-playground.js";
import {fill, stroke, background, getColor} from "/assets/omino/Colors.js";

class MainScene extends Scene{
  constructor(data){
    super();

    Data.mainBoard.shouldRecalcPath=
      data.shouldRecalcPath===undefined?true:data.shouldRecalcPath;
      Data.mainBoard.recalcPath();

    this.buttonGrid=[];

    this.boardScene = this.addScene(new BoardScene(Data.mainBoard));
    this.optionsScene = this.addScene(new OptionsScene(data.optionsData));

    this.resized(new Vector(p5.width, p5.height), new Vector(p5.width, p5.height));
  }
  drawButton(clickFunc, hoverText){
    return s=>{
      fill(s.isIn()?"scenes.buttons.light.bgHover":"scenes.buttons.light.bg");
      p5.rect(0,0,s.dims.x,s.dims.y, Math.min(s.dims.x,s.dims.y)*0.1);

      p5.push();
      p5.translate(s.dims.x/2,s.dims.y/2);
      p5.scale((s.dims.x+s.dims.y)*0.01);
      clickFunc(s);
      p5.pop();

      if(hoverText&&s.isIn()) hover.set(hoverText, s);
    };
  }

  render(){
    background("bg");
    super.render();
    hover.draw();
  }
  resized(oldDims, newDims){
    let oldScale = this.boardScene.board.renderData.scale;
    this.boardScene.setBounds(newDims.x/2, newDims.y*2/3);
    this.boardScene.moveToCenter();

    let size = Math.min(newDims.x/2/(this.buttonGrid[0]||[]).length,newDims.y/3/this.buttonGrid.length);
    for(let y=0;y<this.buttonGrid.length;y++){
      for(let x=0;x<this.buttonGrid[y].length;x++){
        this.buttonGrid[y][x].b.dims = new Vector(size*0.8, size*0.8);
        this.buttonGrid[y][x].b.pos = new Vector(newDims.x/2-size*2+(x+0.1)*size, newDims.y*2/3+(y+0.1)*size);
      }
    }

    this.optionsScene.dims.x=newDims.x/4;

    this.boardScene.quickResize();

    super.resized(oldDims, newDims);
  }

  mouseDown(){
    focus(this);

    return super.mouseDown();
  }
}

export default MainScene;