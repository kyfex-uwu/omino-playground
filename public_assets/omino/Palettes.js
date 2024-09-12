import Vector from "/assets/omino/Vector.js";
import {Omino} from "/assets/omino/Omino.js";
import {genHashColor} from "/assets/omino/Omino.js";

const ominoIdentifier = Math.random();
let globalOminoKey=0;

class OminoPalette{
  constructor(ominoDatas, size=-1){
    this.data=ominoDatas;
    this.size=size;

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
        custom:true,
      });
    }else{
      let key=Symbol();
      this.data[ominoIdentifier+" custom omino #"+(globalOminoKey++)]={
        omino,
        positions:[...omino.vectors],
        color:omino.color,

        orig,
        custom:true,
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
  I:{ color: "ominoColors.I", positions: "#/#/#/#/#" },
  L:{ color: "ominoColors.L", positions: "#/#/#/##" },
  Y:{ color: "ominoColors.Y", positions: " #/##/ #/ #" },
  W:{ color: "ominoColors.W", positions: " ##/##/#" },
  V:{ color: "ominoColors.V", positions: "  #/  #/###" },
  T:{ color: "ominoColors.T", positions: "###/ # / # " },
  P:{ color: "ominoColors.P", positions: "##/##/ #" },
  N:{ color: "ominoColors.N", positions: " ###/##" },
  F:{ color: "ominoColors.F", positions: " ##/##/ #" },
  X:{ color: "ominoColors.X", positions: " #/###/ #" },
  Z:{ color: "ominoColors.Z", positions: "##/ #/ ##" },
  U:{ color: "ominoColors.U", positions: "##/#/##" },
},5);
const Tetronimoes = new OminoPalette({
  O:{ color: "ominoColors.L", positions: "##/##" },
  I:{ color: "ominoColors.N", positions: "####" },
  S:{ color: "ominoColors.Y", positions: "##/ ##" },
  T:{ color: "ominoColors.V", positions: "###/ #" },
  L:{ color: "ominoColors.F", positions: "###/#" },
},4);
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
].map(s=>{return{ positions:s };}),6);
for(const hexomino of Hexonimoes.data){
  let color = genHashColor(hexomino.positions);
  hexomino.color = color;
  hexomino.omino.color = color;
}
const Monominoes = new OminoPalette({
  O:{ color: "ominoColors.I", positions: "#" }
},1);
const Dominoes = new OminoPalette({
  I:{ color: "ominoColors.P", positions: "##" }
},2);
const Triminoes = new OminoPalette({
  I:{ color: "ominoColors.T", positions: "###" },
  L:{ color: "ominoColors.F", positions: "##/#" },
},3);

const allPalettes = [Monominoes,Dominoes,Triminoes, Tetronimoes, Pentominoes, Hexonimoes];
const nullPalette = new OminoPalette([]);

export {
  OminoPalette,
  allPalettes,
  nullPalette
};