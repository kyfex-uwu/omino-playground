class Vector{
  constructor(...args){
    this._pos=args;
  }
  get(i){ return this._pos[i]||0; }
  set(i, v){ return this._pos[i]=v; }
  get x(){ return this.get(0); }
  set x(v){ return this.set(0, v); }
  get y(){ return this.get(1); }
  set y(v){ return this.set(1, v); }
  get z(){ return this.get(2); }
  set z(v){ return this.set(2, v); }
  trimTo(place){ return new Vector(...this._pos.slice(0,place)); }
  
  add(other){
    if(other._pos.length>this._pos.length) return other.add(this);
    return new Vector(...this._pos.map((v,i)=>v+other.get(i)));
  }
  sub(other){
    if(other._pos.length>this._pos.length) return other.sub(this);
    return new Vector(...this._pos.map((v,i)=>v-other.get(i)));
  }
  mult(other){
    if(other._pos.length>this._pos.length) return other.mult(this);
    return new Vector(...this._pos.map((v,i)=>v*other.get(i)));
  }
  div(other){
    if(other._pos.length>this._pos.length) return other.div(this);
    return new Vector(...this._pos.map((v,i)=>v/other.get(i)));
  }
  scale(amt){ return new Vector(...this._pos.map(v=>v*amt)); }

  round(){ return new Vector(...this._pos.map(v=>Math.round(v))); }
  floor(){ return new Vector(...this._pos.map(v=>Math.floor(v))); }
  clone(){ return new Vector(...this._pos); }
  distTo(other){
    if(other._pos.length>this._pos.length) return other.distTo(this);
    return Math.sqrt(this._pos.map((v,i)=>(v-other.get(i))**2).reduce((a,c)=>a+c,0));
  }

  left(){ return new Vector(this.x-1,this.y); }
  right(){ return new Vector(this.x+1,this.y); }
  up(){ return new Vector(this.x,this.y-1); }
  down(){ return new Vector(this.x,this.y+1); }
  
  equals(other){
    if(!(other instanceof Vector)) return false;
    if(other._pos.length>this._pos.length) return other.equals(this);

    for(let i=0;i<this._pos.length;i++)
      if(this.get(i)!==other.get(i)) return false;
    return true;
  }

  toURLStr(){
    return this._pos.map(v=>v.toString(36)).join(".");
  }
}

Vector.dirs="left,right,up,down".split(",");
Vector.fromStr = str=>{
  return new Vector(...str.split(".").map(s=>parseInt(s,36)));
}

export default Vector;