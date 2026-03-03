
function toVec(arg:[Vector]|number[]){
    if (arg[0] instanceof Vector) return arg[0];
    else return new Vector(...arg as number[]);
}
export default class Vector {
    private readonly _pos;
    constructor(...args:number[]) {
        this._pos = args;
    }

    get(i:number) {
        return this._pos[i] || 0;
    }

    set(i:number, v:number) {
        return this._pos[i] = v;
    }

    get x() {
        return this.get(0);
    }

    set x(v) {
        this.set(0, v);
    }

    get y() {
        return this.get(1);
    }

    set y(v) {
        this.set(1, v);
    }

    get z() {
        return this.get(2);
    }

    set z(v) {
        this.set(2, v);
    }

    trimTo(place:number) {
        return new Vector(...this._pos.slice(0, place));
    }

    add(...other:[Vector]|number[]):Vector {
        const resultingVec = toVec(other);

        if (resultingVec._pos.length > this._pos.length) return resultingVec.add(this);
        return new Vector(...this._pos.map((v, i) => v + resultingVec.get(i)));
    }

    sub(...other:[Vector]|number[]):Vector {
        const resultingVec = toVec(other);

        if (resultingVec._pos.length > this._pos.length) return resultingVec.sub(this);
        return new Vector(...this._pos.map((v, i) => v - resultingVec.get(i)));
    }

    mult(...other:[Vector]|number[]):Vector {
        const resultingVec = toVec(other);

        if (resultingVec._pos.length > this._pos.length) return resultingVec.mult(this);
        return new Vector(...this._pos.map((v, i) => v * resultingVec.get(i)));
    }

    div(...other:[Vector]|number[]):Vector {
        const resultingVec = toVec(other);

        if (resultingVec._pos.length > this._pos.length) return resultingVec.div(this);
        return new Vector(...this._pos.map((v, i) => v / resultingVec.get(i)));
    }

    scale(amt:number) {
        return new Vector(...this._pos.map(v => v * amt));
    }

    round() {
        return new Vector(...this._pos.map(v => Math.round(v)));
    }

    floor() {
        return new Vector(...this._pos.map(v => Math.floor(v)));
    }

    clone() {
        return new Vector(...this._pos);
    }

    distTo(...other:[Vector]|number[]):number {
        const resultingVec = toVec(other);

        if (resultingVec._pos.length > this._pos.length) return resultingVec.distTo(this);
        return Math.sqrt(this._pos.map((v, i) => (v - resultingVec.get(i)) ** 2).reduce((a, c) => a + c, 0));
    }

    replace(...other:[Vector]|number[]):Vector{
        this._pos.length=0;
        this._pos.push(...toVec(other)._pos)
        return this;
    }

    left() {
        return new Vector(this.x - 1, this.y);
    }

    right() {
        return new Vector(this.x + 1, this.y);
    }

    up() {
        return new Vector(this.x, this.y - 1);
    }

    down() {
        return new Vector(this.x, this.y + 1);
    }

    equals(...other:[Vector]|number[]):boolean {
        const resultingVec = toVec(other);

        if (resultingVec._pos.length > this._pos.length) return resultingVec.equals(this);

        for (let i = 0; i < this._pos.length; i++)
            if (this.get(i) !== resultingVec.get(i)) return false;
        return true;
    }

    toURLStr() {
        return this._pos.map(v => v.toString(36)).join(".");
    }

    toString() {
        return "Vector(" + this._pos.join(", ") + ")";
    }

    static dirs = "left,right,up,down".split(",");
    static fromStr(str:string) {
        return new Vector(...str.split(".").map(s => parseInt(s, 36)));
    }
}
