import MainScene from "/assets/omino/scene/MainScene.js";

import Vector from "/assets/omino/Vector.js";
import {Scene, focus} from "/assets/omino/scene/Scene.js";
import DrawingModeScene from "/assets/omino/scene/DrawingModeScene.js";
import {OneTimeButtonScene} from "/assets/omino/scene/Scene.js";
import {pageData} from "/assets/omino/Options.js";
import Data from "/assets/omino-playground.js";
import {getKeybinds} from "/assets/omino/Keybinds.js";
import BoardBuildScene from "/assets/omino/scene/BoardBuildScene.js";
import PaletteScene from "/assets/omino/scene/PaletteScene.js";
import {LockedOmino} from "/assets/omino/Omino.js";
import {fill, stroke} from "/assets/omino/Colors.js";

class SolveScene extends MainScene{
  constructor(){
    super({
    	optionsData:{
    		locked:false,
    	},
    });

    this.paletteScene = this.addScene(new PaletteScene({palette:pageData.palette}));

    const drawRot = _=>{
      fill("scenes.buttons.light.icon");
      p5.scale(0.8);
      p5.beginShape();
      p5.vertex(10,10);
      p5.vertex(15,15);
      p5.bezierVertex(23,7,23,-7,15,-15);
      p5.bezierVertex(7,-23,-7,-23,-15,-15);
      p5.bezierVertex(-23,-7,-23,7,-15,15);
      p5.vertex(-18,18);
      p5.vertex(-7,18);
      p5.vertex(-7,7);
      p5.vertex(-10,10);
      p5.bezierVertex(-15,5,-15,-5,-10,-10);
      p5.bezierVertex(-5,-15,5,-15,10,-10);
      p5.bezierVertex(15,-5,15,5,10,10);
      p5.endShape();
    };
    const drawScale = _=>{
      fill("scenes.buttons.light.icon");
      p5.rect(-2,-13,4,26);
      p5.triangle(-6,-12,6,-12,0,-19);
      p5.triangle(-6,12,6,12,0,19);
    };
    this.buttonGrid = [
      [
        {b:this.addScene(new OneTimeButtonScene(this.drawButton(s=>{
          if(s.isIn()) p5.rotate(-0.4);
          drawRot();
        }, "Rotate Left"),s=>{
          if(!this.mouseData.omino) return;
          let oldWidth=this.mouseData.omino.width();
          this.mouseData.omino = this.mouseData.omino.rotatedCCW();
          this.mouseData.offs = new Vector(this.mouseData.offs.y,
            oldWidth*this.boardScene.board.renderData.scale-
              this.mouseData.offs.x);

          this.mouseData.angle = Math.PI/2;
          this.mouseData.scale = new Vector(1,1);
          this.mouseData.func = _=>{
            this.mouseData.angle*=0.8;
            this.mouseData.angle-=0.01;
            if(this.mouseData.angle<0){
              this.mouseData.angle=0;
              this.mouseData.func=_=>0;
            }
          };
        })), key:"CCW"},
        {b:this.addScene(new OneTimeButtonScene(this.drawButton(s=>{
          if(s.isIn()) p5.rotate(0.4);
          p5.scale(-1,1);
          drawRot();
        }, "Rotate Right"),s=>{
          if(!this.mouseData.omino) return;
          let oldHeight = this.mouseData.omino.height();
          this.mouseData.omino = this.mouseData.omino.rotatedCW();
          this.mouseData.offs = new Vector(
            oldHeight*this.boardScene.board.renderData.scale-this.mouseData.offs.y,
            this.mouseData.offs.x);

          this.mouseData.angle = -Math.PI/2;
          this.mouseData.scale = new Vector(1,1);
          this.mouseData.func = _=>{
            this.mouseData.angle*=0.8;
            this.mouseData.angle+=0.01;
            if(this.mouseData.angle>0){
              this.mouseData.angle=0;
              this.mouseData.func=_=>0;
            }
          };
        })), key:"CW"},
        {b:{}},
        {b:this.addScene(new OneTimeButtonScene(this.drawButton(s=>{
          fill("scenes.buttons.light.icon");
          p5.translate(0,-3);

          p5.push();
          p5.translate(30,0);
          if(s.isIn()) p5.rotate(0.2);
          p5.rect(-45,-10,30,5);
          p5.beginShape();
          p5.vertex(-37,-7);
          p5.vertex(-33,-13);
          p5.vertex(-27,-13);
          p5.vertex(-23,-7);
          p5.endShape();
          p5.pop();

          p5.beginShape();
          p5.vertex(-13,-2);
          p5.vertex(-8,-2);
          p5.vertex(-5,13);
          p5.vertex(5,13);
          p5.vertex(8,-2);
          p5.vertex(13,-2);
          p5.vertex(9,18);
          p5.vertex(-9,18);
          p5.endShape();

          p5.push();
          stroke("scenes.buttons.light.icon");
          p5.strokeWeight(3);
          p5.line(-3,0, -2,10);
          p5.line(3,0, 2,10);
          p5.pop();
        }, "Delete Omino"),s=>{
          let omino = this.mouseData.omino;
          let scale = this.boardScene.board.renderData.scale;
          let pos = new Vector(p5.mouseX, p5.mouseY);
          this.mouseData.omino=undefined;

          let time=10;
          let dir=Math.random()<0.5?1:-1;
          if(omino) this.mouseData.func = _=>{
            let newScale = 1-((20-time)/20)**3;

            p5.push();
            p5.translate(pos.x,pos.y);
            p5.rotate((10-time)*0.05*dir);
            omino.renderTransparent(scale*newScale, this.mouseData.offs.scale(-1*newScale), 
              {transparency:170*newScale});
            p5.pop();

            time--;

            if(time<0) this.mouseData.func=_=>0;
          };
        })), key:"DEL"}
      ],
      [
        {b:this.addScene(new OneTimeButtonScene(this.drawButton(s=>{
          if(s.isIn()) p5.scale(1, 1.1);
          drawScale();
        }, "Vertical Flip"),s=>{
          if(!this.mouseData.omino) return;
          this.mouseData.omino = this.mouseData.omino.mirroredV();
          this.mouseData.offs.y=this.mouseData.omino.height()*this.boardScene.board.renderData.scale-
            this.mouseData.offs.y;

          this.mouseData.angle = 0;
          this.mouseData.scale = new Vector(1,-1);
          this.mouseData.func = _=>{
            this.mouseData.scale.y=1-(1-this.mouseData.scale.y)*0.8;
            this.mouseData.scale.y+=0.03;
            if(this.mouseData.scale.y>1){
              this.mouseData.scale.y=1;
              this.mouseData.func=_=>0;
            }
          };
        })), key:"MV"},
        {b:this.addScene(new OneTimeButtonScene(this.drawButton(s=>{
          if(s.isIn()) p5.scale(1.1, 1);
          p5.rotate(Math.PI/2);
          drawScale();
        }, "Horizontal Flip"),s=>{
          if(!this.mouseData.omino) return;
          this.mouseData.omino = this.mouseData.omino.mirroredH();
          this.mouseData.offs.x=this.mouseData.omino.width()*this.boardScene.board.renderData.scale-
            this.mouseData.offs.x;

          this.mouseData.angle = 0;
          this.mouseData.scale = new Vector(-1,1);
          this.mouseData.func = _=>{
            this.mouseData.scale.x=1-(1-this.mouseData.scale.x)*0.8;
            this.mouseData.scale.x+=0.03;
            if(this.mouseData.scale.x>1){
              this.mouseData.scale.x=1;
              this.mouseData.func=_=>0;
            }
          };
        })), key:"MH"},
        {b:{}},
        {b:this.addScene(new OneTimeButtonScene(this.drawButton(s=>{
          fill("scenes.buttons.light.icon");
          for(let i=0;i<2;i++){
            p5.push();
            if(s.isIn()) p5.translate(-5,0);

            p5.beginShape();

            p5.vertex(-5,-20);
            p5.vertex(-8,-20);
            p5.bezierVertex(-16,-18,-10,-3,-16,-3);
            p5.vertex(-16,3);
            p5.bezierVertex(-10,3,-16,18,-8,20);
            p5.vertex(-5,20);
            p5.vertex(-5,15);
            p5.bezierVertex(-11,15,-8,2,-11,0);
            p5.bezierVertex(-8,-2,-11,-15,-5,-15);

            p5.endShape();
            p5.pop();
            p5.scale(-1,1);
          }

          if(s.isIn()){
            p5.ellipse(0,0,5,5);
            p5.ellipse(-8,0,5,5);
            p5.ellipse(8,0,5,5);
          }
        }, "Board Data"),s=>{
          Data.mainBoard.ominoes=Data.mainBoard.ominoes.filter(o=>o instanceof LockedOmino);
        	Data.scene = new BoardBuildScene();
        }))},
      ],
    ];

    this.mouseData = {
      omino:undefined,
      offs:undefined,

      angle:0,
      scale:new Vector(1,1),
      func:_=>0,
    };

    let self=this;
    this.addScene(new (class extends Scene{
    	render(){
    		self.mouseData.func();
		    if(self.mouseData.omino){
		      p5.push();
		      p5.translate(p5.mouseX,p5.mouseY);
		      p5.rotate(self.mouseData.angle);
		      p5.scale(self.mouseData.scale.x,self.mouseData.scale.y);

		      self.mouseData.omino.renderTransparent(self.boardScene.board.renderData.scale, 
		        new Vector(0,0).sub(self.mouseData.offs));
		      p5.cursor(p5.MOVE);
		      p5.pop();
		    }
    	}
    }));

    this.boardScene.clickListener = this.onBoardClick;

    this.resized(new Vector(p5.width, p5.height), new Vector(p5.width, p5.height));
  }

