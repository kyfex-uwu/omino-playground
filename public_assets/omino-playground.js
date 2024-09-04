import {loadColors} from "/assets/omino/Colors.js";
window.exportMod=mod=>{
  loadColors(mod);
};
import("/assets/omino/colorfiles/default.js").then(_=>{
  let script=localStorage.getItem("Colorfile");
  if(!script) return;
  
  const tempScript = document.createElement("script");
  document.body.appendChild(tempScript);
  tempScript.type="module";
  tempScript.innerHTML=script;
});

//--

import Vector from "/assets/omino/Vector.js";
import SolveScene from "/assets/omino/scene/SolveScene.js";
import {pageData} from "/assets/omino/Options.js";
import {rawKeys, createKey} from "/assets/omino/Keybinds.js";
import Board from "/assets/omino/Board.js";

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

  p5.setup = function() {
    p5.noStroke();
    data.canvElt = p5.createCanvas(100,100).elt;
    try{document.getElementById("app").appendChild(data.canvElt);}catch(e){}
    data.canvElt.addEventListener("contextmenu", e=>e.preventDefault());
    data.canvElt.addEventListener("scroll", e=>e.preventDefault());
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
    p5.windowResized();
  }
  p5.windowResized = function(){
    if(!data.canvElt) return;

    let oldWidth=p5.width;
    let oldHeight=p5.height;
    let newWidth;
    let newHeight;
    if(data.isFullscreened){
      newWidth=p5.windowWidth;
      newHeight=p5.windowHeight;

      Object.assign(data.canvElt.style,{
        position:"absolute",
        left:0,
        top:0
      });
      try{document.getElementById("lightmode-toggle").style.display="none";}catch(e){}
    }else{
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
    data.scene.mouseDown(p5.mouseX,p5.mouseY);
  }
  p5.mouseReleased = function(){
    data.scene.mouseUp(p5.mouseX,p5.mouseY);
  }
  p5.keyPressed = function(){
    createKey(p5.key);
    rawKeys[p5.key].press();
    data.scene.keyPressed(p5.key);
  }
  p5.keyReleased = function(){
    createKey(p5.key);
    rawKeys[p5.key].release();
  }
  p5.mouseWheel = function(e){
    if(p5.mouseX>=0&&p5.mouseY>=0&&p5.mouseX<p5.width&&p5.mouseY<p5.height){
      if(data.scene.scrolled(p5.mouseX, p5.mouseY, e.delta*scrollScale)){
        window.scroll(0,data.canvElt.getBoundingClientRect().y-document.body.getBoundingClientRect().y-
          (p5.windowHeight-p5.height)/2)
      }
    }
  }

  p5.draw = function() {
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