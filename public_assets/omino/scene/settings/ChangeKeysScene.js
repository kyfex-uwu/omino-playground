import {Scene, OneTimeButtonScene} from "/assets/omino/scene/Scene.js";
import Vector from "/assets/omino/Vector.js";
import {keybindGroups, PressKeyScene} from "/assets/omino/scene/settings/SettingsScene.js";
import Data from "/assets/omino-playground.js";

let keybindNames;

class ChangeKeysScene extends Scene{
    constructor(backScreen, keybind){
        if(!keybindNames){
            keybindNames={};
            for(const group of keybindGroups)
                for(const [key,val] of Object.entries(group[1]))
                    keybindNames[key]=val;
        }

        super();
        this.backScreen=backScreen;
        this.keybind=keybind;
        this.rawKeys=[];

        this.backScreen.hasMouseAccess=false;

        const button = (s, text)=>{
            p5.fill(s.isIn()?255:200);
            p5.rect(0,0,s.dims.x,s.dims.y);
            p5.textAlign(p5.CENTER,p5.CENTER);
            p5.fill(0);
            p5.textSize(s.dims.y*0.9);
            p5.text(text, s.dims.x/2,s.dims.y/2);
        };
        this.confButton = this.addScene(new OneTimeButtonScene(s=>{
            button(s, "Confirm");
        },s=>{
            Data.scene = this.backScreen;
            this.backScreen.hasMouseAccess=true;
            for(const scene of this.backScreen.keybindScenes)
                scene.reload();
            this.backScreen.resized(new Vector(p5.width, p5.height));
        }));
        this.addButton = this.addScene(new OneTimeButtonScene(s=>{
            button(s, "Add");
        },s=>{
            Data.scene = new PressKeyScene(this, this.backScreen, this.keybind);
        }));

        this.reload();
    }
    reload(){
        for(const scene of this.rawKeys)
            this.subScenes.splice(this.subScenes.indexOf(scene), 1);

        const button = (s, text)=>{
            p5.fill(s.isIn()?255:200);
            p5.rect(0,0,s.dims.x,s.dims.y);
            p5.textAlign(p5.CENTER,p5.CENTER);
            p5.fill(0);
            p5.textSize(s.dims.y*0.9);
            p5.text(text, s.dims.x/2,s.dims.y/2);
        };

        this.rawKeys=[];
        for(const key of this.keybind.values){
            this.rawKeys.push(this.addScene(new OneTimeButtonScene(s=>{
                button(s, key);
            },s=>{
                this.keybind.remove(key);
                this.reload();
            },s=>{
                s.text=key;
            })));
        }

        this.resized(new Vector(p5.width, p5.height));
    }
    resized(oldDims, newDims=oldDims){
        this.backScreen.resized(oldDims,newDims);

        p5.textSize(newDims.y*0.05);
        let padding = newDims.y*0.006;

        this.confButton.dims = new Vector(p5.textWidth("mConfirm"), p5.textSize()*1.1);
        this.addButton.dims = new Vector(p5.textWidth("mAdd"), p5.textSize()*1.1);

        let w=this.confButton.dims.x+this.addButton.dims.x+padding;
        this.confButton.pos = new Vector((newDims.x+w)/2-this.confButton.dims.x, newDims.y*0.6);
        this.addButton.pos = new Vector((newDims.x-w)/2, newDims.y*0.6);

        w=0;
        for(const key of this.rawKeys){
            key.dims = new Vector(p5.textWidth(key.text+"m"), p5.textSize()*1.1);
            w+=key.dims.x+padding;
        }
        let x=(newDims.x-w)/2;
        for(const key of this.rawKeys){
            key.pos = new Vector(x, newDims.y*0.45);
            x+=key.dims.x+padding;
        }

        super.render(oldDims, newDims);
    }

    render(){
        this.backScreen.render();
        p5.background(0,100);

        p5.textSize(p5.height*0.07);
        p5.fill(80);
        let w=p5.textWidth(keybindNames[this.keybind.name]+"m");
        p5.rect((p5.width-w)/2,p5.height/3-p5.textSize()*1.1, w, p5.textSize()*1.2);
        p5.fill(255);
        p5.textAlign(p5.CENTER,p5.BOTTOM);
        p5.text(keybindNames[this.keybind.name], p5.width/2,p5.height/3);

        super.render();
    }
}

export default ChangeKeysScene;