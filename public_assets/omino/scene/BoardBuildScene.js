import MainScene from "/assets/omino/scene/MainScene.js";

import {OneTimeButtonScene, hover} from "/assets/omino/scene/Scene.js";
import Vector from "/assets/omino/Vector.js";
import SolveScene from "/assets/omino/scene/SolveScene.js";
import Data from "/assets/omino/Main.js";
import PuzzleSettingsScene from "/assets/omino/scene/PuzzleSettingsScene.js";
import {Omino, LockedOmino} from "/assets/omino/Omino.js";
import {getKeybinds} from "/assets/omino/Keybinds.js";
import {fill, background} from "/assets/omino/Colors.js";

const displayOmino = new Omino(new Vector(0,0), "scenes.buildPuzz.buttons.default.icon", [
  [1,0],[0,1],[1,1],[1,2],[2,2],
  [-2,-1],[-1,-1],[-2,-2]
  ].map(v=>new Vector(v[0]+2,v[1]+2)));
class BoardBuildScene extends MainScene{
	constructor(){
    super({
    	optionsData:{
    		locked:false,
    	},

      shouldRecalcPath:false,
      drawMouse:false,
    });
    Data.mainBoard.path=[];

    this.state="";

    const gridRect=(x,y)=>{
      p5.rect(x+0.7,y+0.7,8.6,8.6,2);
    };
    const drawPencil=type=>{
      fill(`scenes.buildPuzz.buttons.${type}.icon`);
      p5.beginShape();
      p5.vertex(-19,12);
      p5.vertex(-13,20);
      p5.vertex(10,0);
      p5.vertex(4,-8);
      p5.endShape();
      p5.beginShape();
      p5.vertex(11,-1);
      p5.vertex(5,-9);
      p5.vertex(11,-11);
      p5.vertex(14,-7);
      p5.endShape();
      p5.beginShape();
      p5.vertex(12,-12);
      p5.vertex(15,-8);
      p5.vertex(17,-11);
      p5.vertex(16,-14);
      p5.endShape();
    };
    this.buttonGrid=[
      [{b:this.addScene(new OneTimeButtonScene(this.drawButton(s=>{
        if(this.state=="start") drawPencil("start");
      },"Set Start", "scenes.buildPuzz.buttons.start"),s=>{
        if(this.state=="start") this.state="";
        else this.state="start";
      })), key:"START"},{b:this.addScene(new OneTimeButtonScene(this.drawButton(s=>{
        if(this.state=="locked") drawPencil("locked");
      },"Draw Locked Tiles", "scenes.buildPuzz.buttons.locked"),s=>{
        if(this.state=="locked") this.state="";
        else this.state="locked";
      })), key:"LOCK"},{b:{}},{b:{}}],

      [{b:this.addScene(new OneTimeButtonScene(this.drawButton(s=>{
        if(this.state=="end") drawPencil("end");
      },"Set End", "scenes.buildPuzz.buttons.end"),s=>{
        if(this.state=="end") this.state="";
        else this.state="end";
      })), key:"END"},{b:{}},{b:{}},
        {b:this.addScene(new OneTimeButtonScene(this.drawButton(s=>{
          if(s.isIn()) p5.scale(1.2);
          displayOmino.render(10, new Vector(-25,-25));
        }, "Solve"),s=>{
          Data.scene = new SolveScene();
        }))}]];
    this.settingsScene = this.addScene(new PuzzleSettingsScene());

    this.boardScene.clickListener = (x,y)=>this.onBoardClick(x,y);

    this.creating=false;

    this.resized(new Vector(p5.width, p5.height), new Vector(p5.width, p5.height));
  }

  render(){
    if(p5.mouseIsPressed&&this.state=="locked"){
      let board = this.boardScene;
      let newPos = new Vector(p5.mouseX,p5.mouseY).sub(board.pos).add(board.dims.scale(0.5))
        .div(board.dims).mult(new Vector(board.board.width, board.board.height)).floor();
      if(newPos.x >=0 && newPos.y >=0 && newPos.x < board.board.width && newPos.y < board.board.height) {
        let locked=Data.scene.boardScene.board.lockedTiles.vectors;
        if(!this.creating) {
          if(locked.some(p => p.equals(newPos)))
            locked.splice(locked.findIndex(p => p.equals(newPos)), 1);
        } else {
          if(!locked.some(p => p.equals(newPos)))
            locked.push(newPos);
        }
        Data.scene.boardScene.board.lockedTiles=new LockedOmino(locked);
      }
    }
    super.render();
  }

  drawButton(clickFunc, hoverText, color="scenes.buildPuzz.buttons.default"){
    return s=>{
      let padding = Math.min(s.dims.x,s.dims.y)*0.1;

      fill(color+(s.isIn()?".bgHover":".bg"));
      p5.rect(0,0,s.dims.x,s.dims.y, padding);

      p5.push();
      p5.beginClip();
      p5.rect(padding*0.4,padding*0.4,s.dims.x-padding*2*0.4,s.dims.y-padding*2*0.4,padding*0.7);
      p5.endClip();

      p5.translate(s.dims.x/2,s.dims.y/2);
      p5.scale((s.dims.x+s.dims.y)*0.01);
      clickFunc(s);
      p5.pop();

      if(hoverText&&s.isIn()) hover.set(hoverText, s);
    };
  }

  onBoardClick(x, y){
    switch(this.state){
    case "start":
      Data.mainBoard.startPoint = new Vector(x,y);
      this.settingsScene.hasStart.value=true;
      break;
    case "end":
      Data.mainBoard.endPoint = new Vector(x,y);
      this.settingsScene.hasEnd.value=true;
      break;
    }
  }
  mouseDown(x,y){
    super.mouseDown(x,y);

    if(this.state=="locked"){
      let board = this.boardScene;
      this.creating=!Data.scene.boardScene.board.lockedTiles.vectors
        .some(v=>v.equals(new Vector(x,y).sub(board.pos).add(board.dims.scale(0.5))
        .div(board.dims).mult(new Vector(board.board.width, board.board.height)).floor()));
    }
  }

  keyPressed(key){
    if(super.keyPressed(key)) return true;
    
    let keybinds = getKeybinds(key);
    for(const button of this.buttonGrid.flat()){
      for(const keybind of keybinds){
        if(keybind==button.key)
          button.b.click();
      }
    }
  }
}

export default BoardBuildScene;