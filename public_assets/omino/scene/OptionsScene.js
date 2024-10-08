const changelog = [
`v0.2.7c 9/21/24
- Fixed the crash (part 2)`,
`v0.2.7b 9/20/24
- Fixed a crash hopefully`,
`v0.2.7 9/20/24
- Added new "safeMode" URL parameter: if the app isn't loading for whatever reason, add "?safeMode=true" or `+
`"&safeMode=true" to the end of the URL, and the app will load without colorfiles and mods.
- Added an events system for helping modfile developers
- Cleaned up adding modfiles and colorfiles`,
`v0.2.6 9/14/24
- Change omino drawing so it's click and drag
- Fixed mobile input crashing on weird screen sizes
- Fixed omino drawing letting you draw outside the bounds (thanks @dr.koffeeblahajedition!)`,
`v0.2.5 9/11/24
- Highlighting ominoes not in palette now works for unfilled palettes (heptominoes, octominoes...)
- Changed rendering on torus mode to make the board easier to visualize
- Fixed screenshot not capturing board correctly (again)
- Fixed links sometimes generating incorrectly (again) (thanks @hhhguir!)
- Fixed changelog saying undefined at the end`,
`v0.2.4 9/9/24
- Fixed the "Calculate Path" tickbox incorrectly recalculating the path when it shouldn't
- Fixed the app crashing when trying to set a size of 0 in torus torusMode (thanks @hhhguir!)
- Fixed keybindings not working when Caps Lock is on (thanks @bruhh9930!)
- Fixed some palettes not having correct colors (thanks @hhhguir!)
- Added more advanced wrapping in the changelog
- Increased Options size on mobile
- Added a number pad for mobile (so they can change the size now!)
- Fixed more mobile controls jank
- Fixed the Add Omino button not having a background`,
`v0.2.3b 9/6/24
- Fixed image copying not working`,
`v0.2.3 9/6/24
- added mobile support :3`,
`v0.2.2 9/6/24
- Fixed the High Contrast colorfile to make creating ominoes actually visible
- Made the High Contrast colorfile more easily accessible (there's a button for it now)
- Improved changing colorfiles
- Added more functions for use in colorfiles (lighten, darken)
- Added board building to colorfiles
- Fixed locked tiles in links (again again) (thanks @hhhguir :3)
- Fixed the cursor still showing you can grab ominoes under the Share Board screen
- Stopped removing pieces when going into puzzle editing mode`,
`v0.2.1 9/3/24
- Fixed locked tiles decoding incorrectly for very large boards (thanks @hhhguir!)
- Added colorfiles! This is a way to recolor every part of Omino Playground, through a javascript file. `+
`Open kyfexuwu.com/‍assets/‍omino/‍colorfiles/‍default.js to view an example of a colorfile, `+
`and instructions on how to make and use your own.
- Fixed omino adding screen letting the mouse through
- Redid graphics for the Palette tab (add button + omino buttons)
- Fixed some elements overlapping the settings button and fullscreen button when scrolling
- Added board type to screenshot
- Added highlights to screenshot`,
`v0.2.0 8/29/24 (the puzzle + hhhguir update)
- Fixed pieces overlapping others or going out of the board when resizing (thanks @hhhguir!)
- Pieces in the palette that are on the board are now highlighted when "Highlight duplicate pieces" is checked (thanks @hhhguir!)
- Clearing the board doesn't bug out locked tiles any more (thanks @hhhguir!)
- Fixed links not having the locked tiles data (thanks @hhhguir!)
note: v0.1.10 is v0.2.0`,
`v0.1.10-alpha3 8/28/24
- Added toggle for highlighting duplicate pieces (thanks @hhhguir!)
- Added toggle for highlighting pieces not in the current palette (thanks @hhhguir!)
- Added board dimensions in screenshot (thanks @stefliew!)`,
`v0.1.10-alpha2 8/27/24
- Fixed end point not showing up when enabling it
- Started adding the custom piece palette
- Added keybinds for building mode
- Divided keybinds up into sections
- Greatly optimized pathfinding algorithm (it was a bug lol)`,
`v0.1.10-alpha1 8/26/24
- Moved fullscreen button to top left
- Added board data! This is meant for puzzles, and includes:
. - Setting "locked" squares
. - Setting an arbitrary start and/or end point
. - Coming soon: setting a piece palette to solve the puzzle with
- Fixed a bug where clicking on the trash without an omino would crash
- Refactored Vectors (>:3)
- Split the "Overwrite" button into 2 buttons: "Apply" and "Clear"
- Added a toggle for calculating path length (so you don't lag your computer when building on big boards)`,
`v0.1.9d 8/22/24
- Fixed torus mode being broken`,
`v0.1.9c 8/22/24
- Made path render a bit cleaner (no overlaps at corners)
- Fixed cursor changing outside of board when it shouldn't when on torus mode
- Added bug report button in settings
- fixed a bug lol
- Added keybinds! You can view and change them`,
`v0.1.9b 8/22/24
- Made drawing ominoes look prettier
- Fixed being able to place ominoes on top of themselves in torus mode (thanks @yeacloth)
- Made ominoes render better at large sizes
- Removed path calculation lag when not calculating a super long path anymore `+
`(ex: switching from a big board to a small board)
- Tweaked delete animation
- Fixed the options panel scroll offsetting weirdly on app resize`,
`v0.1.9 8/21/24
- Added a settings screen, this includes:
. - Keybinds
. - nothing else atm lol
- Added comments to the board length calculator so it can be more easily understood `+
`(/assets/‍omino/‍BoardLengthCalculator.js)
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
- Added changelog (+ arbitrary version number lol)`,

`Special thanks to these users:
- @hhhguir - for finding so many bugs thank you so much`,
];

