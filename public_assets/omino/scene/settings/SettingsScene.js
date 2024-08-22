import {Scene, DimsScene, OneTimeButtonScene, hover} from "/assets/omino/scene/Scene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino-playground.js";

class SettingsScene extends Scene{
	constructor(mainScene){
		super();

		this.mainScene = mainScene;

		this.backButton = this.addScene(new OneTimeButtonScene(s=>{
			p5.fill(255,s.isIn()?150:100);
        	p5.rect(0,0,s.dims.x,s.dims.y, Math.min(s.dims.x,s.dims.y)*0.1);

        	if(s.isIn()) hover.set("Back", s);
		},s=>{
			Data.scene = this.mainScene;
			this.mainScene.resized(new Vector(p5.width, p5.height),new Vector(p5.width, p5.height));
		}));

		this.resized(new Vector(p5.width, p5.height),new Vector(p5.width, p5.height));
	}
	resized(oldDims, newDims){
		this.backButton.dims = new Vector(100,100);
	}
	render(){
    	p5.background(173, 111, 153);

    	p5.push();
    	p5.fill(0);
    	p5.scale(p5.width/100);
    	p5.textAlign(p5.CENTER, p5.TOP);
    	p5.textSize(5);
    	p5.text("Rotate CCW: Q\n"+
    		"Rotate CW: E\n"+
    		"Mirror Horizontal: A/D\n"+
    		"Mirror Vertical: W/S\n"+
    		"Delete: X\n"+
    		"todo lol but i am so tired",50,5);
    	p5.pop();

    	super.render();
    	hover.draw();
	}
}

export default SettingsScene;