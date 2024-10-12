import {loadColors, loadColorScript, fill, background} from "/assets/omino/Colors.js";
import {Scene, OneTimeButtonScene} from "/assets/omino/scene/Scene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino/Main.js";

const builtins=[
    {
        name:"High Contrast",
        link:"high_contrast.js"
    },
];

class UploadColorfile extends Scene{
    constructor(mainScene) {
        super();
        this.mainScene = mainScene;
        this.mainScene.hasMouseAccess=false;

        this.newTiles = [];
        this.omino = undefined;

        const button = (s, text, mult=0.9)=>{
            fill(s.isIn()?"scenes.settings.buttons.light.bgHover":"scenes.settings.buttons.light.bg");
            p5.rect(0,0,s.dims.x,s.dims.y, s.dims.y*0.3);
            fill("scenes.settings.buttons.light.text");
            p5.textAlign(p5.CENTER,p5.CENTER);
            p5.textSize(s.dims.y*mult);
            p5.text(text, s.dims.x/2,s.dims.y/2);
        };

        this.cancelButton = this.addScene(new OneTimeButtonScene(s => button(s,"Close"), s => {
            this.close();
        }));
        this.resetButton = this.addScene(new OneTimeButtonScene(s => button(s,"Reset"), s => {
            localStorage.removeItem("Colorfile");
            loadColors({});
        }));
        this.builtinButtons = [];
        for(const data of builtins){
            this.builtinButtons.push(this.addScene(new OneTimeButtonScene(s=>button(s,data.name,0.6),
                s=>fetch("/assets/omino/colorfiles/"+data.link).then(s=>this.parseFile(s)),s=>s.name=data.name)));
        }

        this.resized(new Vector(p5.width, p5.height), new Vector(p5.width, p5.height));

        this.dropZone = document.createElement("span");
        Object.assign(this.dropZone.style,{
            "z-index":999,
            position:"absolute",
            top:0,
            left:0,
            width:"100vw",
            height:"100vh",
        });
        document.body.appendChild(this.dropZone);
        this.dropZone.addEventListener("dragover",e=>{
            e.preventDefault();
            this.hasFile=true;
        });
        this.dropZone.addEventListener("dragleave",_=>this.hasFile=false);
        this.dropZone.addEventListener("drop",e=>{
            e.preventDefault();
            this.parseFile(e.dataTransfer.files[0]);
        });
    }
    close(){
        Data.scene = this.mainScene;
        this.dropZone.remove();
        this.mainScene.hasMouseAccess=true;
    }
    render() {
        this.mainScene.render();
        background(this.hasFile?"scenes.settings.hasFile":"scenes.settings.darken");
        fill("scenes.settings.modal.bg");
        p5.textSize(p5.width*0.03);
        let message="Drag and drop the colorfile, or\nclick to open your file explorer";
        let width=p5.textWidth(message);
        p5.rect((p5.width-width*1.1)/2,p5.height/2-p5.textSize()*4,width*1.1,p5.textSize()*3);
        fill("scenes.settings.modal.text");
        p5.textAlign(p5.CENTER,p5.BOTTOM);
        p5.text(message,p5.width/2,p5.height/2-p5.width*0.04);
        super.render();
    }
    mouseUp(x,y){
        if(super.mouseUp(x,y)) return true;

        const filePicker = document.createElement("input");
        filePicker.type="file";
        filePicker.accept=".js";
        filePicker.addEventListener("change",_=>{
            this.parseFile(filePicker.files[0]);
        });
        filePicker.click();
        return true;
    }
    async parseFile(file){
        const script = await file.text();
        localStorage.setItem("Colorfile", script);
        loadColorScript(script, orig=>{
            orig();
            this.close();
        });
        return true;
    }

    resized(oldDims, newDims) {
        this.mainScene.resized(oldDims, newDims);

        this.cancelButton.dims = new Vector(p5.width / 6, p5.width / 6 * 0.3);
        this.cancelButton.pos = new Vector(p5.width / 2 - p5.width / 6 / 2, p5.height*0.5);
        this.resetButton.dims = new Vector(p5.width / 6, p5.width / 6 * 0.3);
        this.resetButton.pos = new Vector(p5.width / 2 - p5.width / 6 / 2, p5.height*0.5+this.cancelButton.dims.y*1.1);

        let width=0;
        const padding = p5.height*0.01;
        p5.textSize(p5.width * 0.035);
        for(const button of this.builtinButtons){
            button.dims=new Vector(p5.textWidth(button.name), p5.width / 6 * 0.3);
            width+=button.dims.x+padding;
        }
        let pos = (p5.width-width)/2;
        for(const button of this.builtinButtons){
            button.pos = new Vector(pos, this.resetButton.getAbsolutePos().y+this.resetButton.dims.y*1.1);
            pos+=button.dims.x+padding;
        }

        super.resized(oldDims, newDims);
    }
}

export default UploadColorfile;