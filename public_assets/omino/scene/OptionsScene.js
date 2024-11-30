import {ScrollableScene, OneTimeButtonScene, Scene, DimsScene,
  focus, hover, isKindaMobile} from "/assets/omino/scene/Scene.js";
import TextInputScene from "/assets/omino/scene/utils/TextInputScene.js";
import TickboxScene from "/assets/omino/scene/utils/TickboxScene.js";
import SettingsContainerScene from "/assets/omino/scene/settings/SettingsContainerScene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino/Main.js";
import {pageData, toLink} from "/assets/omino/Options.js";
import MobileKeyboard from "/assets/omino/scene/utils/MobileKeyboard.js";
import {fill, stroke, background} from "/assets/omino/Colors.js";
import {OptionsHolder, OptionsElement} from "/assets/omino/scene/OptionsHolder.js";

//--

class ShareImageScene extends Scene{
  constructor(mainScene){
    super();
    this.mainScene=mainScene;
    this.mainDrawMouse=this.mainScene.boardScene.drawMouse;
    this.mainScene.boardScene.drawMouse=false;
    this.mainScene.hasMouseAccess=false;

    this.board = this.mainScene.boardScene.board.clone();
  }
  render(){
    this.mainScene.render();
    background("scenes.share.darken");

    fill("scenes.share.bg");
    stroke("scenes.share.outline");
    p5.strokeWeight((p5.height+p5.width)*0.005);
    p5.rect(p5.width*0.2,p5.height*0.2,p5.width*0.6,p5.height*0.6,(p5.height+p5.width)*0.01);
    p5.noStroke();
    fill("scenes.share.outline");
    p5.textSize((p5.height+p5.width)*0.01);
    p5.rect(p5.width/2-p5.textWidth("Click to copy")*1.4/2, p5.height*0.2-p5.textSize()*1.8, 
      p5.textWidth("Click to copy")*1.4, p5.textSize()*2,(p5.height+p5.width)*0.003);
    fill("scenes.share.text");
    p5.textAlign(p5.CENTER,p5.CENTER);
    p5.text("Click to copy", p5.width/2,p5.height*0.2-p5.textSize()*0.7);

    this.board.renderData.scale=
      Math.min(p5.width*0.6/this.board.width*0.9, p5.height*0.6/this.board.height*0.9);
    p5.translate(
      p5.width*0.2+p5.width*0.6/2-(this.board.renderData.scale*this.board.width)/2, 
      p5.height*0.2+p5.height*0.6/2-(this.board.renderData.scale*this.board.height)/2);
    this.board.render(new Vector(0,0), {palette:this.mainScene.paletteScene.palette, mouse:false});
  }
  mouseUp(){
    let canv = p5.createGraphics(this.board.width*50+10, this.board.height*50+10+15);
    canv.noStroke();
    background("scenes.share.bg", canv);
    canv.push();
    canv.translate(5,5);
    this.board.renderData.scale = 50;
    this.board.render(new Vector(0,0), {palette:this.mainScene.palette, env:canv});
    canv.pop();

    fill("scenes.share.infoText", canv);
    canv.textSize(15);
    let infoText=`${this.board.width}x${this.board.height}`;
    if(this.board.torusMode) infoText+=" - Torus";

    canv.textAlign(p5.RIGHT,p5.BOTTOM);
    canv.text("https://kyfexuwu.com/omino-playground", canv.width-6, canv.height-2);
    fill("scenes.share.bg", canv);
    canv.rect(0,canv.height-canv.textSize()-2, 
      canv.textWidth(infoText+"n")+6,canv.textSize()+2);

    fill("scenes.share.infoText", canv);
    canv.textAlign(p5.LEFT,p5.BOTTOM);
    canv.text(infoText, 6, canv.height-2);

    canv.elt.toBlob(blob=>{
      navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
      ]);
      canv.remove();
      canv=undefined;
    });

    Data.scene=this.mainScene;
    this.mainScene.hasMouseAccess=true;
    this.mainScene.boardScene.drawMouse=this.mainDrawMouse;
    return true;
  }
  resized(oldDims, newDims){
    super.resized(oldDims, newDims);
    this.mainScene.resized(oldDims, newDims);
  }
}
class Counter extends DimsScene{
  constructor(val, {min=-Infinity,max=Infinity,inc=1, submit=_=>0}){
    super();

    this.min=min;
    this.max=max;
    this.inc=inc;

    this.value=val;
    this.oldValue=val;

    this.submit = submit;
  }
  render(){
    if(this.value==this.oldValue) fill("scenes.util.counter.bg");
    else fill("scenes.util.counter.bgUnsaved");

    p5.rect(0,0,this.dims.x-this.dims.y*2,this.dims.y);
    fill("scenes.util.counter.bg");
    p5.rect(this.dims.x-this.dims.y*1.9, this.dims.y*0.1, this.dims.y*0.8, this.dims.y*0.8);
    p5.rect(this.dims.x-this.dims.y*0.9, this.dims.y*0.1, this.dims.y*0.8, this.dims.y*0.8);
    fill("scenes.util.counter.color");
    p5.textSize(this.dims.y*0.9);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(this.value, this.dims.y*0.1,this.dims.y*0.05);

    p5.push();
    stroke("scenes.util.counter.color");
    p5.strokeWeight(this.dims.y*0.04);
    p5.translate(this.dims.x-this.dims.y*2, 0);
    p5.scale(this.dims.y/10);
    p5.line(3,7,5,3);
    p5.line(7,7,5,3);
    p5.translate(10, 0);
    p5.line(3,3,5,7);
    p5.line(7,3,5,7);

    p5.pop();
  }

