import Vector from "/assets/omino/Vector.js";

class Scene{
  constructor(){
    this.pos=new Vector(0,0);
    this.subScenes=[];
    this.parent=undefined;

    this.focused=false;
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
    for(const scene of this.subScenes){
      if(scene.mouseDown(x-scene.pos.x,y-scene.pos.y)) return true;
    }
  }
  mouseUp(x,y){
    for(const scene of this.subScenes){
      if(scene.mouseUp(x-scene.pos.x,y-scene.pos.y)) return true;
    }
  }
  keyPressed(key){
    for(const scene of this.subScenes){
      if(scene.keyPressed(key)) return true;
    }
  }
  scrolled(x, y, delta){
    for(const scene of this.subScenes){
      if(scene.scrolled(x-scene.pos.x,y-scene.pos.y, delta)) return true;
    }
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
  mouseDown(x,y){
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
class ScrollableScene extends DimsScene{
  constructor(){
    super();
    this.offs=0;
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
      time:-90
    };
    p5.pop();
  },
  draw: function (){
    if(!hoverData.pos.equals(new Vector(p5.mouseX, p5.mouseY))){
      hoverData.pos=new Vector(-999,-999);
      hoverData.time=-Infinity;
      hoverData.currScene=undefined;
    }
    hoverData.time++;
    if(hoverData.time>0){
      p5.fill(255);
      p5.rect(hoverData.pos.x-hoverData.tWidth/2,hoverData.pos.y-20, hoverData.tWidth, 20, 5);
      p5.fill(0);
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
};