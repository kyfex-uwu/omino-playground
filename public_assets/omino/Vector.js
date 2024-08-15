class Vector{
  constructor(x,y){
    this.x=x;
    this.y=y;
  }
  
  add(other){ return new Vector(this.x+other.x,this.y+other.y); }
  sub(other){ return new Vector(this.x-other.x,this.y-other.y); }
  scale(amt){ return new Vector(this.x*amt,this.y*amt); }
  round(){ return new Vector(Math.round(this.x),Math.round(this.y)); }

  left(){ return new Vector(this.x-1,this.y); }
  right(){ return new Vector(this.x+1,this.y); }
  up(){ return new Vector(this.x,this.y-1); }
  down(){ return new Vector(this.x,this.y+1); }
  
  equals(other){ return this.x==other.x&&this.y==other.y; }

  toURLStr(){
    return this.x.toString(36)+"."+this.y.toString(36);
  }
}

Vector.dirs="left,right,up,down".split(",");

export default Vector;