  mouseUp(x, y){
    if(!this.isIn()) return super.mouseUp(x,y);

    if(x>this.dims.x-this.dims.y) this.value-=this.inc;
    else if(x>this.dims.x-this.dims.y*2) this.value+=this.inc;

    this.value=Math.min(Math.max(this.value, this.min), this.max);

    focus(this);

    return true;
  }

  keyPressed(key){
    if(this.focused&&key=="Enter"){
      this.submit();
      return true;
    }
    return super.keyPressed(key);
  }
}

class Bar extends DimsScene{
  constructor(...subScenes){
    super();
    for(const scene of subScenes) this.addScene(scene);
  }
  render(){
    fill("scenes.sidebar.bg");
    p5.rect(0,0,this.dims.x,this.dims.y);

    super.render();
  }
}

class CustomOptionsHolder extends OptionsHolder{
  resized(oldDims, newDims=oldDims){
    const scale = this.parent.getScale();
    const padding=scale*3;
    p5.textSize(scale*6);

    let currY=0;
    for(const child of this.subScenes){
      child.optionsResize(padding, currY, this.dims.x-padding*2, scale*6);
      currY+=child.dims.y+scale*5;
    }

    return super.resized(oldDims, newDims);
  }
}

function withLabel(label, element, setDims=(s,w,h)=>s.element.dims = new Vector(w,h)){
  return new OptionsElement(s=>{
    s.element = s.addScene(element);
  },(s,x,y,w,h)=>{
    s.pos = new Vector(x,y);

    p5.textSize(h*0.9);
    s.element.pos = new Vector(p5.textWidth(label+"m"),0);
    setDims(s,w-s.element.pos.x,h);

    s.dims = new Vector(w,h);
  },s=>{
    p5.textSize(s.dims.y*0.9);
    fill("scenes.util.text");
    p5.textAlign(p5.LEFT,p5.CENTER);
    p5.text(label, 0, s.dims.y/2);
  });
}

