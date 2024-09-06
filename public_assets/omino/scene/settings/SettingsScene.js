import {Scene, DimsScene, OneTimeButtonScene, ScrollableScene, hover} from "/assets/omino/scene/Scene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino-playground.js";
import {Keybinds} from "/assets/omino/Keybinds.js";
import {loadColors, loadColorScript, fill, background} from "/assets/omino/Colors.js";
import KeybindScene from "/assets/omino/scene/settings/KeybindScene.js";
import UploadColorfile from "/assets/omino/scene/settings/UploadColorfile.js";

const keybindGroups = [
    ["Solving",{
        CCW:"Rotate Counterclockwise",
        CW:"Rotate Clockwise",
        MH:"Mirror Horizontally",
        MV:"Mirror Vertically",
        DEL:"Delete Omino",
    }],
    ["Building",{
        START:"Place Start Position",
        END:"Place End Position",
        LOCK:"Place Locked Tiles",
    }],
];

class PressKeyScene extends Scene{
    constructor(backScreen, renderScreen, keybind){
        super();
        this.backScreen=backScreen;
        this.renderScreen = renderScreen;
        this.keybind=keybind;
    }
    resized(oldDims, newDims=oldDims){
        this.backScreen.resized(oldDims, newDims);
        super.resized(oldDims, newDims);
    }
    render(){
        this.renderScreen.render();
        p5.background(0,100);
        p5.fill(255);
        p5.textAlign(p5.CENTER,p5.CENTER);
        p5.textSize(p5.height*0.1);
        p5.text("Press a key", p5.width/2,p5.height/2);

        super.render();
    }
    keyPressed(key){
        this.keybind.add(key);
        Data.scene = this.backScreen;
        this.backScreen.reload();
    }
}

class OneKeyScene extends DimsScene{
    constructor(key){
        super();
        this.key=key;
    }
    render(){
        p5.fill(200);
        p5.rect(0,0,this.dims.x,this.dims.y);
        p5.fill(40);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(this.dims.y*0.9);
        p5.text(this.key, this.dims.x/2, this.dims.y/2);
    }
    setDims(height){
        p5.textSize(height*0.9);
        this.dims = new Vector(p5.textWidth(this.key+"m"), height);
    }
}

class Divider extends DimsScene{
    constructor(label){
        super();
        this.label=label;
    }
    render(){
        p5.fill(255);
        p5.textAlign(p5.LEFT, p5.BOTTOM);
        p5.textSize(this.dims.y*0.7);
        p5.text(this.label, this.dims.y*0.1,this.dims.y);

        super.render();
    }
    reload(){}
}

