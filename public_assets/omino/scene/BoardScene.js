import Vector from "/assets/omino/Vector.js";
import Board from "/assets/omino/Board.js"
import {DimsScene} from "/assets/omino/scene/Scene.js";
import {LockedOmino} from "/assets/omino/Omino.js";

class BoardScene extends DimsScene{
  constructor(w,h, options={}){
    super();
    this.board = new Board(w,h, options);
  }
  quickResize(){
    this.dims = new Vector(this.board.width, this.board.height).scale(this.board.renderData.scale);
  }
  render(){
    this.board.render(this.getAbsolutePos());
    this.quickResize();
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

        if(omino.pos.x>x) this.parent.mouseData.offs.x+=this.board.renderData.scale*this.board.width;
        if(omino.pos.y>y) this.parent.mouseData.offs.y+=this.board.renderData.scale*this.board.height;

        omino.pos = new Vector(0,0);
      }
    }else{
      let newPos = new Vector(p5.mouseX,p5.mouseY).sub(this.parent.mouseData.offs)
        .sub(this.pos).scale(1/this.board.renderData.scale)
        .round();
      if(this.board.torusMode){
        while(newPos.x<0) newPos.x+=this.board.width;
        while(newPos.y<0) newPos.y+=this.board.height;
        newPos.x%=this.board.width;
        newPos.y%=this.board.height;
      }

      let valid=true;
      for(let y=0;y<this.parent.mouseData.omino.tiles.length;y++){
        for(let x=0;x<this.parent.mouseData.omino.tiles[y].length;x++){
          if(!this.parent.mouseData.omino.tiles[y][x]) continue;
          let thisPos = newPos.add(new Vector(x,y));
          if(this.board.torusMode){
            while(thisPos.x<0) thisPos.x+=this.board.width;
            while(thisPos.y<0) thisPos.y+=this.board.height;
            thisPos.x%=this.board.width;
            thisPos.y%=this.board.height;
          }
          if(this.board.get(thisPos)){
            valid=false;
            break;
          }
        }
        if(!valid) break;
      }
      if(this.board.torusMode){
        let loopedPositions = this.parent.mouseData.omino.vectors
          .map(p=>p.add(this.parent.mouseData.omino.pos));
        for(const pos of loopedPositions){
          while(pos.x<0) pos.x+=this.board.width;
          while(pos.x>=this.board.width) pos.x-=this.board.width;
          while(pos.y<0) pos.y+=this.board.height;
          while(pos.y>=this.board.height) pos.y-=this.board.height;
        }
        for(let i=0;i<loopedPositions.length;i++){
          for(let j=i+1;j<loopedPositions.length;j++){
            if(loopedPositions[i].equals(loopedPositions[j])){
              valid=false;
              break;
            }
          }
          if(!valid) break;
        }
      }

      if(valid){
        this.parent.mouseData.omino.pos = newPos;
        this.board.add(this.parent.mouseData.omino);
        this.parent.mouseData.omino=undefined;
        this.parent.mouseData.offs=undefined;
      }
    }
  }
}

export default BoardScene;