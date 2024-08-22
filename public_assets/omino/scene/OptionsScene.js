 import {ScrollableScene, OneTimeButtonScene, Scene, DimsScene,
  focus, hover} from "/assets/omino/scene/Scene.js";
import BoardScene from "/assets/omino/scene/BoardScene.js";
import PaletteScene from "/assets/omino/scene/PaletteScene.js";
import TextInputScene from "/assets/omino/scene/TextInputScene.js";
import TickboxScene from "/assets/omino/scene/TickboxScene.js";
import SettingsScene from "/assets/omino/scene/settings/SettingsScene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino-playground.js";
import {pageData} from "/assets/omino/Options.js";
import {allPalettes, nullPalette} from "/assets/omino/Palettes.js";

const changelog = [
`v0.1.9 8/21/24
- Added a settings screen, this includes:
. - Keybinds
. - nothing else atm lol
- Optimized pathfinding algorithm (thanks dad!) (...just kidding doesn't work)
- Added comments to the board length calculator so it can be more easily understood `+
`(/assets/omino/BoardLengthCalculator.js)
- Added animations on omino transforms
- Boards now don't calculate path again when copying image
- Fixed bug with ad covering canvas
- Fixed app not resizing properly when sharing image
- Fixed path not considering all empty groups when calculating longest path (thanks @hhhguir)
- Fixed the "Add Omino" confirm button being offset wrong when app resized
- Added hover text to buttons
- Fixed the options on the left freaking out on resize`,
`v0.1.8c 8/19/24
- Path calculation should be slightly faster when loading a board from url`,
`v0.1.8b 8/16/24
- Fixed text not rendering correctly in the options panel
- Fixed screenshot incorrectly showing board as not in torus mode when it is
- Made it possible to put ominoes on the border in torus mode`,
`v0.1.8 8/15/24
- Added torus mode
- Removed lag when calculating optimal path (it's calculated in another thread now)
- Added color change to the board options when they are different from what's on the board `+
  `to show the use of the "Overwrite" button
- Let the user press enter on the options to apply changes`,
`v0.1.7b 8/14/24
- Fixed pieces past (9,y) or (x,9) decoding incorrectly when loading board from url`,
`v0.1.7 8/13/24 (again hehe)
- Fixed drawing mode so it doesn't create duplicate ominoes
- Added palettes for mono- to hexominoes (1 to 6)
- Added palette swapping
- Added board sharing! (the link button)`,
`v0.1.6 8/13/24
- Changed buttons to have icons instead of text
- Improved scrolling steal
- Made ominoes transparent when holding them
- Reworked internals to be neater
- Added dimension changing in app
- Added url parameter "fullscreen=[true, false]", which starts the app fullscreened if true
- Added a screenshot/share button`,
`v0.1.5 8/10/24
- Added better omino rotation
- Added better(?) fullscreen
- Added changelog (+ arbitrary version number lol)`
];

class ShareImageScene extends Scene{
  constructor(mainScene){
    super();
    this.mainScene=mainScene;

    this.upOnce=false;
    this.board = this.mainScene.boardScene.board.clone();
  }
  render(){
    this.mainScene.render();
    p5.background(0,100);

    p5.fill(173, 111, 153);
    p5.stroke(255);
    p5.strokeWeight((p5.height+p5.width)*0.005);
    p5.rect(p5.width*0.2,p5.height*0.2,p5.width*0.6,p5.height*0.6,(p5.height+p5.width)*0.01);
    p5.noStroke();
    p5.fill(255);
    p5.textSize((p5.height+p5.width)*0.01);
    p5.rect(p5.width/2-p5.textWidth("Click to copy")*1.4/2, p5.height*0.2-p5.textSize()*1.8, 
      p5.textWidth("Click to copy")*1.4, p5.textSize()*2,(p5.height+p5.width)*0.003);
    p5.fill(0);
    p5.textAlign(p5.CENTER,p5.CENTER);
    p5.text("Click to copy", p5.width/2,p5.height*0.2-p5.textSize()*0.7);

    this.board.renderData = {
      scale:Math.min(p5.width*0.6/this.board.width*0.9, p5.height*0.6/this.board.height*0.9)
    };
    p5.translate(
      p5.width*0.2+p5.width*0.6/2-(this.board.renderData.scale*this.board.width)/2, 
      p5.height*0.2+p5.height*0.6/2-(this.board.renderData.scale*this.board.height)/2);
    this.board.render(new Vector(999999,999999));
  }
  mouseUp(){
    if(!this.upOnce) return this.upOnce=true;

    let canv = p5.createGraphics(this.board.width*50+10, this.board.height*50+10+15);
    canv.noStroke();
    canv.background(173, 111, 153);
    canv.translate(5,5);
    this.board.renderData.scale = 50;
    this.board.render(new Vector(0,0), canv);
    canv.fill(0, 200);
    canv.textSize(15);
    canv.textAlign(p5.RIGHT,p5.BOTTOM);
    canv.text("https://kyfexuwu.com/omino-playground", canv.width-6-5, canv.height-2-5);

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
    return true;
  }
  resized(oldDims, newDims){
    super.resized(oldDims, newDims);
    this.mainScene.resized(oldDims, newDims);
  }
}
class Counter extends DimsScene{
  constructor(val, min=-Infinity,max=Infinity,inc=1){
    super();

    this.min=min;
    this.max=max;
    this.inc=inc;

    this.value=val;
    this.oldValue=val;
  }
  render(){
    if(this.value==this.oldValue) p5.fill(255);
    else p5.fill(247, 232, 156);

    p5.rect(0,0,this.dims.x-this.dims.y*2,this.dims.y);
    p5.fill(255);
    p5.rect(this.dims.x-this.dims.y*1.9, this.dims.y*0.1, this.dims.y*0.8, this.dims.y*0.8);
    p5.rect(this.dims.x-this.dims.y*0.9, this.dims.y*0.1, this.dims.y*0.8, this.dims.y*0.8);
    p5.fill(0);
    p5.textSize(this.dims.y*0.9);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(this.value, this.dims.y*0.1,this.dims.y*0.05);

    p5.push();
    p5.stroke(0);
    p5.strokeWeight(this.dims.y*0.06);
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
      Data.scene.optionsScene.overwriteButton.click(0,0);
      return true;
    }
    return super.keyPressed(key);
  }
}
class CustomTextInputScene extends TextInputScene{
  constructor(validator, value){
    super(validator);

    this.value=value;
    this.oldValue=this.value;
  }

