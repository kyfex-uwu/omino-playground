import {DimsScene} from "/assets/omino/scene/Scene.js";
import {fill} from "/assets/omino/Colors.js";

class InnerDropdown extends DimsScene{
  constructor(parent){
    this.parent=parent;
  }
  mouseUp(x,y){
    if(!this.isIn()) return false;
    let index=Math.floor(y/this.parent.dims.y*this.parent.options.length);
    this.parent.newValue=this.parent.options[index];

    if(!this.parent.requiresApply) this.parent.apply();
    this.parent.removeMenu();
  }
}
class DropdownScene extends DimsScene{
  constructor(options, {value=options[0],requiresApply=false}={}){
    super();

    this.options = options;
    this.value = value;
    this.newValue=newValue;
    this.open=false;
    this.requiresApply=requiresApply;

    this.listeners=[];
  }
  addListener(listener){ this.listeners.push(listener); return this; }
  apply(){
    this.value=this.newValue;
  }
  render(){
  	if(!this.open){
	  	fill(this.value==this.newValue?"scenes.util.dropdown.bg":"scenes.util.dropdown.bgUnsaved");
	  	p5.rect(this.pos.x,this.pos.y,this.dims.x,this.dims.y);
	  	this.drawItem(new Vector(0,0));
	  }else{
      fill("scenes.util.dropdown.bg");
      p5.rect(this.pos.x,this.pos.y,this.dims.x,this.dims.y*this.options.length);
      for(let i=0;i<this.options.length;i++){
        drawItem(new Vector(0,0), this.options[i]);
      }
    }
  }
  drawItem(pos, item=this.newValue){
  	fill("scenes.util.dropdown.color");
  	p5.textSize(this.dims.y*0.8);
  	p5.textAlign(p5.LEFT, p5.TOP);
  	p5.text(item, pos.x+this.dims.y*0.1, pos.y+this.dims.y*0.1);
  }

  removeMenu(){
    this.open=false;
    if(this.menu) this.menu.remove();
    this.menu=undefined;
  }
  mouseUp(x,y){
    if(super.mouseUp(x,y)) return true;

    this.removeMenu();

    if(this.isIn()){
      focus(this);

      this.open=true;
      this.menu=this.addScene(new InnerDropdown(this));

      return true;
    }

    return super.mouseUp(x,y);
  }
}

export default DropdownScene;