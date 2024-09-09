import {DimsScene, ButtonScene} from "/assets/omino/scene/Scene.js";
import Vector from "/assets/omino/Vector.js";
import {fill} from "/assets/omino/Colors.js";

class KeyScene extends ButtonScene{
	constructor(pos, dims, key, parent){
		super();

		this.key=key;
		this.orderPos=pos;
		this.orderDims=dims;
	}
	click(){
		switch(this.key){
		case "Backspace":
			this.parent.value=this.parent.value.slice(0,-1);
			break;
		default:
			this.parent.value+=this.key;
			break;
		}
	}
	render(){
		fill(this.isIn()?"scenes.util.keypad.button.bgHover":"scenes.util.keypad.button.bg");
		p5.rect(0,0,this.dims.x,this.dims.y, Math.min(this.dims.x,this.dims.y));
		fill("scenes.util.keypad.button.color");
		p5.textSize(this.dims.y*0.7);
		p5.textAlign(p5.CENTER, p5.CENTER);
		switch(this.key){
		case "Backspace":
			p5.text("⌫", this.dims.x/2,this.dims.y/2);//todo
			break;
		default:
			p5.text(this.key, this.dims.x/2,this.dims.y/2);
			break;
		}
	}
	resize(dims){
		let screenHeight=dims.x*0.3;
		let padding=Math.max(dims.x/(this.orderDims.x+1), dims.y/(this.orderDims.y+1))*0.2;

		let newDims=dims.sub(new Vector(0,screenHeight));
		this.dims=newDims.div(this.orderDims).sub(new Vector(padding, padding));
		this.pos = this.orderPos.mult(newDims.div(this.orderDims)).add(new Vector(padding/2,screenHeight));
	}
}

class MobileKeyboard extends DimsScene{
	constructor(keysArr){
		super();
		this.clipParent=false;
		this.value="";

		let width=keysArr[0].length;
		let height=keysArr.length;
		this.keysArr=keysArr.map((row,y)=>row.map((data,x)=>{
			if(data===undefined) return;
			return this.addScene(new KeyScene(new Vector(x,y), new Vector(width, height), data, this));
		}));
	}
	recalculate(){
		for(const row of this.keysArr){
			for(const button of row){
				if(button) button.resize(this.dims);
			}
		}
	}
	changePosAndDims(pos, dims){
		this.pos=pos;
		this.dims=dims;
		this.recalculate();
	}

	render(){
		let unit=Math.min(this.dims.x,this.dims.y);
		fill("scenes.util.keypad.shadow");
		p5.rect(-unit*0.02, -unit*0.02,this.dims.x+unit*0.04,this.dims.y+unit*0.04,unit*0.04);
		fill("scenes.util.keypad.bg");
		p5.rect(0,0,this.dims.x,this.dims.y,unit*0.03);
		fill("scenes.util.keypad.display");
		p5.rect(this.dims.y*0.05,this.dims.y*0.05, this.dims.x-this.dims.y*0.1,this.dims.x*0.3-this.dims.y*0.1, unit*0.01);
		fill("scenes.util.keypad.text");
		p5.textAlign(p5.CENTER,p5.CENTER);
		p5.text(this.value||"0",this.dims.x/2,this.dims.x*0.15);
		super.render();
	}

	mouseUp(x,y){
		console.log("ae")
		if(super.mouseUp(x,y)) return true;
		if(this.isIn()) return true;
	}
}

export default MobileKeyboard;