  render(){
    if(this.value==this.oldValue) p5.fill(255);
    else p5.fill(247, 232, 156);

    p5.rect(0,0,this.dims.x,this.dims.y);
    p5.fill(0);
    p5.textSize(this.dims.y*0.8);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(this.value, 2, 2);
    if(this.focused&&p5.frameCount*0.015%1>0.5) p5.rect(p5.textWidth(this.value)+2, 2, 2, this.dims.y-4);
  }

  keyPressed(key){
    if(this.focused&&key=="Enter"){
      Data.scene.optionsScene.overwriteButton.click(0,0);
      return true;
    }
    return super.keyPressed(key);
  }

  setCorrectVal(newVal){
    this.value=newVal;
    this.oldValue=newVal;
  }
}
class CustomTickboxScene extends TickboxScene{
  constructor(value){
    super();

    this.value=value;
    this.oldValue=this.value;
  }

  render(){
    if(this.value==this.oldValue) p5.fill(255);
    else p5.fill(247, 232, 156);

    p5.rect(0,0,this.dims.x,this.dims.y);
    if(this.value){
      p5.stroke(0);
      p5.scale((this.dims.x+this.dims.y)*0.05);
      p5.strokeWeight(2);
      p5.line(2,2,8,8);
      p5.line(2,8,8,2);
      p5.noStroke();
    }
  }
}

class Bar extends DimsScene{
  constructor(...subScenes){
    super();
    for(const scene of subScenes) this.addScene(scene);
  }
  render(){
    p5.fill(20);
    p5.rect(0,0,this.dims.x,this.dims.y);

    super.render();
  }
}

