import CounterScene from "/assets/omino/scene/utils/CounterScene.js";
import {DimsScene} from "/assets/omino/scene/Scene.js";
import Vector from "/assets/omino/Vector.js";
import {fill} from "/assets/omino/Colors.js";

const functions = {
    counter: data => new CounterScene(data),
};

class LabeledScene extends DimsScene{
    constructor(scene, label) {
        super();
        this.addScene(this.scene = scene);
        this.label = label;
    }

    resized(oldDims, newDims=oldDims) {
        this.dims = new Vector(newDims.x, newDims.x*0.12);
        const padding=this.dims.y*0.1;
        p5.textSize(this.dims.y*0.7);
        this.scene.pos = new Vector(padding+ p5.textWidth(this.label+"n"), padding);
        this.scene.dims = new Vector(this.dims.x-this.scene.pos.x-padding, this.dims.y-padding*2);
        super.resized(oldDims, newDims);
    }

    render() {
        fill("scenes.sidebar.text");
        p5.textSize(this.dims.y*0.7);
        p5.textAlign(p5.LEFT, p5.CENTER);
        p5.text(this.label, this.dims.y*0.1,this.dims.y*0.5);
        super.render();
    }

    submit(){
        this.scene.submit();
    }
}

export default setting => {
    const settingScene = (functions[setting.type] || (_=>{}) )(setting.data);
    if(settingScene)
        return new LabeledScene(settingScene, setting.label);
}