const barButtonWrapper = s=>{
  fill(s.isIn()?"scenes.buttons.dark.bgHover":"scenes.buttons.dark.bg");
  p5.rect(0,0,s.dims.x,s.dims.y,(s.dims.x+s.dims.y)*0.1);
};
class OptionsScene extends DimsScene{
  constructor(){
    super();
    this.pos.z=10;

    this.options = this.addScene(new CustomOptionsHolder());

    const submit = _=>Data.scene.optionsScene.applyButton.click(0,0);

    this.applyButton = new OneTimeButtonScene(s=>{
      fill(s.isIn()?"scenes.util.button.bgHover":"scenes.util.button.bg");
      p5.rect(0,0,s.dims.x,s.dims.y);
      p5.textSize(this.getScale()*6);
      fill("scenes.util.button.color");
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.text("Apply", s.dims.x/2,s.dims.y/2);
    },s=>{
      if(!this.boardDims.valid()) return;
      let dims = this.boardDims.value.split(/[,x]/).map(i=>parseInt(i));
      if(isNaN(dims[0])||isNaN(dims[1])) return;

      let newLocked = Data.mainBoard.lockedTiles.vectors.filter(v=>v.x<dims[0]&&v.y<dims[1]);

      //TODO
      let newBoard = new Board(dims[0], dims[1], {
        lockedTiles:newLocked,
        ominoes:[],
        torusMode:this.torusBox.value,
      });
      for(const omino of Data.mainBoard.ominoes){
        let pos = omino.canPlace(newBoard, omino.pos);
        if(pos){
          omino.pos = pos;
          newBoard.add(omino);
        }
      }


      Data.mainBoard.width = dims[0];
      Data.mainBoard.height = dims[1];
      Data.mainBoard.torusMode=this.torusBox.value;
      Data.mainBoard.ominoes = newBoard.ominoes;
      
      Data.mainBoard.recalcPath();
      if(Data.scene.paletteScene){
        Data.scene.paletteScene.remove();

        if(allPalettes[this.palette.value-1]){
          Data.scene.paletteScene = Data.scene.addScene(new PaletteScene({palette:allPalettes[this.palette.value-1]}));
        }else{
          Data.scene.paletteScene = Data.scene.addScene(new PaletteScene({palette:nullPalette}));
        }
      }

      this.boardDims.oldValue=this.boardDims.value;
      this.palette.oldValue = this.palette.value;
      this.torusBox.oldValue = this.torusBox.value;

      p5.windowResized();
    });
    this.clearButton = new OneTimeButtonScene(s=>{
      fill(s.isIn()?"scenes.util.button.bgHover":"scenes.util.button.bg");
      p5.rect(0,0,s.dims.x,s.dims.y);
      p5.textSize(this.getScale()*6);
      fill("scenes.util.button.color");
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.text("Clear Board", s.dims.x/2,s.dims.y/2);
    },s=>{
      Data.mainBoard.ominoes=[];
      Data.mainBoard.lockedTiles=new LockedOmino([]);
      Data.mainBoard.recalcPath();
    });

    this.bottomBar = this.addScene(new Bar(
      new OneTimeButtonScene(s=>{
        barButtonWrapper(s);

        let arrOffs=s.isIn()?5:0;
        fill("scenes.buttons.dark.icon");
        p5.translate(s.dims.x*0.45,s.dims.y*0.45);
        p5.scale(s.dims.x/100);
        p5.beginShape();
        p5.vertex(10+arrOffs,-20);
        p5.vertex(35+arrOffs,0);
        p5.vertex(10+arrOffs,20);
        p5.vertex(10+arrOffs,5);
        p5.bezierVertex(-10,5,-20,10,-30,23);
        p5.bezierVertex(-20,0,-10,-5,10+arrOffs,-5);
        p5.endShape();

        if(s.isIn()) hover.set("Share Image", s);
      },s=>{
        Data.scene = new ShareImageScene(Data.scene);
      }),//share image
      new OneTimeButtonScene(s=>{
        barButtonWrapper(s);

        stroke("scenes.buttons.dark.icon");
        p5.strokeWeight(6);
        p5.noFill();
        p5.translate(s.dims.x*0.5,s.dims.y*0.5);
        p5.scale(s.dims.x/100);
        p5.push();
        if(s.isIn()) p5.rotate(-0.07);

        p5.line(-10,-10, -25,-10);
        p5.line(-10,10, -25,10);
        p5.arc(-25,0,20,20, Math.PI/2,Math.PI*3/2);
        p5.arc(-10,0,20,20, Math.PI/3,Math.PI/2);
        p5.arc(-10,0,20,20, Math.PI*3/2, Math.PI*5/3);

        p5.line(10,-10, 25,-10);
        p5.line(10,10, 25,10);
        p5.arc(25,0,20,20, Math.PI*3/2,Math.PI*5/2);
        p5.arc(10,0,20,20, Math.PI/2, Math.PI*2/3);
        p5.arc(10,0,20,20, Math.PI*4/3, Math.PI*3/2);

        p5.line(-15,0,15,0);

        p5.pop();
        p5.noStroke();

        if(s.isIn()) hover.set("Share Link", s);
      },s=>{
        navigator.clipboard.write([
            new ClipboardItem({
              'text/plain': toLink(Data.scene.boardScene.board, 
                (Data.scene.paletteScene||{palette:nullPalette}).palette)
            })
        ]);
      }),//share link
    ));

    this.settingsBar = this.addScene(new Bar(
      new OneTimeButtonScene(s=>{
        barButtonWrapper(s);
        if(s.isIn()) hover.set("Settings", s);

        p5.translate(s.dims.x*0.5,s.dims.y*0.5);
        p5.scale(s.dims.x/100);
        stroke("scenes.buttons.dark.icon");
        p5.strokeWeight(12);
        p5.noFill();
        p5.ellipse(0,0,43,43);
        p5.noStroke();

        p5.push();
        if(s.isIn()) p5.rotate(0.2);
        for(let i=0;i<6;i++){
          fill("scenes.buttons.dark.icon");
          p5.beginShape();
          p5.vertex(-10,-25);
          p5.vertex(-7,-37);
          p5.vertex(7,-37);
          p5.vertex(10,-25);
          p5.endShape();

          p5.rotate(Math.PI*2/6);
        }
        p5.pop();
      },s=>{
        Data.scene = new SettingsContainerScene(Data.scene);
      }),
      new OneTimeButtonScene(s=>{
        if(s.isIn()) hover.set("Toggle Fullscreen", s);

        barButtonWrapper(s);
        p5.translate(s.dims.x*0.5,s.dims.y*0.5);
        p5.scale(s.dims.x/50);

        stroke("scenes.buttons.dark.icon");
        p5.strokeWeight(3);
        p5.line(-15,-10,-8,-5);
        p5.line(15,-10,8,-5);
        p5.line(-15,10,-8,5);
        p5.line(15,10,8,5);
        p5.noStroke();

        fill("scenes.buttons.dark.icon");
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
      }, s=>{
        Data.isFullscreened=!Data.isFullscreened;
        p5.windowResized();
        window.scroll({top:Data.canvElt.getBoundingClientRect().y-document.body.getBoundingClientRect().y-
          (p5.windowHeight-p5.height)/2, behavior:"instant"});
      })
    ));
  }
  getScale(){
    let scale = this.dims.x/100;
    if(isKindaMobile) scale*=1.5;
    return scale;
  }

