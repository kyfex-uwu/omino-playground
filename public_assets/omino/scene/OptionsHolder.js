import {ScrollableScene, DimsScene,
  focus, hover, isKindaMobile} from "/assets/omino/scene/Scene.js";

class OptionsElement extends DimsScene{
  constructor(init, resize, render=_=>0){
    super();
    init(this);
    this.renderFunc=render;
    this.resizeFunc=resize;
  }
  optionsResize(x, y, width, scale){
    this.resizeFunc(this, x,y,width,scale);
  }
  render(){
    this.renderFunc(this);
    super.render();
  }
}

class OptionsHolder extends ScrollableScene{
  constructor(){ super({min:0}); }
  resized(oldDims, newDims=oldDims){
    this.scrollLimits.max=Math.max.apply(null, this.subScenes.map(s=>s.pos.y+(s.dims?s.dims.y:0)))
      -this.dims.y*0.9+this.offs;

    return super.resized(oldDims, newDims);
  }
}

export {
  OptionsElement,
  OptionsHolder
}