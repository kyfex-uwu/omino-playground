import {OminoPalette} from "/assets/omino/Palettes.js";
import Vector from "/assets/omino/Vector.js";
import {allPalettes, nullPalette} from "/assets/omino/Palettes.js";

function strToVector(str){
  let pos = str.split(".").map(s=>parseInt(s,36));
  if(isNaN(pos[0])||isNaN(pos[1])) throw "Invalid vector";
  return new Vector(pos[0], pos[1]);
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
      if(d=="_") return nullPalette;
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

      toReturn.ominoes=d[0].split("!").map(data=>{
        data=data.split("-");
        if(data[0].length==0) return undefined;

        let omino;
        let isNew=false;
        try{
          omino = pageData.palette.get(data[0], strToVector(data[1]));
          let transform = parseInt(data[2]);
          if(transform>=4){ omino = omino.mirroredH(); transform-=4; }
          while(transform>0){ omino = omino.rotatedCW(); transform--; }
        }catch(e){
          try{
            let positions = data.slice(1).map(d=>strToVector(d));
            let offs=strToVector(data[0]);

            [omino, isNew] = pageData.palette.getFromTiles(positions);
            omino.pos = offs;
          }catch(e2){
            return undefined;
          }
        }

        if(isNew){
          let newOmino = omino.clone();
          newOmino.pos = omino.pos;
          pageData.palette.add(newOmino);
        }

        return omino;
      }).filter(o=>!!o);

      return toReturn;
    },
    validate:v=>true
  }
};
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

export {
  pageData
};