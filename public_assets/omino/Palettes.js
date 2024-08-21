import Vector from "/assets/omino/Vector.js";
import {Omino} from "/assets/omino/Omino.js";
import {OminoColors, genHashColor} from "/assets/omino/Omino.js";

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
  add(omino){
    omino=omino.clone();
    omino.pos=new Vector(0,0);
    if(this.data instanceof Array){
      this.data.push({
        omino,
        positions:[...omino.vectors],
        color:omino.color,

        orig:false,
      });
    }else{
      let key=Symbol();
      this.data[ominoIdentifier+" custom omino #"+(globalOminoKey++)]={
        omino,
        positions:[...omino.vectors],
        color:omino.color,

        orig:false,
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
  I:{ color: OminoColors.I, positions: "#/#/#/#/#" },
  L:{ color: OminoColors.L, positions: "#/#/#/##" },
  Y:{ color: OminoColors.Y, positions: " #/##/ #/ #" },
  W:{ color: OminoColors.W, positions: " ##/##/#" },
  V:{ color: OminoColors.V, positions: "  #/  #/###" },
  T:{ color: OminoColors.T, positions: "###/ # / # " },
  P:{ color: OminoColors.P, positions: "##/##/ #" },
  N:{ color: OminoColors.N, positions: " ###/##" },
  F:{ color: OminoColors.F, positions: " ##/##/ #" },
  X:{ color: OminoColors.X, positions: " #/###/ #" },
  Z:{ color: OminoColors.Z, positions: "##/ #/ ##" },
  U:{ color: OminoColors.U, positions: "##/#/##" },
});
const Tetronimoes = new OminoPalette({
  O:{ color: OminoColors.L, positions: "##/##" },
  I:{ color: OminoColors.N, positions: "####" },
  S:{ color: OminoColors.Y, positions: "##/ ##" },
  T:{ color: OminoColors.V, positions: "###/ #" },
  L:{ color: OminoColors.F, positions: "###/#" },
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
  O:{ color: OminoColors.I, positions: "#" }
});
const Dominoes = new OminoPalette({
  I:{ color: OminoColors.P, positions: "##" }
});
const Triminoes = new OminoPalette({
  I:{ color: OminoColors.T, positions: "###" },
  L:{ color: OminoColors.F, positions: "##/#" },
});

const allPalettes = [Monominoes,Dominoes,Triminoes, Tetronimoes, Pentominoes, Hexonimoes];
const nullPalette = new OminoPalette([]);

export {
  OminoPalette,
  allPalettes,
  nullPalette
};