import {ScrollableScene, OneTimeButtonScene, Scene, DimsScene,
  focus, hover, isKindaMobile} from "/assets/omino/scene/Scene.js";
import Board from "/assets/omino/Board.js";
import BoardScene from "/assets/omino/scene/BoardScene.js";
import PaletteScene from "/assets/omino/scene/PaletteScene.js";
import TextInputScene from "/assets/omino/scene/TextInputScene.js";
import TickboxScene from "/assets/omino/scene/TickboxScene.js";
import SettingsScene from "/assets/omino/scene/settings/SettingsScene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino/Main.js";
import {pageData, toLink} from "/assets/omino/Options.js";
import {allPalettes, nullPalette} from "/assets/omino/Palettes.js";
import {LockedOmino} from "/assets/omino/Omino.js";
import SolveScene from "/assets/omino/scene/SolveScene.js";
import MobileKeyboard from "/assets/omino/scene/MobileKeyboard.js";
import {fill, stroke, background} from "/assets/omino/Colors.js";

const spaceRegex=/[ \u200d]/;
function smartText(text, x, y, w){
  let splitText=text.split("\n").map(l=>l.split(spaceRegex));
  let joiners=text.split("").filter(c=>spaceRegex.test(c));

  let toRender=[];
  let joinerIndex=0;
  for(const line of splitText){
    let lines=[];

    let newLine=[];
    for(const section of line){
      let toAdd=section+(joiners[joinerIndex]||"");
      if(p5.textWidth(newLine.join("")+toAdd||newLine.length==0)<w){
        newLine.push(toAdd);
      }else{
        lines.push(newLine);
        newLine=[toAdd];
      }
      joinerIndex++;
    }

    lines.push(newLine);
    toRender=toRender.concat(lines);
    joinerIndex--;
  }

  p5.text(toRender.map(l=>l.join("")).join("\n"), x,y);
}

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
class CustomTextInputScene extends TextInputScene{
  constructor(validator, value, submit=_=>0){
    super();

    this.value=value;
    this.validator=validator;
    this.oldValue=this.value;
    this.submit=submit;
  }
  mouseUp(x,y){
    if(DimsScene.prototype.mouseUp.call(this, x,y)){
      this.value=this.keyboard.value;
      return true;
    }

    if(this.isIn()){
      focus(this);

      if(isKindaMobile&&!this.keyboard){
        this.keyboard=this.addScene(new MobileKeyboard([
          [1,2,3],[4,5,6],[7,8,9],[",",0,"Backspace"]
        ]));
        this.keyboard.value=this.value;
        this.recalc();
      }

      return true;
    }else if(this.keyboard){
      if(this.keyboard) this.keyboard.remove();
      this.keyboard=undefined;
      return true;
    }
  }
  recalc(){
    if(!this.keyboard) return;
    this.keyboard.changePosAndDims(new Vector(p5.width/2+p5.height*0.1,p5.height*0.1).sub(this.getAbsolutePos().trimTo(2)), 
      new Vector(p5.width/2-p5.height*0.2,p5.height*0.8));
    this.keyboard.recalculate();
  }

