import Vector from "/assets/omino/Vector.js";
import {Omino} from "/assets/omino/Omino.js";
import {genHashColor} from "/assets/omino/Omino.js";

const ominoIdentifier = Math.random();
let globalOminoKey=0;

class OminoPalette{
  constructor(ominoDatas){
    this.data=ominoDatas;

    for(const data of Object.values(this.data)){
      data.positions = data.positions
        .split("/")
        .map((l,y)=>
          l.split("").map((c,x)=>c==" "?undefined:new Vector(x,y))
            .filter(v=>v!=undefined))
        .flat();
      data.omino = new Omino(new Vector(0,0), data.color, data.positions);
      data.orig=true;
    }
  }
  add(omino, orig=false){
    omino=omino.clone();
    omino.pos=new Vector(0,0);
    if(this.data instanceof Array){
      this.data.push({
        omino,
        positions:[...omino.vectors],
        color:omino.color,

        orig,
      });
    }else{
      let key=Symbol();
      this.data[ominoIdentifier+" custom omino #"+(globalOminoKey++)]={
        omino,
        positions:[...omino.vectors],
        color:omino.color,

        orig,
        custom:true
      };
    }
  }
  get(key, pos){
    let toReturn = this.data[key].omino.clone();
    toReturn.pos = pos;
    return toReturn;
  }
  getFromTiles(vectors){
    let testOmino = new Omino(new Vector(0,0), genHashColor(vectors), vectors);
    for(const data of Object.values(this.data)){
      let toReturn = data.omino.clone();
      for(let i=0;i<2;i++){
        for(let j=0;j<4;j++){
          if(toReturn.equalsExact(testOmino)) return [toReturn, false];

          toReturn = toReturn.rotatedCW();
        }
        toReturn=toReturn.mirroredH();
      }
    }

    return [testOmino, true];
  }
}
const Pentominoes = new OminoPalette({
  I:{ color: "I", positions: "#/#/#/#/#" },
  L:{ color: "L", positions: "#/#/#/##" },
  Y:{ color: "Y", positions: " #/##/ #/ #" },
  W:{ color: "W", positions: " ##/##/#" },
  V:{ color: "V", positions: "  #/  #/###" },
  T:{ color: "T", positions: "###/ # / # " },
  P:{ color: "P", positions: "##/##/ #" },
  N:{ color: "N", positions: " ###/##" },
  F:{ color: "F", positions: " ##/##/ #" },
  X:{ color: "X", positions: " #/###/ #" },
  Z:{ color: "Z", positions: "##/ #/ ##" },
  U:{ color: "U", positions: "##/#/##" },
});
const Tetronimoes = new OminoPalette({
  O:{ color: "L", positions: "##/##" },
  I:{ color: "N", positions: "####" },
  S:{ color: "Y", positions: "##/ ##" },
  T:{ color: "V", positions: "###/ #" },
  L:{ color: "F", positions: "###/#" },
});
const Hexonimoes = new OminoPalette([
  "######",
  "#/#####",
  " #/#####",
  "  #/#####",
  "##/ ####",
  "##/####",
  "# #/####",
  "#  #/####",
  " ##/####",
  "#/#/####",
  " #/ #/####",
  "#/####/#",
  "#/####/ #",
  "#/####/  #",
  "#/####/   #",
  " #/####/  #",
  " #/####/ #",
  " #/##/ ###",
  "## #/ ###",
  "###/  ###",
  "###/ ###",
  "###/###",
  "##/ ###/ #",
  "##/###/#",
  "##/ ###/  #",
  "##/ #/ ###",
  "#/##/ ###",
  "##/#/###",
  "##/ #/###",
  "##/ ##/##",
  "#/###/  ##",
  "#/##/###",
  " #/###/##",
  "##/ ##/ ##",
  "##/ ##/  ##",
].map(s=>{return{ positions:s };}));
for(const hexomino of Hexonimoes.data){
  let color = genHashColor(hexomino.positions);
  hexomino.color = color;
  hexomino.omino.color = color;
}
const Monominoes = new OminoPalette({
  O:{ color: "I", positions: "#" }
});
const Dominoes = new OminoPalette({
  I:{ color: "P", positions: "##" }
});
const Triminoes = new OminoPalette({
  I:{ color: "T", positions: "###" },
  L:{ color: "F", positions: "##/#" },
});

const allPalettes = [Monominoes,Dominoes,Triminoes, Tetronimoes, Pentominoes, Hexonimoes];
const nullPalette = new OminoPalette([]);

export {
  OminoPalette,
  allPalettes,
  nullPalette
};