class SettingsScene extends ScrollableScene{
    constructor(mainScene){
        super();

        this.mainScene = mainScene;

        this.backButton = this.addScene(new OneTimeButtonScene(s=>{
            p5.fill(255,s.isIn()?150:100);
            p5.rect(0,0,s.dims.x,s.dims.y, Math.min(s.dims.x,s.dims.y)*0.1);

            p5.push();
            p5.translate(s.dims.x*0.47,s.dims.y*0.55);
            p5.scale(s.dims.x/100);
            p5.fill(255);
            p5.beginShape();

            p5.vertex(-15,3);
            p5.vertex(-35,-12);
            p5.vertex(-15,-27);
            p5.vertex(-15,-17);
            p5.vertex(8,-17);
            p5.bezierVertex(35,-17,42,-9,30,17);
            p5.vertex(25, 27);
            p5.vertex(17, 27);
            p5.bezierVertex(33, -7,27, -6,5, -8);
            p5.vertex(-15,-8);

            p5.endShape();
            p5.pop();

            if(s.isIn()) hover.set("Back", s);
        },s=>{
            Data.scene = this.mainScene;
            this.mainScene.resized(new Vector(p5.width, p5.height),new Vector(p5.width, p5.height));
        }));

        this.bugreport = this.addScene(new OneTimeButtonScene(s=>{
            p5.fill(255,s.isIn()?150:100);
            p5.rect(0,0,s.dims.x,s.dims.y, Math.min(s.dims.x,s.dims.y)*0.1);

            p5.push();
            p5.translate(s.dims.x*0.5,s.dims.y*0.5);
            p5.scale(s.dims.x/100);
            p5.fill(255);

            p5.beginShape();
            p5.vertex(-2,-10);
            p5.vertex(-22,-10);
            p5.bezierVertex(-20,30,-12,40,-2,40);
            p5.endShape();
            p5.beginShape();
            p5.vertex(2,-10);
            p5.vertex(22,-10);
            p5.bezierVertex(20,30,12,40,2,40);
            p5.endShape();

            p5.beginShape();
            p5.vertex(-19,-13);
            p5.bezierVertex(-16,-40, 16, -40, 19,-13);
            p5.endShape();

            p5.strokeWeight(5);
            p5.stroke(255);
            p5.noFill();
            p5.bezier(-10,-20, -12, -30, -13, -36,-20,-40);
            p5.bezier(10,-20, 12, -30, 13, -36,20,-40);

            p5.line(-10,5,-30,0);
            p5.line(-30,0,-35,-15);
            p5.line(10,5,30,0);
            p5.line(30,0,35,-15);

            p5.line(-10,20,-25,28);
            p5.line(-25,28,-30,35);
            p5.line(10,20,25,28);
            p5.line(25,28,30,35);

            p5.line(-10,12, -35, 16);
            p5.line(10,12, 35, 16);

            p5.pop();
            if(s.isIn()) hover.set("Bug Report", s);
        },s=>{
            window.open("https://discord.gg/e5spvrgN9B", '_blank').focus();
        }));

        this.colorfile = this.addScene(new OneTimeButtonScene(s=>{
            p5.fill(255,s.isIn()?150:100);
            p5.rect(0,0,s.dims.x,s.dims.y, Math.min(s.dims.x,s.dims.y)*0.1);

            p5.push();
            p5.translate(s.dims.x*0.5,s.dims.y*0.5);
            p5.scale(s.dims.x/100);
            p5.translate(0,-3);
            p5.fill(255);

            p5.beginShape();
            p5.vertex(-3,-0);
            p5.bezierVertex(-6,13,-10,30,-5,46);
            p5.bezierVertex(-3,48,3,48,5,46);
            p5.bezierVertex(10,30,6,13,3,0);
            p5.bezierVertex(2,-3,-2,-3,-3,0);
            p5.endShape();

            p5.beginShape();
            p5.vertex(0,-5);
            p5.bezierVertex(-5,-5,-9,-9,-9,-14);
            p5.bezierVertex(-6,-19,-4,-21,1,-18);
            p5.bezierVertex(4,-16,4,-15,10,-17);
            p5.bezierVertex(9,-9,5,-5,0,-5);
            p5.endShape();

            p5.translate(0,-1);
            p5.beginShape();
            p5.vertex(-10,-16);
            p5.bezierVertex(-6,-21,-4,-23,1,-20);
            p5.bezierVertex(4,-18,4,-17,10,-19);
            p5.bezierVertex(9,-30,0,-40,-3,-40);
            p5.bezierVertex(1,-26,-9,-26,-10,-16);
            p5.endShape();

            p5.pop();
            if(s.isIn()) hover.set("Use Colorfile", s);
        },s=>{
            Data.scene = new UploadColorfile(this);
        }));

        this.keybindScenes=[];
        for(const group of keybindGroups){
            this.keybindScenes.push(this.addScene(new Divider(group[0])));
            for(const [name, text] of Object.entries(group[1]))
                this.keybindScenes.push(this.addScene(new KeybindScene(text, Keybinds[name])));
        }

        this.resized(new Vector(p5.width, p5.height),new Vector(p5.width, p5.height));
    }
    resized(oldDims, newDims=oldDims){
        this.dims = newDims;
        let unit=Math.min(newDims.x/16,newDims.y/9);

        this.backButton.pos = new Vector(unit*0.2, unit*0.2);
        this.backButton.dims = new Vector(unit*1.2, unit*1.2);
        this.bugreport.pos = new Vector(unit*1.5, unit*0.2);
        this.bugreport.dims = new Vector(unit*1.2, unit*1.2);
        this.colorfile.pos = new Vector(this.dims.x-unit*1.4, unit*0.2);
        this.colorfile.dims = new Vector(unit*1.2, unit*1.2);

        let currPos = unit*2;
        for(let i=0;i<this.keybindScenes.length;i++){
            let scene = this.keybindScenes[i];
            if(scene instanceof KeybindScene)
                scene.dims = new Vector(newDims.x-unit, unit);
            else if(scene instanceof Divider)
                scene.dims = new Vector(newDims.x-unit*2, unit*0.7);
            scene.pos = new Vector((newDims.x-scene.dims.x)/2, currPos);

            currPos+=scene.dims.y+unit*0.2;
        }

        super.resized(oldDims, newDims);
    }
    render(){
        p5.background(50);

        super.render();
        hover.draw();
    }

  scrolled(x,y,delta){
    delta*=this.dims.x*0.0007;

    let oldOffs=this.offs;
    if(!super.scrolled(x,y,delta)) return false;
    if(this.offs<0){
      for(const child of this.subScenes) child.pos.y+=oldOffs;
      this.offs=0;
      return true;
    }

    for(const child of this.subScenes) child.pos.y-=delta;

    return true;
  }
}

export default SettingsScene;
export {
    SettingsScene,
    OneKeyScene,
    PressKeyScene,
    keybindGroups,
};