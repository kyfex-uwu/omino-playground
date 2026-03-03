class RawKey {
    private _down=false;
    private _released=false;
    private _pressed=false;

    get down(){ return this._down; }
    get released(){ return this._released; }
    get pressed(){ return this._pressed; }

    constructor() {
        this._down = false;
        this._released = false;
        this._pressed = false;
    }

    press() {
        this._down = true;
        this._released = true;
    }

    release() {
        this._down = false;
        this._pressed = true;
    }
    reset() {
        this._pressed=false;
        this._released=false;
    }
}

const rawKeys:{[key:string]:RawKey} = {};

function createKey(key:string) {
    if (rawKeys[key]) return;
    rawKeys[key] = new RawKey();
}

class Keybind {
    public name:string="";

    private readonly values:Set<string>;
    private readonly defaultVal:string[];
    constructor(dfault:string[]) {
        this.values = new Set(dfault);
        this.defaultVal = dfault;

        for(const key of dfault) createKey(key);
    }

    isDown() {
        for (const value of this.values) {
            if (rawKeys[value]?.down ?? false) return true;
        }
        return false;
    }

    isReleased() {
        for (const value of this.values) {
            if (rawKeys[value]?.released ?? false) return true;
        }
        return false;
    }

    isPressed() {
        for (const value of this.values) {
            if (rawKeys[value]?.pressed ?? false) return true;
        }
        return false;
    }

    add(key:string) {
        if (this.values.has(key)) return;
        this.values.add(key);
        update();
    }

    remove(key:string) {
        if (!this.values.has(key)) return;
        this.values.delete(key);
        update();
    }

    has(key:string){
        return this.values.has(key);
    }
    set(keys:string[]){
        this.values.clear();
        for(const key of keys)
            this.values.add(key);
    }

    toJSON() {
        return `Keybind{{${[...this.values.values().map(v => JSON.stringify(v))].join(",")}}}`;
    }
}

function update() {
    localStorage.setItem("Keybinds", JSON.stringify(Keybinds));
}

let userKeybinds:{[key:string]:string[]} = {};
try {
    userKeybinds = JSON.parse(localStorage.getItem("Keybinds")??"", (key, val) => {
        if (typeof val == "string" && val.startsWith("Keybind{{") && val.endsWith("}}")) {
            return JSON.parse(`[${val.slice("Keybind{{".length, -2)}]`);
        }
        return val;
    });
} catch (e) {
}

const Keybinds = {
    CCW: new Keybind(["q"]),
    CW: new Keybind(["e"]),
    MH: new Keybind(["a", "d"]),
    MV: new Keybind(["w", "s"]),
    DEL: new Keybind(["x"]),

    START: new Keybind(["q"]),
    END: new Keybind(["w"]),
    LOCK: new Keybind(["a"]),
};
for (const k in Keybinds)
    Keybinds[k as keyof typeof Keybinds].name = k;

function getKeybinds(key:string) {
    let toReturn = [];

    for (const [name, val] of Object.entries(Keybinds)) {
        if (val.has(key)) toReturn.push(name);
    }

    return toReturn;
}

try {
    for (const key in userKeybinds) {
        Keybinds[key as keyof typeof Keybinds].set(userKeybinds[key]!);
    }
} catch (e) {
}

update();

export {
    Keybinds,
    getKeybinds,
    rawKeys,
    createKey
};
