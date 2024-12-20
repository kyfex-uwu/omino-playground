import Vector from "/assets/omino/Vector.js";
import {Scene, OneTimeButtonScene} from "/assets/omino/scene/Scene.js";
import Data from "/assets/omino/Main.js";
import {Omino} from "/assets/omino/Omino.js";
import {fill, stroke, background, getColor} from "/assets/omino/Colors.js";

//todo: prevent ominoes that are disconnected (OR find some way to connect them?)

class DrawingModeScene extends Scene {
  constructor(mainScene) {
    super();
    this.mainScene = mainScene;
    this.mainScene.hasMouseAccess=false;

    this.newTiles = [];
    this.omino = undefined;
    this.creating=false;

    const button = (s,text)=>{
      fill(s.isIn()?"scenes.drawing.button.bgHover":"scenes.drawing.button.bg");
      p5.rect(0, 0, s.dims.x, s.dims.y, s.dims.x*0.1);
      fill("scenes.drawing.button.color");
      p5.push();
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize((s.dims.x + s.dims.y) * 0.17);
      p5.text(text, s.dims.x / 2, s.dims.y / 2);
      p5.pop();
    }
    this.confButton = this.addScene(new OneTimeButtonScene(s => button(s, "Confirm"), s => {
      Data.scene = this.mainScene;
      this.mainScene.hasMouseAccess=true;
      if(this.newTiles.length == 0) return;

      let pos = new Vector(0, 0);
      while(!this.newTiles.some(t => t.x == 0)) {
        pos.x++;
        for(const tile of this.newTiles) tile.x--;
      }
      while(!this.newTiles.some(t => t.y == 0)) {
        pos.y++;
        for(const tile of this.newTiles) tile.y--;
      }

      let [newOmino, isNew] = mainScene.paletteScene.palette.getFromTiles(this.newTiles);

      if(isNew) {
        Data.scene.paletteScene.addOmino(newOmino);
        Data.scene.paletteScene.palette.add(newOmino);
      }
      let forBoard = newOmino.clone();
      forBoard.pos = pos;
      Data.scene.boardScene.board.add(forBoard);
    }));
    this.cancelButton = this.addScene(new OneTimeButtonScene(s => button(s, "Cancel"), s => {
      Data.scene = this.mainScene;
      this.mainScene.hasMouseAccess=true;
    }));

    this.resized(new Vector(p5.width, p5.height), new Vector(p5.width, p5.height));
  }
  render() {
    this.mainScene.render();

    if(p5.mouseIsPressed){
      let board = this.mainScene.boardScene;
      let newPos = new Vector(p5.mouseX,p5.mouseY).sub(board.pos).add(board.dims.scale(0.5))
        .div(board.dims).mult(new Vector(board.board.width, board.board.height)).floor();
      if(newPos.x >=0 && newPos.y >=0 && newPos.x < board.board.width && newPos.y < board.board.height) {
        if(!this.creating) {
          if(this.newTiles.some(p => p.equals(newPos)))
            this.newTiles.splice(this.newTiles.findIndex(p => p.equals(newPos)), 1);
        } else {
          if(!this.newTiles.some(p => p.equals(newPos)))
            this.newTiles.push(newPos);
        }

        if(this.newTiles.length == 0) {
          this.omino = undefined;
        } else {
          this.omino = new Omino(new Vector(0, 0), "ominoColors.new", this.newTiles);
        }
      }
    }

    let board = this.mainScene.boardScene;
    fill("scenes.drawing.darken");
    let pos=board.pos.sub(board.dims.scale(0.5));
    p5.beginShape();
    p5.vertex(pos.x, 0);
    p5.vertex(p5.width, 0);
    p5.vertex(p5.width, p5.height);
    p5.vertex(0, p5.height);
    p5.vertex(0, 0);
    p5.vertex(pos.x, 0);
    p5.vertex(pos.x, pos.y + board.dims.y);
    p5.vertex(pos.x + board.dims.x, pos.y + board.dims.y);
    p5.vertex(pos.x + board.dims.x, pos.y);
    p5.vertex(pos.x, pos.y);
    p5.endShape();

    p5.push();
    p5.translate(board.pos.x, board.pos.y);
    if(this.omino) this.omino.render(board.board.renderData.scale, board.dims.scale(-0.5));
    p5.pop();

    super.render();
  }

  mouseDown(x,y){
    let board = this.mainScene.boardScene;
    let newPos = new Vector(p5.mouseX,p5.mouseY).sub(board.pos).add(board.dims.scale(0.5))
      .div(board.dims).mult(new Vector(board.board.width, board.board.height)).floor();
    if(newPos.x >=0 && newPos.y >=0 && newPos.x < board.board.width && newPos.y < board.board.height) {
      this.creating=!this.newTiles.some(p => p.equals(newPos));
    }

    return super.mouseDown(x,y);
  }

  resized(oldDims, newDims=oldDims) {
    this.mainScene.resized(oldDims, newDims);

    this.confButton.dims = new Vector(p5.width / 6, p5.width / 6 * 0.3);
    this.confButton.pos = new Vector(p5.width / 2 - p5.width / 6 / 2,
      this.mainScene.boardScene.pos.y + this.mainScene.boardScene.dims.y/2 + p5.height * 0.01);

    this.cancelButton.dims = new Vector(p5.width / 6, p5.width / 6 * 0.3);
    this.cancelButton.pos = new Vector(p5.width / 2 - p5.width / 6 / 2,
      this.mainScene.boardScene.pos.y + this.mainScene.boardScene.dims.y/2 + p5.height * 0.01+this.confButton.dims.y*1.1);

    super.resized(oldDims, newDims);
  }
}

export default DrawingModeScene;