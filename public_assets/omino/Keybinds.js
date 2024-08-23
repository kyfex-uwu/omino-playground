class RawKey{
	constructor(){
		this.down=false;
		this.released=false;
		this.pressed=false;
	}

	press(){
		this.down=true;
		this.released=true;
	}
	release(){
		this.down=false;
		this.pressed=true;
	}
}
const rawKeys = {};
function createKey(key){
	if(rawKeys[key]) return;
	rawKeys[key]=new RawKey();
}

class Keybind{
	constructor(dfault){
		this.values=dfault;
		this.defaultVal=dfault;
	}
	isDown(){
		for(const value of this.values){
			if(rawKeys[value].down) return true;
		}
		return false;
	}
	isReleased(){
		for(const value of this.values){
			if(rawKeys[value].released) return true;
		}
		return false;
	}
	isPressed(){
		for(const value of this.values){
			if(rawKeys[value].pressed) return true;
		}
		return false;
	}
	add(key){
		if(this.values.includes(key)) return;
		this.values.push(key);
		update();
	}
	remove(key){
		if(!this.values.includes(key)) return;
		this.values.splice(this.values.indexOf(key), 1);
		update();
	}

	toJSON(){
		return `Keybind{{${this.values.map(v=>JSON.stringify(v)).join(",")}}}`;
	}
}
function update(){
	localStorage.setItem("Keybinds", JSON.stringify(Keybinds));
}

let userKeybinds={};
try{
	userKeybinds = JSON.parse(localStorage.getItem("Keybinds"), (key, val)=>{
		if(typeof val == "string" && val.startsWith("Keybind{{")&&val.endsWith("}}")){
			return JSON.parse(`[${val.slice("Keybind{{".length, -2)}]`);
		}
		return val;
	});
}catch(e){}

const Keybinds = {
  CCW:new Keybind(["q"]),
  CW:new Keybind(["e"]),
  MH:new Keybind(["a","d"]),
  MV:new Keybind(["w","s"]),
  DEL:new Keybind(["x"]),
};
for(const [k,v] of Object.entries(Keybinds))
	v.name=k;

function getKeybinds(key){
	let toReturn=[];

	for(const [name, val] of Object.entries(Keybinds)){
		if(val.values.includes(key)) toReturn.push(name);
	}

	return toReturn;
}
for(const [key, val] of Object.entries(userKeybinds)){
	Keybinds[key].values=val;
}

update();

export {
	Keybinds,
	getKeybinds,
	rawKeys,
	createKey
};