class OptionsScene extends ScrollableScene{
  constructor(){
    super();

    this.settingsButton = this.addScene(new OneTimeButtonScene(s=>{
      if(s.isIn()) hover.set("Settings", s);
    },s=>{

    }));

    this.boardDims = this.addScene(new CustomTextInputScene(/[\dx,]/, pageData.dims.join(",")));
    this.palette = this.addScene(new Counter(allPalettes.indexOf(pageData.palette)+1, 0));
    this.torusBox = this.addScene(new CustomTickboxScene(pageData.torus));
    this.overwriteButton = this.addScene(new OneTimeButtonScene(s=>{
      p5.fill(s.isIn()?255:200);
      p5.rect(0,0,s.dims.x,s.dims.y);
      p5.textSize(this.dims.x/100*6);
      p5.fill(0);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.text("Overwrite", s.dims.x/2,s.dims.y/2);
    },s=>{
      let dims = this.boardDims.value.split(/[,x]/).map(i=>parseInt(i));
      if(isNaN(dims[0])||isNaN(dims[1])) return;

      Data.scene.boardScene.remove();
      Data.scene.boardScene = Data.scene.addScene(new BoardScene(dims[0], dims[1], {
        torusMode:this.torusBox.value,
      }));
      Data.scene.paletteScene.remove();

      if(allPalettes[this.palette.value-1]){
        Data.scene.paletteScene = Data.scene.addScene(new PaletteScene(allPalettes[this.palette.value-1]));
      }else{
        Data.scene.paletteScene = Data.scene.addScene(new PaletteScene(nullPalette));
      }

      this.boardDims.oldValue=this.boardDims.value;
      this.palette.oldValue = this.palette.value;
      this.torusBox.oldValue = this.torusBox.value;

      p5.windowResized();
    }));

    const buttonWrapper = s=>{
      p5.fill(s.isIn()?100:70);
      p5.rect(0,0,s.dims.x,s.dims.y,(s.dims.x+s.dims.y)*0.1);
    };

    this.bottomBar = this.addScene(new Bar(
      new OneTimeButtonScene(s=>{
        buttonWrapper(s);

        let arrOffs=s.isIn()?5:0;
        p5.fill(255);
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
        buttonWrapper(s);

        p5.stroke(255);
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
              'text/plain': Data.scene.boardScene.board.toLink()
            })
        ]);
      }),//share link
    ));

    this.settingsBar = this.addScene(new Bar(
      new OneTimeButtonScene(s=>{
        buttonWrapper(s);
        if(s.isIn()) hover.set("Settings", s);

        p5.translate(s.dims.x*0.5,s.dims.y*0.5);
        p5.scale(s.dims.x/100);
        p5.stroke(255);
        p5.strokeWeight(12);
        p5.noFill();
        p5.ellipse(0,0,43,43);
        p5.noStroke();

        p5.push();
        if(s.isIn()) p5.rotate(0.2);
        for(let i=0;i<6;i++){
          p5.fill(255);
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
        Data.scene = new SettingsScene(Data.scene);
      })
    ));

    this.dontScroll=[
      this.bottomBar,
      this.settingsBar,
    ];
  }
  resized(old,n){
    this.dims.y=p5.height;
    this.dims.x=p5.width/4;

    this.offs*=n.x/old.x;

    let scale = this.dims.x/100;
    let sbSize = Math.min(this.dims.x/3, scale*30);

    let currY=sbSize;
    const padding=scale*3;
    p5.textSize(scale*6);
    this.boardDims.dims = new Vector(this.dims.x*0.99 - p5.textWidth("Dimensions: ")-padding, scale*6*1.2);
    this.boardDims.pos = new Vector(p5.textWidth("Dimensions: ")+padding, 2*scale+currY-this.offs);
    currY+=this.boardDims.dims.y+scale*3+2*scale;

    this.palette.dims = new Vector(this.dims.x*0.99 - p5.textWidth("Palette: ")-padding, scale*6*1.2);
    this.palette.pos = new Vector(p5.textWidth("Palette: ")+padding, 2*scale+currY-this.offs);
    currY+=this.palette.dims.y+scale*3+2*scale;

    this.torusBox.dims = new Vector(p5.textSize()*1.3, p5.textSize()*1.3);
    this.torusBox.pos = new Vector(p5.textWidth("Torus mode ")+padding, 2*scale+currY-this.offs);
    currY+=2*scale+this.torusBox.dims.y;

    this.overwriteButton.dims = new Vector(p5.textWidth("Overwrite")*1.5, p5.textSize()*1.3);
    this.overwriteButton.pos = new Vector(2*scale, 2*scale+currY-this.offs);
    currY+=2*scale+this.overwriteButton.dims.y;

    this.bottomBar.pos = new Vector(0,this.dims.y-sbSize);
    this.bottomBar.dims = new Vector(this.dims.x, sbSize);
    this.bottomBar.subScenes[0].dims = new Vector(sbSize*0.8,sbSize*0.8);
    this.bottomBar.subScenes[0].pos = new Vector(this.dims.x/2+sbSize*0.1, sbSize*0.1);
    this.bottomBar.subScenes[1].dims = new Vector(sbSize*0.8,sbSize*0.8);
    this.bottomBar.subScenes[1].pos = new Vector(this.dims.x/2-sbSize-sbSize*0.1, sbSize*0.1);

    this.settingsBar.dims = new Vector(this.dims.x, sbSize);
    this.settingsBar.subScenes[0].dims = new Vector(sbSize*0.8,sbSize*0.8);
    this.settingsBar.subScenes[0].pos = new Vector(sbSize*0.1, sbSize*0.1);

    super.resized(old,n);
  }
  scrolled(x,y,delta){
    delta*=this.dims.x/100*0.3;

    let oldOffs=this.offs;
    if(!super.scrolled(x,y,delta)) return false;
    if(this.offs<0){
      for(const child of this.subScenes) if(!this.dontScroll.includes(child)) child.pos.y+=oldOffs;
      this.offs=0;
      return true;
    }

    for(const child of this.subScenes) if(!this.dontScroll.includes(child)) child.pos.y-=delta;

    return true;
  }

  render(){
    p5.fill(50);
    p5.rect(0,0,this.dims.x,p5.height);

    p5.push();
    let sc = this.dims.x/100;

    p5.fill(255);
    p5.textSize(6*sc);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text("Dimensions: ", 2, this.boardDims.getAbsolutePos().y);
    p5.text("Palette: ", 2, this.palette.getAbsolutePos().y);
    p5.text("Torus mode", 2, this.torusBox.getAbsolutePos().y);

    p5.translate(0,-this.offs);
    p5.scale(sc);

    p5.textSize(4.5);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text("Changelog\n\n"+changelog.join("\n\n"), 3,130, 100-3*2);

    p5.pop();

    super.render();
  }
}

export default OptionsScene;
