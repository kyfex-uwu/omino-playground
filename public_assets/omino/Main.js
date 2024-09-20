import Vector from "/assets/omino/Vector.js";
import SolveScene from "/assets/omino/scene/SolveScene.js";
import {pageData} from "/assets/omino/Options.js";
import {rawKeys, createKey} from "/assets/omino/Keybinds.js";
import Board from "/assets/omino/Board.js";
import {isKindaMobile} from "/assets/omino/scene/Scene.js";

import events from "/assets/omino/Events.js";

//--

const data = {
  scene:undefined,
  isFullscreened:false,
  canvElt:undefined,

  mainBoard:undefined,
};

let scrollScale=0.5;

new p5(p5=>{
  window.p5=p5;
  p5.disableFriendlyErrors = true;

  let loaded;
  p5.setup = async function() {
    await events.loaded.resolve();

    p5.noStroke();
    data.canvElt = p5.createCanvas(100,100).elt;
    try{document.getElementById("app").appendChild(data.canvElt);}catch(e){}
    data.canvElt.addEventListener("contextmenu", e=>e.preventDefault());
    data.canvElt.addEventListener("scroll", e=>e.preventDefault());
    data.canvElt.addEventListener("touchmove", e=>e.preventDefault());
    data.canvElt.style["z-index"]=999;

    data.mainBoard = new Board(pageData.dims[0], pageData.dims[1], {
      torusMode:pageData.torus,
      ominoes:pageData.boardData.ominoes,
      lockedTiles:pageData.locked,
      calcPath:true,

      startPoint:pageData.pathType[0],
      endPoint:pageData.pathType[1],
    });
    data.scene = new SolveScene();
    data.isFullscreened=pageData.fullscreen;

    loaded=true;
    p5.windowResized();
  }
  p5.windowResized = function(){
    if(!loaded) return;

    let oldWidth=p5.width;
    let oldHeight=p5.height;
    let newWidth;
    let newHeight;
    if(data.isFullscreened){
      if(isKindaMobile) p5.fullscreen(true);
      newWidth=p5.windowWidth;
      newHeight=p5.windowHeight;

      Object.assign(data.canvElt.style,{
        position:"absolute",
        left:0,
        top:0
      });
      try{document.getElementById("lightmode-toggle").style.display="none";}catch(e){}
    }else{
      if(isKindaMobile) p5.fullscreen(false);
      newWidth = data.canvElt.parentElement.clientWidth;
      newHeight = Math.min(data.canvElt.parentElement.clientWidth*3/4, p5.windowHeight*0.96);

      Object.assign(data.canvElt.style,{
        position:"static"
      });
      try{document.getElementById("lightmode-toggle").style.display="unset";}catch(e){}
    }
    p5.resizeCanvas(newWidth, newHeight);
    data.scene.resized(new Vector(oldWidth, oldHeight), new Vector(p5.width, p5.height));
  }

  p5.mousePressed = function(){
    if(!loaded) return;
    data.scene.mouseDown(p5.mouseX,p5.mouseY);
  }
  p5.touchStarted=p5.mousePressed;
  p5.mouseReleased = function(){
    if(!loaded) return;
    data.scene.mouseUp(p5.mouseX,p5.mouseY)
  }
  p5.touchEnded=p5.mouseReleased;
  p5.keyPressed = function(e){
    if(!loaded) return;
    let key=p5.key.length==1?p5.key.toLowerCase():p5.key;
    createKey(key);
    rawKeys[key].press();
    data.scene.keyPressed(key);
  }
  p5.keyReleased = function(){
    if(!loaded) return;
    let key=p5.key.length==1?p5.key.toLowerCase():p5.key;
    createKey(key);
    rawKeys[key].release();
    data.scene.keyReleased(key);
  }
  p5.mouseWheel = function(e){
    if(!loaded) return;
    if(p5.mouseX>=0&&p5.mouseY>=0&&p5.mouseX<p5.width&&p5.mouseY<p5.height){
      if(data.scene.scrolled(p5.mouseX, p5.mouseY, e.delta*scrollScale)){
        window.scroll(0,data.canvElt.getBoundingClientRect().y-document.body.getBoundingClientRect().y-
          (p5.windowHeight-p5.height)/2);
      }
    }
  }

  p5.draw = function() {
    if(!loaded) return;
    
    p5.clear();
    p5.cursor(p5.ARROW);
    p5.textSize(30);
    p5.noStroke();
    p5.noFill();
    data.scene.render();

    //--

    for(const key of Object.values(rawKeys)){
      key.pressed=false;
      key.released=false;
    }
  }
});

export default data;