  resized(old,n=old){
    this.dims.y=n.y;
    this.dims.x=n.x/4;

    this.offs-=this.settingsBar.dims.y;
    this.offs*=n.x/old.x;

    let scale = this.getScale();
    let sbSize = Math.min(this.dims.x/3, scale*30);
    this.offs+=this.settingsBar.dims.y==0?0:sbSize;

    this.settingsBar.dims = new Vector(this.dims.x, sbSize);
    this.settingsBar.subScenes[0].dims = new Vector(sbSize*0.8,sbSize*0.8);
    this.settingsBar.subScenes[1].dims = new Vector(sbSize*0.8,sbSize*0.8);
    this.settingsBar.subScenes[0].pos = new Vector(sbSize*0.1, sbSize*0.1);
    this.settingsBar.subScenes[1].pos = new Vector(
      this.dims.x-this.settingsBar.subScenes[1].dims.x-sbSize*0.1, sbSize*0.1);

    this.options.pos = new Vector(0,sbSize);
    this.options.dims = new Vector(this.dims.x,this.dims.y-sbSize*2);

    this.bottomBar.pos = new Vector(0,this.dims.y-sbSize);
    this.bottomBar.dims = new Vector(this.dims.x, sbSize);
    this.bottomBar.subScenes[0].dims = new Vector(sbSize*0.8,sbSize*0.8);
    this.bottomBar.subScenes[0].pos = new Vector(this.dims.x/2+sbSize*0.1, sbSize*0.1);
    this.bottomBar.subScenes[1].dims = new Vector(sbSize*0.8,sbSize*0.8);
    this.bottomBar.subScenes[1].pos = new Vector(this.dims.x/2-sbSize-sbSize*0.1, sbSize*0.1);

    super.resized(old,n);
  }

  render(){
    fill("scenes.sidebar.bg");
    p5.rect(0,0,this.dims.x,p5.height);

    super.render();
  }
}

export default OptionsScene;
export {
  OptionsScene,
  Counter,
  CustomOptionsHolder,
  withLabel
}