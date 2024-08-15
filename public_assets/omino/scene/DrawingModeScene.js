import Vector from "/assets/omino/Vector.js";
import {Scene, OneTimeButtonScene} from "/assets/omino/scene/Scene.js";
import Data from "/assets/omino-playground.js";
import {Omino, genHashColor} from "/assets/omino/Omino.js";

class DrawingModeScene extends Scene{
  constructor(mainScene){
    super();
    this.mainScene=mainScene;

    this.newTiles=[];

    this.confButton = this.addScene(new OneTimeButtonScene(s=>{
      p5.fill(s.isIn()?150:100);
      p5.rect(0,0,s.dims.x,s.dims.y);
      p5.fill(255);
      p5.push();
      p5.textAlign(p5.CENTER,p5.CENTER);
      p5.textSize((s.dims.x+s.dims.y)*0.17);
      p5.text("Confirm", s.dims.x/2,s.dims.y/2);
      p5.pop();
    },s=>{
      Data.scene = this.mainScene;
      if(this.newTiles.length==0) return;

      let pos = new Vector(0,0);
      while(!this.newTiles.some(t=>t.x==0)){
        pos.x++;
        for(const tile of this.newTiles) tile.x--;
      }
      while(!this.newTiles.some(t=>t.y==0)){
        pos.y++;
        for(const tile of this.newTiles) tile.y--;
      }

      let [newOmino, isNew] = mainScene.paletteScene.palette.getFromTiles(this.newTiles);
      
      if(isNew){
        Data.scene.paletteScene.addOmino(newOmino);
        Data.scene.paletteScene.palette.add(newOmino);
      }
      let forBoard = newOmino.clone();
      forBoard.pos = pos;
      Data.scene.boardScene.board.add(forBoard);
    }));

    this.resized(new Vector(p5.width,p5.height),new Vector(p5.width,p5.height));
  }
  render(){
    this.mainScene.render();

    let board=this.mainScene.boardScene;
    p5.fill(0,100);
    p5.beginShape();
    p5.vertex(board.pos.x,0);
    p5.vertex(p5.width,0);
    p5.vertex(p5.width,p5.height);
    p5.vertex(0,p5.height);
    p5.vertex(0,0);
    p5.vertex(board.pos.x,0);
    p5.vertex(board.pos.x,board.pos.y+board.dims.y);
    p5.vertex(board.pos.x+board.dims.x,board.pos.y+board.dims.y);
    p5.vertex(board.pos.x+board.dims.x,board.pos.y);
    p5.vertex(board.pos.x,board.pos.y);
    p5.endShape();

    p5.push();
    p5.translate(board.pos.x,board.pos.y);
    p5.scale(board.board.renderData.scale);
    p5.fill(255);
    for(const point of this.newTiles){
      p5.rect(point.x,point.y,1,1);
    }
    p5.pop();

    super.render();
  }

  mouseDown(x,y){
    let board=this.mainScene.boardScene;
    if(x>board.pos.x&&y>board.pos.y&&x<board.pos.x+board.dims.x&&y<board.pos.y+board.dims.y){
      let newX=Math.floor((x-board.pos.x)/board.dims.x*board.board.width);
      let newY=Math.floor((y-board.pos.y)/board.dims.y*board.board.height);

      var newPos = new Vector(newX,newY);
      if(this.newTiles.some(p=>p.equals(newPos))){
        this.newTiles.splice(this.newTiles.findIndex(p=>p.equals(newPos)),1);
      }else{
        this.newTiles.push(newPos);
      }
    }
    
    super.mouseDown(x,y);
  }

  resized(oldDims, newDims){
    this.mainScene.resized(oldDims, newDims);

    this.confButton.dims = new Vector(p5.width/6, p5.width/6*0.3);
    this.confButton.pos = new Vector(p5.width/2-p5.width/6/2,
      this.mainScene.boardScene.pos.y+this.mainScene.boardScene.dims.y+p5.height*0.01);

    super.resized(oldDims, newDims);
  }
}

export default DrawingModeScene;