import Vector from "/assets/omino/Vector.js";
import Board from "/assets/omino/Board.js"
import {DimsScene} from "/assets/omino/scene/Scene.js";
import {LockedOmino} from "/assets/omino/Omino.js";

class BoardScene extends DimsScene{
  constructor(w,h, options={}){
    super();
    this.board = new Board(w,h, options);
  }
  render(){
    this.board.render(this.getAbsolutePos());
    this.dims = new Vector(this.board.width, this.board.height).scale(this.board.renderData.scale);
  }
  setBounds(width,height){
    this.board.renderData.scale = Math.min(width/this.board.width, height/this.board.height);
  }
  moveToCenter(){
    this.pos = new Vector(p5.width/2-this.board.renderData.scale*this.board.width/2,10);
  }
  mouseUp(x,y){
    x=Math.floor(x/this.board.renderData.scale);
    y=Math.floor(y/this.board.renderData.scale);
    if(x<0||x>=this.board.width||y<0||y>=this.board.height) return false;

    if(!this.parent.mouseData.omino){
      let omino = this.board.get(new Vector(x,y));
      if(omino&&!(omino instanceof LockedOmino)){
        this.board.remove(omino);

        this.parent.mouseData.omino = omino;
        this.parent.mouseData.offs = new Vector(p5.mouseX,p5.mouseY).sub(
          this.parent.mouseData.omino.pos
            .scale(this.board.renderData.scale)
            .add(this.getAbsolutePos()));

        omino.pos = new Vector(0,0);
      }
    }else{
      let newPos = new Vector(p5.mouseX,p5.mouseY).sub(this.parent.mouseData.offs)
        .sub(this.pos).scale(1/this.board.renderData.scale)
        .round();

      let valid=true;
      for(let y=0;y<this.parent.mouseData.omino.tiles.length;y++){
        for(let x=0;x<this.parent.mouseData.omino.tiles[y].length;x++){
          if(!this.parent.mouseData.omino.tiles[y][x]) continue;
          if(this.board.get(newPos.add(new Vector(x,y)))){
            valid=false;
            break;
          }
        }
        if(!valid) break;
      }

      if(valid){
        this.parent.mouseData.omino.pos = newPos;
        this.board.add(this.parent.mouseData.omino);
        this.parent.mouseData = {
          omino:undefined,
          offs:undefined
        };
      }
    }
  }
}

export default BoardScene;