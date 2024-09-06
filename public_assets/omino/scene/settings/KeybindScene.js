import {DimsScene} from "/assets/omino/scene/Scene.js";
import {OneKeyScene} from "/assets/omino/scene/settings/SettingsScene.js";
import ChangeKeysScene from "/assets/omino/scene/settings/ChangeKeysScene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino-playground.js";
import {keybindGroups} from "/assets/omino/scene/settings/SettingsScene.js";

class KeybindScene extends DimsScene{
    constructor(text, keybind){
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
        p5.fill(this.isIn()?100:80);
        p5.rect(0,0,this.dims.x,this.dims.y);
        p5.fill(255);
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

    mouseDown(x, y){
        if(!this.isIn()) return false;

        Data.scene = new ChangeKeysScene(Data.scene, this.keybind);

        return true;
    }
}

export default KeybindScene;