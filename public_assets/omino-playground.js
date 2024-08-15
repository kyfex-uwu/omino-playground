import Vector from "/assets/omino/Vector.js";
import MainScene from "/assets/omino/scene/MainScene.js";
import {pageData} from "/assets/omino/Options.js";

//--

const data = {
  scene:undefined,
  isFullscreened:false,
  canvElt:undefined
};

let scrollScale=0.5;

new p5(p5=>{
  window.p5=p5;

  p5.setup = function() {
    p5.noStroke();
    data.canvElt = p5.createCanvas(0,0).elt;
    document.getElementById("app").appendChild(data.canvElt);
    data.canvElt.addEventListener("contextmenu", e=>e.preventDefault());
    data.canvElt.addEventListener("scroll", e=>e.preventDefault());

    data.scene = new MainScene();
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
      document.getElementById("lightmode-toggle").style.display="none";
    }else{
      newWidth = data.canvElt.parentElement.clientWidth;
      newHeight = Math.min(data.canvElt.parentElement.clientWidth*3/4, p5.windowHeight*0.96);

      Object.assign(data.canvElt.style,{
        position:"static"
      });
      document.getElementById("lightmode-toggle").style.display="unset";
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
    data.scene.keyPressed(p5.key);
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

    //document.body.style.overflow="hidden";
  }
});

export default data;