  render(){
    if(this.isIn()) p5.cursor(p5.TEXT);

    if(!this.validator.test(this.value)) fill("scenes.util.textInput.invalid");
    else if(this.value==this.oldValue) fill("scenes.util.textInput.bg");
    else fill("scenes.util.textInput.bgUnsaved");

    p5.rect(0,0,this.dims.x,this.dims.y);
    fill("scenes.util.textInput.color");
    p5.textSize(this.dims.y*0.8);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(this.value, 2, 2);
    if(this.focused&&p5.frameCount*0.015%1>0.5) p5.rect(p5.textWidth(this.value)+2, 2, this.dims.y*0.05, this.dims.y-4);

    Scene.renderChildren(this);
  }

  valid(){ return this.validator.test(this.value); }
  keyPressed(key){
    if(this.focused&&this.valid()&&key=="Enter"){
      this.submit();
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
    if(this.value==this.oldValue) fill("scenes.util.tickbox.bg");
    else fill("scenes.util.tickbox.bgUnsaved");

    p5.rect(0,0,this.dims.x,this.dims.y);
    if(this.value){
      stroke("scenes.util.tickbox.color");
      p5.scale((this.dims.x+this.dims.y)*0.05);
      p5.strokeWeight(2);
      p5.line(2,2,8,8);
      p5.line(2,8,8,2);
      p5.noStroke();
    }
  }
}
class ListElement extends DimsScene{
  constructor(label, element, resizeCallback=_=>0){
    super();
    this.label=label;
    this.element=this.addScene(element);
    this.resizeCallback=resizeCallback;
  }
  resized(oldDims, newDims=oldDims){
    this.dims = new Vector(newDims.x*0.99, p5.textSize()*1.5);
    super.resized(oldDims,newDims);
    this.resizeCallback(p5.textWidth(this.label+"r"));
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

class OptionsScene extends ScrollableScene{
  constructor(){
    super();
    this.pos.z=10;

    const submit = _=>Data.scene.optionsScene.applyButton.click(0,0);
    this.boardDims = this.addScene(new CustomTextInputScene(/^[1-9]\d*,[1-9]\d*$/,
      Data.mainBoard.width+","+Data.mainBoard.height, submit));
    this.palette = this.addScene(new Counter(allPalettes.indexOf(pageData.palette)+1, {min:0, submit}));
    this.torusBox = this.addScene(new CustomTickboxScene(Data.mainBoard.torusMode));
    this.applyButton = this.addScene(new OneTimeButtonScene(s=>{
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
    }));
    this.clearButton = this.addScene(new OneTimeButtonScene(s=>{
      fill(s.isIn()?"scenes.util.button.bgHover":"scenes.util.button.bg");
      p5.rect(0,0,s.dims.x,s.dims.y);
      p5.textSize(this.getScale()*6);
      fill("scenes.util.button.color");
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.text("Clear", s.dims.x/2,s.dims.y/2);
    },s=>{
      Data.mainBoard.ominoes=[];
      Data.mainBoard.lockedTiles=new LockedOmino([]);
      Data.mainBoard.recalcPath();
    }));

    this.bottomBar = this.addScene(new Bar(
      new OneTimeButtonScene(s=>{
        buttonWrapper(s);

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
        buttonWrapper(s);

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
        buttonWrapper(s);
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
        Data.scene = new SettingsScene(Data.scene);
      }),
      new OneTimeButtonScene(s=>{
        if(s.isIn()) hover.set("Toggle Fullscreen", s);

        buttonWrapper(s);
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

    const buttonWrapper = s=>{
      fill(s.isIn()?"scenes.buttons.dark.bgHover":"scenes.buttons.dark.bg");
      p5.rect(0,0,s.dims.x,s.dims.y,(s.dims.x+s.dims.y)*0.1);
    };

    this.dontScroll=[
      this.bottomBar,
      this.settingsBar,
    ];
  }
  getScale(){
    let scale = this.dims.x/100;
    if(isKindaMobile) scale*=1.5;
    return scale;
  }
  resized(old,n=old){
    this.dims.y=p5.height;
    this.dims.x=p5.width/4;

    this.offs-=this.settingsBar.dims.y;
    this.offs*=n.x/old.x;

    let scale = this.getScale();
    let sbSize = Math.min(this.dims.x/3, scale*30);
    this.offs+=this.settingsBar.dims.y==0?0:sbSize;

    let currY=sbSize;
    const padding=scale*3;
    p5.textSize(scale*6);
    this.boardDims.dims = new Vector(this.dims.x*0.99 - p5.textWidth("nDimensions:")-padding, scale*6*1.2);
    this.boardDims.pos = new Vector(p5.textWidth("nDimensions")+padding, 2*scale+currY-this.offs);
    this.boardDims.recalc();
    currY+=this.boardDims.dims.y+scale*3+2*scale;

    this.palette.dims = new Vector(this.dims.x*0.99 - p5.textWidth("nPalette:")-padding, scale*6*1.2);
    this.palette.pos = new Vector(p5.textWidth("nPalette:")+padding, 2*scale+currY-this.offs);
    currY+=this.palette.dims.y+scale*3+2*scale;

    this.torusBox.dims = new Vector(p5.textSize()*1.3, p5.textSize()*1.3);
    this.torusBox.pos = new Vector(p5.textWidth("nTorus mode:")+padding, 2*scale+currY-this.offs);
    currY+=2*scale+this.torusBox.dims.y;

    this.applyButton.dims = new Vector(p5.textWidth("mmApply"), p5.textSize()*1.3);
    this.applyButton.pos = new Vector(2*scale, 2*scale+currY-this.offs);
    currY+=2*scale+this.applyButton.dims.y;

    this.clearButton.dims = new Vector(p5.textWidth("mmClear"), p5.textSize()*1.3);
    this.clearButton.pos = new Vector(2*scale, 2*scale+currY-this.offs);
    currY+=2*scale+this.clearButton.dims.y;

    if(this.calcPathBox){
      this.calcPathBox.dims = new Vector(p5.textSize()*1.3, p5.textSize()*1.3);
      this.calcPathBox.pos = new Vector(p5.textWidth("nCalculate path:")+padding, 2*scale+currY-this.offs);
      currY+=2*scale+this.calcPathBox.dims.y;

      currY+=2*scale+this.calcPathBox.dims.y;

      this.preventDupesBox.dims = new Vector(p5.textSize()*1.3, p5.textSize()*1.3);
      this.preventDupesBox.pos = new Vector(p5.textWidth("nDuplicate pieces")+padding, 2*scale+currY-this.offs);
      currY+=2*scale+this.preventDupesBox.dims.y;

      this.keepInPaletteBox.dims = new Vector(p5.textSize()*1.3, p5.textSize()*1.3);
      this.keepInPaletteBox.pos = new Vector(p5.textWidth("nNon-palette pieces")+padding, 2*scale+currY-this.offs);
      currY+=2*scale+this.keepInPaletteBox.dims.y;
    }

    this.bottomBar.pos = new Vector(0,this.dims.y-sbSize);
    this.bottomBar.dims = new Vector(this.dims.x, sbSize);
    this.bottomBar.subScenes[0].dims = new Vector(sbSize*0.8,sbSize*0.8);
    this.bottomBar.subScenes[0].pos = new Vector(this.dims.x/2+sbSize*0.1, sbSize*0.1);
    this.bottomBar.subScenes[1].dims = new Vector(sbSize*0.8,sbSize*0.8);
    this.bottomBar.subScenes[1].pos = new Vector(this.dims.x/2-sbSize-sbSize*0.1, sbSize*0.1);

    this.settingsBar.dims = new Vector(this.dims.x, sbSize);
    this.settingsBar.subScenes[0].dims = new Vector(sbSize*0.8,sbSize*0.8);
    this.settingsBar.subScenes[1].dims = new Vector(sbSize*0.8,sbSize*0.8);
    this.settingsBar.subScenes[0].pos = new Vector(sbSize*0.1, sbSize*0.1);
    this.settingsBar.subScenes[1].pos = new Vector(
      this.dims.x-this.settingsBar.subScenes[1].dims.x-sbSize*0.1, sbSize*0.1);

    super.resized(old,n);
  }
  scrolled(x,y,delta){
    let oldOffs=this.offs;
    if(!super.scrolled(x,y,delta)) return false;
    if(this.offs<0){
      for(const child of this.subScenes) if(!this.dontScroll.includes(child)) child.pos.y+=oldOffs;
      this.offs=0;
      return true;
    }

    for(const child of this.subScenes) if(!this.dontScroll.includes(child)) child.pos.y-=delta;
    if(this.boardDims.keyboard) this.boardDims.keyboard.pos = 
      new Vector(p5.width/2+p5.height*0.1,p5.height*0.1).sub(this.boardDims.getAbsolutePos().trimTo(2))

    return true;
  }

  render(){
    if(this.parent instanceof SolveScene&&!this.calcPathBox){
      let highlights={
        dupes:false,
        nonPalettes:false,
      };
      Data.mainBoard.renderData.highlightFunc=(omino, ominoes, palette)=>{
        if(highlights.dupes&&ominoes.some(o=>o!=omino&&o.equals(omino))) return "renderHighlighted";
        if(highlights.nonPalettes&&
            (palette.size==-1?(omino.vectors.length!=this.palette.oldValue):omino.vectors.length!=palette.size)&&
            !Object.values(palette.data).some(o=>o.orig&&o.omino.equals(omino))) 
          return "renderHighlighted";

        return "render";
      };

      this.calcPathBox = this.addScene(new TickboxScene(true,s=>{
        Data.mainBoard.shouldRecalcPath=s.value;
        
        if(s.value) Data.mainBoard.recalcPath();
        else Data.mainBoard.path=[];
      }));
      this.preventDupesBox = this.addScene(new TickboxScene(false,s=>{
        highlights.dupes=s.value;
      }));
      this.keepInPaletteBox = this.addScene(new TickboxScene(false,s=>{
        highlights.nonPalettes=s.value;
      }));
      this.subScenes=this.subScenes.sort((s1,s2)=>{
        if(s1==this.calcPathBox||s1==this.preventDupesBox||s1==this.keepInPaletteBox) return -1;
        if(s2==this.calcPathBox||s2==this.preventDupesBox||s2==this.keepInPaletteBox) return 1;
        return 0;
      });

      this.resized(new Vector(p5.width, p5.height));
    }

    fill("scenes.sidebar.bg");
    p5.rect(0,0,this.dims.x,p5.height);

    p5.push();
    let scale = this.getScale();

    fill("scenes.sidebar.text");
    p5.textSize(6*scale);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text("Dimensions: ", 2, this.boardDims.getAbsolutePos().y);
    p5.text("Palette: ", 2, this.palette.getAbsolutePos().y);
    p5.text("Torus mode: ", 2, this.torusBox.getAbsolutePos().y);
    if(this.calcPathBox){
      p5.text("Calculate path: ", 2, this.calcPathBox.getAbsolutePos().y);
      p5.text("Highlight: ", 2+p5.textSize(), this.calcPathBox.getAbsolutePos().y+p5.textSize()*2);
      p5.text("Duplicate pieces ", 2, this.preventDupesBox.getAbsolutePos().y);
      p5.text("Non-palette pieces ", 2, this.keepInPaletteBox.getAbsolutePos().y);
    }

    p5.translate(0,-this.offs);
    p5.scale(scale);

    p5.textSize(4.5);
    p5.textAlign(p5.LEFT, p5.TOP);

    smartText("Changelog\n\n"+changelog.join("\n\n"), 3,130, 1/scale*this.dims.x-3*2);

    p5.pop();

    super.render();
  }
}

export default OptionsScene;
export {
  OptionsScene,
  Counter,
  CustomTextInputScene,
  CustomTickboxScene,
}