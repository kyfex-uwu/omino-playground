import {Scene, OneTimeButtonScene, DimsScene, hover} from "/assets/omino/scene/Scene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino/Main.js";
import {fill, background, stroke} from "/assets/omino/Colors.js";
import UploadColorfile from "/assets/omino/scene/settings/UploadColorfile.js";

import KeybindsScene from "/assets/omino/scene/settings/keybinds/KeybindsScene.js";
import ChangelogScene from "/assets/omino/scene/settings/ChangelogScene.js";

class ClippedContainer extends DimsScene{
    constructor(scene){
        super();
        this.addScene(scene);
        this.inner=scene;
    }
    render(){
        p5.push();
        p5.fill(0);
        p5.beginClip();
        p5.rect(0,0,this.dims.x,this.dims.y);
        p5.endClip();
        super.render();
        p5.pop();
    }
    resized(oldDims,newDims=oldDims){
        this.dims=newDims;
        let unit=Math.min(newDims.x/16,newDims.y/9);

        this.pos=new Vector(unit/2, unit*2.2);
        this.dims=newDims.sub(new Vector(unit,this.pos.y));

        this.inner.resized(this.dims,this.dims);
    }
}

class SettingsContainerScene extends Scene{
    constructor(mainScene){
        super();

        this.mainScene = mainScene;

        const buttonFrame = s=>{
            fill(s.isIn()?"scenes.settings.buttons.dark.bgHover":"scenes.settings.buttons.dark.bg");
            p5.rect(0,0,s.dims.x,s.dims.y, Math.min(s.dims.x,s.dims.y)*0.1);
            fill("scenes.settings.buttons.dark.text");
        }

        this.backButton = this.addScene(new OneTimeButtonScene(s=>{
            buttonFrame(s);

            p5.push();
            p5.translate(s.dims.x*0.47,s.dims.y*0.55);
            p5.scale(s.dims.x/100);
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
            buttonFrame(s);

            p5.push();
            p5.translate(s.dims.x*0.5,s.dims.y*0.5);
            p5.scale(s.dims.x/100);

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
            stroke("scenes.settings.buttons.dark.text");
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
            buttonFrame(s);

            p5.push();
            p5.translate(s.dims.x*0.5,s.dims.y*0.5);
            p5.scale(s.dims.x/100);
            p5.translate(0,-3);

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

        this.tabButtons=[
            {name:"Keybinds", scene:new KeybindsScene()},
            {name:"Changelog", scene:new ChangelogScene()},
        ].map(data=>{
            data.scene = new ClippedContainer(data.scene);

            return this.addScene(new OneTimeButtonScene(s=>{
                fill(s.isIn()?"scenes.settings.buttons.dark.bgHover":"scenes.settings.buttons.dark.bg");
                p5.rect(0,0,s.dims.x,s.dims.y);
                fill("scenes.settings.buttons.dark.text");
                p5.textSize(s.dims.y*0.8);
                p5.textAlign(p5.CENTER,p5.CENTER);
                p5.text(data.name,s.dims.x/2,s.dims.y/2);
            },s=>{
                this.activeTab.scene.remove();
                this.activeTab=data;
                this.addScene(this.activeTab.scene);
                if(this.dims) this.activeTab.scene.resized(this.dims,this.dims);
            }));
        });
        this.activeTab={scene:{remove:_=>0}};
        this.tabButtons[0].click();

        this.bgOffs=0;

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

        let unit2=(newDims.x-newDims.y*0.01)/this.tabButtons.length;
        for(let i=0;i<this.tabButtons.length;i++){
            let tabButton=this.tabButtons[i];
            tabButton.pos = new Vector(newDims.y*0.01+unit2*i, unit*1.6);
            tabButton.dims = new Vector(unit2-newDims.y*0.01, unit*0.5);
        }

        super.resized(oldDims, newDims);
    }
    render(){
        background("scenes.settings.bg.0");
        fill("scenes.settings.bg.1");
        this.bgOffs=(this.bgOffs+0.2)%100;
        p5.push();
        p5.translate(this.bgOffs-50,this.bgOffs);
        for(let y=-1;y<p5.height/100;y++){
            for(let x=-1;x<p5.width/100;x++){
                if((x+1)%2==(y+1)%2) continue;
                p5.push();
                p5.translate(x*100,y*100);
                p5.beginShape();
                p5.vertex(50,10);
                p5.vertex(90,50);
                p5.vertex(50,90);
                p5.vertex(10,50);
                p5.endShape();
                p5.pop();
            }
        }
        p5.pop();

        super.render();
        hover.draw();
    }
}

export default SettingsContainerScene;