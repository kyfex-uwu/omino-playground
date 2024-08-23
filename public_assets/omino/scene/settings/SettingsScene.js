import {Scene, DimsScene, OneTimeButtonScene, ScrollableScene, hover} from "/assets/omino/scene/Scene.js";
import Vector from "/assets/omino/Vector.js";
import Data from "/assets/omino-playground.js";
import {Keybinds} from "/assets/omino/Keybinds.js";

const keybindNames = {
  CCW:"Rotate Counterclockwise",
  CW:"Rotate Clockwise",
  MH:"Mirror Horizontally",
  MV:"Mirror Vertically",
  DEL:"Delete Omino",
};

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

class ChangeKeysScene extends Scene{
	constructor(backScreen, keybind){
		super();
		this.backScreen=backScreen;
		this.keybind=keybind;
		this.rawKeys=[];

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

		this.keybindScenes=[];
		for(const [name, keybind] of Object.entries(Keybinds)){
			this.keybindScenes.push(this.addScene(new KeybindScene(keybindNames[name]||name, keybind)));
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

		for(let i=0;i<this.keybindScenes.length;i++){
			let scene = this.keybindScenes[i];
			scene.dims = new Vector(newDims.x-unit, unit);
			scene.pos = new Vector((newDims.x-scene.dims.x)/2, unit*2+i*unit*1.2);
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