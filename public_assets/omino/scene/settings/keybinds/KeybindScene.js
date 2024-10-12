import {DimsScene} from "/assets/omino/scene/Scene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino/Main.js";
import {fill} from "/assets/omino/Colors.js";
import ChangeKeysScene from "/assets/omino/scene/settings/keybinds/ChangeKeysScene.js";
import {OneKeyScene, keybindGroups} from "/assets/omino/scene/settings/keybinds/KeybindsScene.js";

class KeybindScene extends DimsScene{
    constructor(text, keybind, keybindHolder){
        super();
        this.text=text;
        this.keybind=keybind;

        this.reload();
    }
    reload(){
        this.subScenes=[];
        for(const key of this.keybind.values)
            this.addScene(new OneKeyScene(key));
    }
    render(){
        fill(this.isIn()?"scenes.settings.buttons.dark.bgHover":"scenes.settings.buttons.dark.bg");
        p5.rect(0,0,this.dims.x,this.dims.y);
        fill("scenes.settings.buttons.dark.text");
        p5.textAlign(p5.LEFT, p5.CENTER);
        p5.textSize(this.dims.y*0.5);
        p5.text(this.text, this.dims.y*0.1,this.dims.y/2);

        super.render();
    }
    resized(oldDims, newDims){
        let x = this.dims.x-this.dims.y*0.1;
        for(const scene of this.subScenes){
            scene.setDims(this.dims.y*0.7);
            scene.pos = new Vector(x-scene.dims.x,this.dims.y*0.3/2);

            x-=scene.dims.x+this.dims.y*0.1;
        }
    }

    mouseUp(x, y){
        if(!this.isIn()) return false;

        Data.scene = new ChangeKeysScene(Data.scene, this);

        return true;
    }
}

export default KeybindScene;