import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino-playground.js";
import {fill} from "/assets/omino/Colors.js";

const isKindaMobile = 'ontouchstart' in document.documentElement;

function forReverse(array, callback){
  for(let i=array.length-1;i>=0;i--){
    let r = callback(array[i]);
    if(r!==undefined) return r;
  }
}

//--

class Scene{
  constructor(){
    this.pos=new Vector(0,0);
    this.subScenes=[];
    this.parent=undefined;

    this.focused=false;
    this.hasMouseAccess=true;
  }
  addScene(scene){
    this.subScenes.push(scene);
    scene.parent=this;

    return scene;
  }
  render(){
    Scene.renderChildren(this);
  }
  static renderChildren(self){
    for(const scene of self.subScenes){
      p5.push();
      p5.translate(scene.pos.x,scene.pos.y);
      scene.render();
      p5.pop();
    }
  }
  mouseDown(x,y){
    return forReverse(this.subScenes, scene=>{
      if(scene.mouseDown(x-scene.pos.x,y-scene.pos.y)) return true;
    });
  }
  mouseUp(x,y){
    return forReverse(this.subScenes, scene=>{
      if(scene.mouseUp(x-scene.pos.x,y-scene.pos.y)) return true;
    });
  }
  keyPressed(key){
    return forReverse(this.subScenes, scene=>{
      if(scene.keyPressed(key)) return true;
    });
  }
  scrolled(x, y, delta){
    return forReverse(this.subScenes, scene=>{
      if(scene.scrolled(x-scene.pos.x,y-scene.pos.y, delta)) return true;
    });
  }

  getAbsolutePos(){
    if(!this.parent) return new Vector(0,0);
    return this.parent.getAbsolutePos().add(this.pos);
  }
  resized(oldDims, newDims){
    for(const scene of this.subScenes){
      scene.resized(oldDims, newDims);
    }
  }

  focus(){
    this.focused=true;
  }
  unfocus(){
    this.focused=false;
  }
  remove(){
    if(this.parent) this.parent.subScenes.splice(this.parent.subScenes.indexOf(this),1);
  }
}

class DimsScene extends Scene{
  constructor(){
    super();
    this.dims=new Vector(0,0);
  }
  isIn(){
    if(this.parent&&!this.parent.hasMouseAccess) return false;
    if(this.parent instanceof DimsScene && !this.parent.isIn()) return false;
    let absPos = this.getAbsolutePos();
    return p5.mouseX>absPos.x&&p5.mouseY>absPos.y&&
      p5.mouseX<absPos.x+this.dims.x&&p5.mouseY<absPos.y+this.dims.y;
  }
}
class ButtonScene extends DimsScene{
  constructor(){
    super();
  }
  mouseUp(x,y){
    if(this.isIn()){
      focus(this);
      
      this.click(x, y);
      return true;
    }
  }
  click(){}
}
class OneTimeButtonScene extends ButtonScene{
  constructor(render, click, init=_=>0){
    super();

    this.renderFunc=render;
    this.clickFunc=click;

    init(this);
  }
  render(){ this.renderFunc(this); }
  click(x, y){ this.clickFunc(this, x, y); return true; }
}
const maxClickDist=5;
class ScrollableScene extends DimsScene{
  constructor(){
    super();
    this.offs=0;

    this.maybeScrolling=undefined;
    this.lastScroll=undefined;
    this.mouseMoveListener=undefined;
    this.mouseUpListener=undefined;
  }
  mouseDown(x, y){
    if(!isKindaMobile) super.mouseDown(x,y);
    if(!this.isIn()||!isKindaMobile) return;

    this.maybeScrolling=new Vector(p5.mouseX, p5.mouseY);
    this.lastScroll=undefined;

    Data.canvElt.removeEventListener("mousemove", this.mouseMoveListener);
    Data.canvElt.removeEventListener("touchmove", this.mouseMoveListener);
    Data.canvElt.removeEventListener("mouseup", this.mouseUpListener);
    Data.canvElt.removeEventListener("touchend", this.mouseUpListener);

    Data.canvElt.addEventListener("mousemove",this.mouseMoveListener= e=>{
      let offsY=e.offsetY||(e.touches[0].pageY-Data.canvElt.offsetTop);

      if(this.lastScroll||Math.abs(this.maybeScrolling.y-offsY)>maxClickDist){
        if(!this.lastScroll) this.lastScroll=this.maybeScrolling;
        this.scrolled(p5.mouseX, p5.mouseY, this.lastScroll.y-p5.mouseY);
        this.lastScroll=new Vector(p5.mouseX, p5.mouseY);
      }
    });
    Data.canvElt.addEventListener("touchmove", this.mouseMoveListener);
    Data.canvElt.addEventListener("mouseup", this.mouseUpListener=e=>{
      Data.canvElt.removeEventListener("mousemove", this.mouseMoveListener);
      if(this.maybeScrolling.distTo(new Vector(p5.mouseX, p5.mouseY))<maxClickDist){
        this.lastScroll=undefined;
        super.mouseUp(p5.mouseX,p5.mouseY);
      }
    });
    Data.canvElt.addEventListener("touchend", this.mouseUpListener);
  }
  mouseUp(x,y){
    if(this.lastScroll) return;
    super.mouseUp(x,y);
  }
  scrolled(x,y,delta){
    if(!this.isIn()) return false;

    this.offs+=delta;
    return true;
  }
}

let focusedElement;
function focus(element){
  if(focusedElement) focusedElement.unfocus();
  focusedElement = element;
  element.focus();
}

let hoverData = {
  text:"",
  tWidth:0,

  pos:new Vector(-999,-999),
  time:-Infinity,
  currScene:undefined
};
let hover={
  set: function(text, scene){
    let currScene = hoverData.currScene;
    while(currScene){
      if(currScene.parent==scene) return;
      currScene=currScene.parent;
    }

    let mousePos=new Vector(p5.mouseX, p5.mouseY);
    if(hoverData.pos.equals(mousePos)) return;

    p5.push();
    p5.textSize(15);
    hoverData = {
      text,
      tWidth:p5.textWidth(text)+10,
      pos:mousePos,
      time:-90,
      scene:scene,
    };
    p5.pop();
  },
  draw: function (){
    let inScene=false;
    let currScene = hoverData.scene;
    while(currScene){
      if(currScene==Data.scene){
        inScene=true;
        break;
      }
      currScene=currScene.parent;
    }
    if(!hoverData.pos.equals(new Vector(p5.mouseX, p5.mouseY))||!inScene){
      hoverData.pos=new Vector(-999,-999);
      hoverData.time=-Infinity;
      hoverData.currScene=undefined;
      hoverData.scene = undefined;
    }
    hoverData.time++;
    if(hoverData.time>0){
      fill("hover.bg");
      p5.rect(hoverData.pos.x-hoverData.tWidth/2,hoverData.pos.y-20, hoverData.tWidth, 20, 5);
      fill("hover.text");
      p5.textAlign(p5.CENTER, p5.BOTTOM);
      p5.textSize(15);
      p5.text(hoverData.text, hoverData.pos.x, hoverData.pos.y-5/2);
    }
  }
};

export default Scene;
export {
  Scene,
  DimsScene,
  ButtonScene,
  OneTimeButtonScene,
  ScrollableScene,

  focus,
  hover,
  forReverse,
  isKindaMobile
};