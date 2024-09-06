import {OminoPalette, allPalettes, nullPalette} from "/assets/omino/Palettes.js";
import Vector from "/assets/omino/Vector.js";
import {LockedOmino} from "/assets/omino/Omino.js";

const b64Chars="0123456789abcdefghijklmnopqrstuvwxyzABCEDFGHIJKLMNOPQRSTUVWXYZ_-"
function fromB64(value) { // value: string
  return value.split("").map(v=>BigInt(b64Chars.indexOf(v))).reduce((a,c)=>a*64n+c, 0n);
}

function ominoFromStr(data){
  data=data.split("-");
  if(data[0].length==0) return undefined;

  let omino;
  let isNew=false;
  try{
    omino = pageData.palette.get(data[0], Vector.fromStr(data[1]));
    let transform = parseInt(data[2]);
    if(transform>=4){ omino = omino.mirroredH(); transform-=4; }
    while(transform>0){ omino = omino.rotatedCW(); transform--; }
  }catch(e){
    try{
      let positions = data.slice(1).map(d=>Vector.fromStr(d));
      let offs=Vector.fromStr(data[0]);

      [omino, isNew] = pageData.palette.getFromTiles(positions);
      omino.pos = offs;
    }catch(e2){
      return undefined;
    }
  }

  if(isNew){
    let newOmino = omino.clone();
    newOmino.pos = omino.pos;
    pageData.palette.add(newOmino, true);
  }

  return omino;
}

const pageData={
  fullscreen:{
    val:"false",
    transform:d=>d=="true",
    validate:v=>true
  },

  palette:{
    /* (_ OR integer) char indicating the palette you want to use
       - "_": null palette, this is empty
       - number: number indicating the palette (4 for tetronimoes, 5 for pentiminoes, etc)
    */
    val:"5",
    transform:d=>{
      if(d=="_"){
        let toReturn = new OminoPalette([]);

        for(const omino of d.slice(1).split("!").map(ominoFromStr).filter(o=>!!o))
          toReturn.add(omino,true);

        return toReturn;
      }
      let num = parseInt(d)-1;
      if(num>=0&&num<allPalettes.length) return allPalettes[num];
      return nullPalette;
    },
    validate:v=>!!v
  },
  dims:{
    val:"7$7",
    transform:d=>d.split("$").map(v=>parseInt(v)),
    validate:v=>v instanceof Object && !isNaN(v[0]) && !isNaN(v[1]) && v[0]>0 && v[1]>0
  },
  locked:{
    val:"0",
    transform:d=>{
      d=fromB64(d).toString(2).split("").reverse().join("");
      let bools=d.split("").map(v=>v=="1");
      let map=[];
      for(let y=0;y<pageData.dims[1];y++)
        map[y]=bools.slice(y*pageData.dims[0],(y+1)*pageData.dims[0]);

      let toReturn=[];
      for(let y=0;y<map.length;y++){
        for(let x=0;x<map[y].length;x++){
          if(map[y][x]) toReturn.push(new Vector(x,y));
        }
      }

      return toReturn;
    },
    validate:v=>true
  },
  torus:{
    val:"false",
    transform:d=>d=="true",
    validate:v=>true
  },
  
  boardData:{
    /*
      AAAAAA$

      A: B-P-T!VVVVV!...
        B: omino name (just a string)
        P: omino position (X.Y)
        T: transformation data (num 1-8)

        V: vector for constructing custom ominoes (X.Y)
    */
    val:"",
    transform:d=>{//$!-._+*'()
      let toReturn={};

      d=d.split("$");

      toReturn.ominoes=d[0].split("!").map(ominoFromStr).filter(o=>!!o);

      return toReturn;
    },
    validate:v=>true
  },
  pathType:{
    val:"$",
    transform:d=>d.split("$").map(p=>p==""?undefined:Vector.fromStr(p)),
    validate:v=>v.length>=2,
  }
};
const defaults={};
for(const [k,v] of Object.entries(pageData))
  defaults[k] = v.val;
//these are all specified be default, so future proofed (if the defaults change)
delete defaults.dims;
delete defaults.torus;
delete defaults.palette;

for(const [key, val] of new URLSearchParams(window.location.search).entries()){
  if(!pageData[key]) continue;

  pageData[key].newVal=val;
}
for(const key of Object.keys(pageData)){
  let newVal;
  try{
    newVal = pageData[key].transform(pageData[key].newVal||pageData[key].val);
  }catch(e){
    console.log(`error with key ${key}:`);
    console.log(e);
  }
  if(!pageData[key].validate(newVal)){
    newVal = pageData[key].transform(pageData[key].val);
    console.log(`${key} not valid`);
  }

  pageData[key]=newVal;
}

function toLink(board, palette){
  let args = {
    palette:allPalettes.indexOf(palette)+1,
    dims:board.width+"$"+board.height,
    torus:!!board.torusMode,
    boardData:board.ominoes.map(omino=>{
      if(omino instanceof LockedOmino) return undefined;

      for(const [key,data] of Object.entries(palette.data)){
        if(!data.orig||data.custom) continue;

        if(data.omino.equals(omino)){
          let posReset = omino.clone();
          posReset.pos=new Vector(0,0);
          let transform=-1;
          for(let i=0;i<2;i++){
            for(let j=0;j<4;j++){
              if(posReset.equalsExact(data.omino)){
                transform=j+i*4;
                break;
              }
              posReset=i==0?posReset.rotatedCCW():posReset.rotatedCW();
            }
            if(transform!=-1) break;
            posReset=posReset.mirroredH();
          }

          return `${key}-${omino.pos.toURLStr()}-${transform}`;
        }
      }

      return omino.pos.toURLStr()+"-"+omino.vectors.map(v=>v.toURLStr()).join("-");
    }).filter(o=>o).join("!"),
    locked:(_=>{
      let tiles = board.lockedTiles.tiles;
      let numToReturn="";
      for(let y=0;y<board.height;y++){
        if(!tiles[y]){
          numToReturn+="0".repeat(board.width);
          continue;
        }
        for(let x=0;x<board.width;x++){
          numToReturn+=tiles[y][x]?"1":"0";
        }
      }

      numToReturn = BigInt("0b0"+numToReturn.slice(0,numToReturn.lastIndexOf("1")+1).split("").reverse().join(""));
      let strToReturn="";
      while(numToReturn>0n){
        strToReturn+=b64Chars[numToReturn%64n];
        numToReturn/=64n;// this also floors it
      }

      return strToReturn.split("").reverse().join("");
    })(),
    pathType:(board.startPoint===undefined?"":board.startPoint.toURLStr())+"$"+
      (board.endPoint===undefined?"":board.endPoint.toURLStr()),
  };
  for(const [k,v] of Object.entries(args)){
    if(v+""==defaults[k]) delete args[k];
  }

  return window.location.origin+window.location.pathname+
    "?"+Object.entries(args).map(([k,v])=>k+"="+v).join("&");
}

export {
  pageData,
  toLink
};