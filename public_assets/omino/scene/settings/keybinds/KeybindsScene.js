import {Scene, DimsScene, OneTimeButtonScene, ScrollableScene, hover} from "/assets/omino/scene/Scene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino/Main.js";
import {Keybinds} from "/assets/omino/Keybinds.js";
import {fill, background} from "/assets/omino/Colors.js";
import KeybindScene from "/assets/omino/scene/settings/keybinds/KeybindScene.js";
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
        background("scenes.settings.darken");
        fill("scenes.settings.buttons.dark.text");
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
        fill("scenes.settings.buttons.light.bg");
        p5.rect(0,0,this.dims.x,this.dims.y);
        fill("scenes.settings.buttons.light.text");
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
        fill("scenes.settings.buttons.dark.text");
        p5.textAlign(p5.LEFT, p5.BOTTOM);
        p5.textSize(this.dims.y*0.7);
        p5.text(this.label, this.dims.y*0.1,this.dims.y);

        super.render();
    }
    reload(){}
}

class KeybindsScene extends ScrollableScene{
    constructor(){
        super();

        this.keybindScenes=[];
        for(const group of keybindGroups){
            this.keybindScenes.push(this.addScene(new Divider(group[0])));
            for(const [name, text] of Object.entries(group[1]))
                this.keybindScenes.push(this.addScene(new KeybindScene(text, Keybinds[name])));
        }
    }
    resized(oldDims, newDims=oldDims){
        this.dims = newDims;
        let unit=Math.min(newDims.x/16,newDims.y/9);

        let currPos = 0;
        for(let i=0;i<this.keybindScenes.length;i++){
            let scene = this.keybindScenes[i];
            if(scene instanceof KeybindScene){
                scene.dims = new Vector(newDims.x, unit);
                scene.pos = new Vector(0, currPos);
            }else if(scene instanceof Divider){
                scene.dims = new Vector(newDims.x, unit*0.7);
                scene.pos = new Vector(unit/2, currPos);
            }

            currPos+=scene.dims.y+unit*0.2;
        }

        super.resized(oldDims, newDims);
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

export default KeybindsScene;
export {
    KeybindsScene,
    OneKeyScene,
    PressKeyScene,
    keybindGroups,
};