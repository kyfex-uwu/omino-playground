import {DimsScene} from "/assets/omino/scene/Scene.js";

//unfinished
class DropdownScene extends DimsScene{
  constructor(options, selected=0){
    super();

    this.options = options;
    this.selected = selected;
    this.open=false;
  }

  render(){
  	if(!this.open){
	  	p5.fill(255);
	  	p5.rect(this.pos.x,this.pos.y,this.dims.x,this.dims.y);
	  	this.drawItem(this.selected, this.pos);
	  }
  }
  drawItem(index, pos){
  	p5.fill(0);
  	p5.textSize(this.dims.height);
  	p5.textAlign(p5.LEFT, p5.TOP);
  	p5.text(this.options[index], pos.x, pos.y);
  }
}

export default DropdownScene;