import Vector from "/assets/omino/Vector.js";
import {Scene, focus, hover} from "/assets/omino/scene/Scene.js";
import BoardScene from "/assets/omino/scene/BoardScene.js";
import PaletteScene from "/assets/omino/scene/PaletteScene.js";
import OptionsScene from "/assets/omino/scene/OptionsScene.js";
import DrawingModeScene from "/assets/omino/scene/DrawingModeScene.js";
import {OneTimeButtonScene} from "/assets/omino/scene/Scene.js";
import {pageData} from "/assets/omino/Options.js";
import {allPalettes} from "/assets/omino/Palettes.js";
import Data from "/assets/omino-playground.js";

const keys = {
  CCW:"q",
  CW:"e",
  MH:"ad",
  MV:"ws",
  DEL:"x",
};

class MainScene extends Scene{
  constructor(){
    super();

    this.boardScene = this.addScene(new BoardScene(pageData.dims[0],pageData.dims[1],{
      torusMode:pageData.torus,
      ominoes:pageData.boardData.ominoes,
    }));
    this.paletteScene = this.addScene(new PaletteScene(pageData.palette));
    this.optionsScene = this.addScene(new OptionsScene());

    const buttonWrapper = (func, text)=>{
      return s=>{
        p5.fill(255,s.isIn()?150:100);
        p5.rect(0,0,s.dims.x,s.dims.y, Math.min(s.dims.x,s.dims.y)*0.1);

        p5.push();
        p5.translate(s.dims.x/2,s.dims.y/2);
        p5.scale((s.dims.x+s.dims.y)*0.01);
        func(s);
        p5.pop();

        if(text&&s.isIn()) hover.set(text, s);
      };
    };
    const drawText = _=>_=>0;

    const drawRot = _=>{
      p5.fill(0);
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
      p5.fill(0);
      p5.rect(-2,-13,4,26);
      p5.triangle(-6,-12,6,-12,0,-19);
      p5.triangle(-6,12,6,12,0,19);
    };
    this.buttonGrid = [
      [
        {b:this.addScene(new OneTimeButtonScene(buttonWrapper(s=>{
          if(s.isIn()) p5.rotate(-0.4);
          drawRot();
        }, "Rotate Left"),()=>{
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
        {b:this.addScene(new OneTimeButtonScene(buttonWrapper(s=>{
          if(s.isIn()) p5.rotate(0.4);
          p5.scale(-1,1);
          drawRot();
        }, "Rotate Right"),()=>{
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
        {b:this.addScene(new OneTimeButtonScene(buttonWrapper(s=>{
          p5.fill(0);
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
          p5.stroke(0);
          p5.strokeWeight(3);
          p5.line(-3,0, -2,10);
          p5.line(3,0, 2,10);
          p5.pop();
        }, "Delete Omino"),()=>{
          let omino = this.mouseData.omino;
          let scale = this.boardScene.board.renderData.scale;
          let pos = new Vector(p5.mouseX, p5.mouseY);
          this.mouseData.omino=undefined;

          let time=10;
          let dir=Math.random()<0.5?1:-1;
          this.mouseData.func = _=>{
            let newScale = 1-((20-time)/20)**3;

            p5.push();
            p5.translate(pos.x,pos.y);
            p5.rotate((10-time)*0.05*dir);
            omino.renderTransparent(scale*newScale, this.mouseData.offs.scale(-1*newScale), 
              p5, 170*newScale);
            p5.pop();

            time--;

            if(time<0) this.mouseData.func=_=>0;
          };
        })), key:"DEL"}
      ],
      [
        {b:this.addScene(new OneTimeButtonScene(buttonWrapper(s=>{
          if(s.isIn()) p5.scale(1, 1.1);
          drawScale();
        }, "Vertical Flip"),()=>{
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
        {b:this.addScene(new OneTimeButtonScene(buttonWrapper(s=>{
          if(s.isIn()) p5.scale(1.1, 1);
          p5.rotate(Math.PI/2);
          drawScale();
        }, "Horizontal Flip"),()=>{
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
        {b:this.addScene(new OneTimeButtonScene(buttonWrapper(s=>{
          p5.stroke(0);
          p5.strokeWeight(3);
          p5.line(-15,-10,-8,-5);
          p5.line(15,-10,8,-5);
          p5.line(-15,10,-8,5);
          p5.line(15,10,8,5);
          p5.noStroke();

          p5.fill(0);
          if(Data.isFullscreened){
            if(s.isIn()) p5.scale(0.9);
            p5.triangle(-4,-2,-12,-2,-6,-9);
            p5.triangle(4,-2,12,-2,6,-9);
            p5.triangle(-4,2,-12,2,-6,9);
            p5.triangle(4,2,12,2,6,9);
          }else{
            if(s.isIn()) p5.scale(1.1);
            p5.triangle(-19,-13,-17,-5,-11,-13);
            p5.triangle(19,-13,17,-5,11,-13);
            p5.triangle(-19,13,-17,5,-11,13);
            p5.triangle(19,13,17,5,11,13);
          }
        }, "Toggle Fullscreen"),()=>{
          Data.isFullscreened=!Data.isFullscreened;
          p5.windowResized();
          window.scroll({top:Data.canvElt.getBoundingClientRect().y-document.body.getBoundingClientRect().y-
            (p5.windowHeight-p5.height)/2, behavior:"instant"});
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

    this.resized(new Vector(p5.width, p5.height), new Vector(p5.width, p5.height));
  }

  enterDrawingMode(){
    this.mouseData.omino=undefined;

    Data.scene = new DrawingModeScene(this);
  }

  render(){
    p5.background(173, 111, 153);

    super.render();

    this.mouseData.func();
    if(this.mouseData.omino){
      p5.push();
      p5.translate(p5.mouseX,p5.mouseY);
      p5.rotate(this.mouseData.angle);
      p5.scale(this.mouseData.scale.x,this.mouseData.scale.y);
      this.mouseData.omino.renderTransparent(this.boardScene.board.renderData.scale, 
        new Vector(0,0).sub(this.mouseData.offs));
      p5.cursor(p5.MOVE);
      p5.pop();
    }

    hover.draw();
  }
  resized(oldDims, newDims){
    let oldScale = this.boardScene.board.renderData.scale;
    this.boardScene.setBounds(newDims.x/2, newDims.y*2/3);
    this.boardScene.moveToCenter();

    this.paletteScene.setXAndWidth(newDims.x*3/4,newDims.x/4);
    this.optionsScene.dims.x=newDims.x/4;

    let size = Math.min(newDims.x/2/this.buttonGrid[0].length,newDims.y/3/this.buttonGrid.length);
    for(let y=0;y<this.buttonGrid.length;y++){
      for(let x=0;x<this.buttonGrid[y].length;x++){
        this.buttonGrid[y][x].b.dims = new Vector(size*0.8, size*0.8);
        this.buttonGrid[y][x].b.pos = new Vector(newDims.x/2-size*2+(x+0.1)*size, newDims.y*2/3+(y+0.1)*size);
      }
    }

    if(this.mouseData.omino){
      this.mouseData.offs=this.mouseData.offs.scale(this.boardScene.board.renderData.scale/oldScale);
    }

    this.boardScene.quickResize();

    super.resized(oldDims, newDims);
  }

  keyPressed(key){
    if(super.keyPressed(key)) return true;
    
    for(const [name,vals] of Object.entries(keys)){
      let consumed=false;
      if(vals.includes(key)){
        for(const row of this.buttonGrid){
          for(const button of row){
            if(button.key==name){
              button.b.click(0,0);
              consumed=true;
              break;
            }
          }
          if(consumed) break;
        }
        
        if(consumed) return true;
      }
    }
  }
  mouseDown(){
    focus(this);

    return super.mouseDown();
  }
}

export default MainScene;