  enterDrawingMode(){
    this.mouseData.omino=undefined;

    Data.scene = new DrawingModeScene(this);
  }

  resized(oldDims, newDims=oldDims){
    let oldScale=this.boardScene.board.renderData.scale;
    super.resized(oldDims, newDims);

    if(this.paletteScene) this.paletteScene.setXAndWidth(newDims.x*3/4,newDims.x/4);

    if(this.mouseData&&this.mouseData.omino){
      this.mouseData.offs=this.mouseData.offs.scale(this.boardScene.board.renderData.scale/oldScale);
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

  onBoardClick(x,y){
    if(!this.parent.mouseData.omino) {
        let omino = this.board.get(new Vector(x, y));
        if(omino && !(omino instanceof LockedOmino)) {
            this.board.remove(omino);

            this.parent.mouseData.omino = omino;
            this.parent.mouseData.offs = new Vector(p5.mouseX, p5.mouseY).sub(
                this.parent.mouseData.omino.pos
                .scale(this.board.renderData.scale)
                .add(this.getAbsolutePos()));

            if(omino.pos.x > x) this.parent.mouseData.offs.x += this.board.renderData.scale * this.board.width;
            if(omino.pos.y > y) this.parent.mouseData.offs.y += this.board.renderData.scale * this.board.height;

            omino.pos = new Vector(0, 0);
            
            return true;
        }
    } else {
        let newPos;
        if(newPos=this.parent.mouseData.omino.canPlace(this.board, new Vector(p5.mouseX, p5.mouseY)
            .sub(this.parent.mouseData.offs)
            .sub(this.pos).scale(1 / this.board.renderData.scale)
            .round())) {
            this.parent.mouseData.omino.pos = newPos;
            this.board.add(this.parent.mouseData.omino);
            this.parent.mouseData.omino = undefined;
            this.parent.mouseData.offs = undefined;

            return true;
        }
    }

    return false;
  }
}

export default SolveScene;