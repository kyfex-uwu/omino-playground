import {
    ApplyData,
    type BoardRenderEnv,
    EditableElement,
    type NodeGroup,
    type Pass,
    type RenderPass,
    SelectableElement
} from "omino/pathfinding/elements/Element.js";
import Node from "omino/pathfinding/Node.js";
import Vector from "omino/Vector.js";
import {type ColorPath, fill, stroke} from "omino/Colors.js";
import type {SettingData} from "omino/scene/SettingsParser.js";
import {type ConnTree} from "omino/pathfinding/elements/OminoEl.js";
import PortalEl from "omino/pathfinding/elements/PortalEl.js";
import data from "omino/Global.js";
import CreatingOminoScene from "omino/scene/CreatingOminoScene.js";
import MainScene from "omino/scene/MainScene.js";
import HexOrientation, {hexOrienDirs, type HexOrienVal} from "omino/pathfinding/orientation/HexOrientation.js";
import HexOminoEl from "omino/pathfinding/elements/HexOminoEl.js";
import BoardElement from "omino/pathfinding/boards/BoardElement.js";
import Scene, {DimsScene, OneTimeButtonScene} from "omino/scene/Scene.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

class Inner extends DimsScene<any>{
    private tree:ConnTree<any, HexOrienVal>={};
    private submit: OneTimeButtonScene<Scene<any>>;

    constructor(close: (self:Inner) => void) {
        super();

        this.submit = this.addScene(new OneTimeButtonScene((self, env)=>{
            fill("scenes.createOmino.submit"+(self.isIn()?"Hover":""), env);
            env.sRect(0,0,self.dims.x, self.dims.y, self.dims.x*0.1);
            fill("scenes.createOmino.text", env);
            env.spFillText("Create", self.dims.x/2, self.dims.y/2, {align:"center", baseline:"middle"});
        },()=>close(this)));
    }

    resized(oldDims: Vector, newDims: Vector = oldDims) {
        this.submit.dims.replace(this.dims.x*0.25, this.dims.x*0.07);
        this.submit.pos.replace(this.dims.x/2-this.submit.dims.x/2, this.dims.y-this.submit.dims.y);
        super.resized(oldDims, newDims);
    }

    render(env: AnyEnhancedEnv) {
        fill("scenes.createOmino.modal", env);
        env.sRect(0,0,this.dims.x, this.dims.y, this.dims.y*0.05);
        stroke("scenes.createOmino.outline", env);
        env.setFontSize(this.dims.y*0.08);
        env.lineWidth=Math.min(this.dims.y*0.02);
        env.stroke();

        fill("scenes.createOmino.piece", env);
        env.lineWidth = this.dims.x*0.06;
        env.save();
        env.translate(this.dims.x*0.5, this.dims.y*0.5);
        this.drawThis(this.tree, env);
        env.restore();

        super.render(env);
    }

    drawThis(tree:ConnTree<any, HexOrienVal>, env:AnyEnhancedEnv){
        env.beginPath();
        env.ellipse(0, 0, this.dims.x*0.05, this.dims.x*0.05, 0, 0, Math.PI*2);
        env.fill();
        for(const sub in hexOrienDirs){
            env.save();
            const translateDir = hexOrienDirs[sub as HexOrienVal].clone().scale(this.dims.x*0.1);
            if(tree[sub as HexOrienVal] !== undefined) {
                env.singleLine(0, 0, translateDir.x, translateDir.y);
                env.translate(translateDir.x, translateDir.y);
                this.drawThis(tree[sub as HexOrienVal]!, env);
            }else{
                env.translate(translateDir.x, translateDir.y);
                env.fillRect(-this.dims.x*0.005, -this.dims.x*0.03, this.dims.x*0.01, this.dims.x*0.06);
                env.fillRect(-this.dims.x*0.03, -this.dims.x*0.005, this.dims.x*0.06, this.dims.x*0.01);
            }
            env.restore();
        }
    }

    mouseDown(x: number, y: number, button: number): boolean {
        if(super.mouseDown(x, y, button)) return true;

        const mousePos = new Vector(x,y).sub(this.dims.scale(0.5)).scale(10/this.dims.x);


        const branchesToCheck:[ConnTree<any, HexOrienVal>, Vector][]=[[this.tree, new Vector(0,0)]];
        const maybes:[ConnTree<any, HexOrienVal>, HexOrienVal][] = [];
        while(branchesToCheck.length>0){
            for(const child in hexOrienDirs){
                const newPos = branchesToCheck[0]![1].add(hexOrienDirs[child as HexOrienVal]);
                if(newPos.distTo(mousePos)<0.4){
                    maybes.push([branchesToCheck[0]![0], child as HexOrienVal])

                    branchesToCheck.length=0;
                    break;
                }

                if(branchesToCheck[0]![0][child as HexOrienVal] !== undefined)
                    branchesToCheck.push([
                        branchesToCheck[0]![0][child as HexOrienVal]!,
                        newPos
                    ]);
            }

            branchesToCheck.shift();
        }

        if(maybes[0]!==undefined) {
            let changed = false;
            for (const maybe of maybes) {
                if (maybe[0][maybe[1]]) {
                    delete maybe[0][maybe[1]];
                    changed = true;
                    break;
                }
            }
            if (!changed) {
                maybes[0][0][maybes[0][1]] = {};
            }
        }

        return this.isIn();
    }

    getOmino(){
        return new HexOminoEl(this.tree, "", HexOrientation.default);
    }
}

export default class HexBoardEl extends BoardElement{
    private extrusions:[number,number,number,number,number,number];
    private currId=0;
    private board:number[][]=[];
    private renderScale=1;
    private portalsEnabled=false;
    constructor(extrusions: [number, number, number, number, number, number]) {
        let applyPasses:Pass[]=[];
        let renderPasses:RenderPass[]=[];
        super(applyPasses,renderPasses);
        this.extrusions=extrusions;

        this.setBounds(extrusions);

        applyPasses.push(
            {order:-1000, func:() => {//generate nodes
                const toReturn = new ApplyData();

                const center = new Node(HexOrientation.default, {pos:new Vector(0,0)}, "0");
                toReturn.add(center);

                const realExtrusions = this.extrusions.map((v,i)=>
                    Math.min(v, this.extrusions[(i+5)%6]!+this.extrusions[(i+1)%6]!));

                const triangles:Node<HexOrienVal, {pos:Vector}>[][][] = [];

                for(let which=0;which<6;which++){
                    let spoke: Node<HexOrienVal, {
                        pos: Vector
                    }>[]=[];
                    let prev=center;

                    //create spoke
                    for(let i=0;i<realExtrusions[which]!;i++){
                        let next = new Node(HexOrientation.default,
                            {pos:prev.custom.pos.add(hexOrienDirs[HexOrientation.clockwise[which]!.direc])},
                            `${which},${i}`)
                        next.getView(HexOrientation.default).connectNode(
                            HexOrientation.clockwise[(which+3)%6]!.direc,
                            HexOrientation.clockwise[which]!.direc,
                            prev
                        )
                        toReturn.add(next);

                        spoke.push(next);
                        prev=next;
                    }

                    //populate spoke
                    const extrusions:Node<HexOrienVal, {pos:Vector}>[][] = [];
                    triangles.push(extrusions);
                    for(let i=0;i<spoke.length;i++){
                        const extrusion = [spoke[i]!];
                        extrusions.push(extrusion);
                        let prev=spoke[i]!;
                        for(let j=0;j<i;j++){
                            const next = new Node(HexOrientation.default,
                                {pos:prev.custom.pos.add(hexOrienDirs[HexOrientation.clockwise[(which+2)%6]!.direc])},
                                `${which},,${i},${j}`);

                            next.getView(HexOrientation.default).connectNode(
                                HexOrientation.clockwise[(which+5)%6]!.direc,
                                HexOrientation.clockwise[(which+2)%6]!.direc,
                                prev
                            )

                            toReturn.add(next);

                            extrusion.push(next);
                            prev=next;
                        }
                    }

                    //connect extrusions
                    for(let i=1;i<extrusions.length;i++){
                        for(let j=0;j<extrusions[i]!.length;j++){
                            const view = extrusions[i]![j]!.getView(HexOrientation.default);
                            if(j !== extrusions[i]!.length-1)
                                view.connectNode(
                                    HexOrientation.clockwise[(which+3)%6]!.direc,
                                    HexOrientation.clockwise[which]!.direc,
                                    extrusions[i-1]![j]!
                                );
                            if(j !== 0)
                                view.connectNode(
                                    HexOrientation.clockwise[(which+4)%6]!.direc,
                                    HexOrientation.clockwise[(which+1)%6]!.direc,
                                    extrusions[i-1]![j-1]!
                                )
                        }
                    }
                }

                for(let i=0;i<6;i++){
                    //shave spokes
                    for(let j=triangles[i]!.length;j<triangles[(i+1)%6]!.length;j++){
                        for(let k=j;k<triangles[(i+1)%6]!.length;k++)
                            toReturn.nuke(triangles[(i+1)%6]![k]![j-triangles[i]!.length]!);
                    }
                    for(let j=triangles[i]!.length+1;j<triangles[(i+5)%6]!.length;j++){
                        for(let k=triangles[(i+5)%6]![j]!.length-(j-triangles[i]!.length);k<triangles[(i+5)%6]![j]!.length;k++)
                            toReturn.nuke(triangles[(i+5)%6]![j]![k]!);
                    }

                    //connect triangles
                    for(let k=0;k<triangles[i]!.length;k++){
                        const view = triangles[i]![k]![0]!.getView(HexOrientation.default);
                        if(triangles[(i+5)%6]!.length>k)
                            view.connectNode(
                                HexOrientation.clockwise[(i+4)%6]!.direc,
                                HexOrientation.clockwise[(i+1)%6]!.direc,
                                triangles[(i+5)%6]![k]![triangles[(i+5)%6]![k]!.length-1]!
                            )
                        if(triangles[(i+5)%6]!.length>k+1)
                            view.connectNode(
                                HexOrientation.clockwise[(i+5)%6]!.direc,
                                HexOrientation.clockwise[(i+2)%6]!.direc,
                                triangles[(i+5)%6]![k+1]![triangles[(i+5)%6]![k+1]!.length-1]!
                            )
                    }
                }

                return toReturn;
            }},
        );

        renderPasses.push(
            {order:-1000, func:(nodes, env) => {//initializes the board area
                this.renderScale = env.board.dims.x/2 / Math.max(
                    this.extrusions[1]!+this.extrusions[4]!,
                    (this.extrusions[0]!+this.extrusions[5]!+this.extrusions[2]!+this.extrusions[3]!)/2
                )*2;

                env.board.center.replace(HexOrientation.clockwise.map((o,i)=>
                        hexOrienDirs[o.direc].scale(this.extrusions[i]!))
                    .reduce((acc,n)=>
                        acc.add(n), new Vector(0,0))
                    .scale(this.renderScale/2))

                Object.assign(env.drawData, {
                    nodeToTexPos: (n:Node<any, any>) => this.getNodePos(n, this.renderScale),
                    nodeSize: this.renderScale,
                });
            }},

            {order:-10, func:(nodes, env) => {//draws grid
                fill("board.grid", env.drawData.context);
                stroke("board.grid", env.drawData.context);
                env.drawData.context.lineWidth=env.drawData.nodeSize*0.1;
                let size = env.drawData.nodeSize;

                for (const node of Object.values(nodes)) {
                    let pos = env.drawData.nodeToTexPos(node);
                    env.drawData.context.beginPath();
                    env.drawData.context.ellipse(pos.x, pos.y,
                        size * 0.4, size * 0.4, 0, 0, Math.PI*2);
                    env.drawData.context.fill();

                    // for(const conn in node.connections){
                    //     stroke(({
                    //         upright:[255,0,0],
                    //         downright:[255,255,0],
                    //         up:[255,255,255],
                    //         down:[0,0,0],
                    //         upleft:[255,0,255],
                    //         downleft:[0,255,255],
                    //     } satisfies {[key:string]:ColorPath})[conn] ?? [0,0,255],env.drawData.context);
                    //     const pos2 = env.drawData.nodeToTexPos(node.connections[conn]!.node);
                    //     env.drawData.context.singleLine(pos.x, pos.y, (pos2.x+pos.x)/2, (pos2.y+pos.y)/2);
                    // }
                }
            }},
            {order:1000, func:(nodes, env, historicalNodes) => {//draws path
                fill("board.grid", env.drawData.context);
                let positions = env.board.path.map(id => historicalNodes[id]!).map(n =>//todo: revert this back to just nodes
                    env.drawData.nodeToTexPos(n));
                let size = env.drawData.nodeSize * 0.1;

                env.drawData.context.save();
                env.drawData.context.beginPath();
                for (const position of positions) {
                    env.drawData.context.roundRect(position.x - size / 2, position.y - size / 2, size, size, size);
                }
                for (let i = 1; i < positions.length; i++) {
                    let p1 = positions[i - 1]!;
                    let p2 = positions[i]!;

                    //this math is so gross lol
                    env.drawData.context.save();
                    env.drawData.context.translate(p1.x, p1.y);
                    env.drawData.context.rotate(-Math.atan2(p2.x - p1.x, p2.y - p1.y));
                    env.drawData.context.rect(-size / 2, 0, size, Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2));
                    env.drawData.context.restore();
                }
                fill("board.pathColor", env.drawData.context);
                env.drawData.context.fill();
                env.drawData.context.restore();

                fill("board.text", env.drawData.context);
                env.drawData.context.textAlign="center";
                env.drawData.context.textBaseline="middle";
                let i = 1;
                for (const position of positions) {
                    env.drawData.context.setFontSize(
                        env.drawData.nodeSize * 0.5 / (Math.floor(Math.log10(i)) * 0.3 + 1));
                    env.drawData.context.spFillText((i++).toString(), position.x, position.y);
                }
            }},
            {order:1010, func:(nodes, env, historicalNodes) => {//handle click
                if (!env.cursor.heldElement) {
                    let pickingUp=undefined;
                    for(const element of env.elements){
                        if(element instanceof SelectableElement && element.forceSelected){
                            pickingUp=element;
                            if(element instanceof EditableElement)
                                element.finishEdit();
                            element.forceSelected=false;
                            break;
                        }
                    }

                    if(pickingUp===undefined) {
                        for (const element of env.elements) {
                            if (element instanceof SelectableElement) {
                                const selectionType = element.isSelected(nodes, env, historicalNodes);
                                if (selectionType === SelectableElement.CLICK.CONSUME) {
                                    pickingUp = undefined;
                                    break;
                                } else if (selectionType === SelectableElement.CLICK.PICKUP) {
                                    pickingUp = element;
                                }
                            }
                        }
                    }
                    if(pickingUp !== undefined){
                        env.cursor.heldElement = pickingUp;
                        env.board.removeElement(pickingUp);
                    }
                } else {
                    if (env.cursor.heldElement instanceof SelectableElement &&
                        env.cursor.heldElement.tryPlace(nodes, env, historicalNodes)) {
                        env.board.add(env.cursor.heldElement);
                        env.board.unHold();
                    }
                }
            }},
        );
    }

    settings():SettingData<any>[] {
        return [{
            type: "label" as "label",
            label: "Under Construction",
            data: {
                value:undefined as void,
                submitFunc: (v:void) => {
                    return true;
                },
                extra:{}
            }
        } satisfies SettingData<"label">,{
            type: "label" as "label",
            label: "",
            data: {
                value:undefined as void,
                submitFunc: (v:void) => {
                    return true;
                },
                extra:{}
            }
        } satisfies SettingData<"label">,
        ...HexOrientation.clockwise.map((orientation, i)=>{return{
            type: "counter" as "counter",
            label: "Extrusion "+i,
            data: {
                value: this.extrusions[i]!,
                submitFunc: (v:number) => {
                    this.extrusions[i]=v;
                    this.needsUpdate=true;
                    return true;
                },
                extra:{
                    min:1
                }
            }
        } satisfies SettingData<"counter">})];
    }
    palette(){
        const zipped = ([
            {down:{down:{downright:{}}}},
            {up:{},downright:{},downleft:{}},
            {down:{down:{down:{}}}},
            {down:{},downright:{down:{}}},
            {down:{downright:{down:{}}}},
            {downright:{},downleft:{up:{}}},
            {down:{downright:{}},upright:{}}

        ] satisfies ConnTree<HexOrientation>[]);

        return ([{
            el:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=> {
                //hehe
            },
            draw:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=>{
                fill("scenes.buttons.dark.icon", env.drawData.context);
                env.drawData.context.translate(0,-3);
                env.drawData.context.scale(2,2);

                env.drawData.context.save();
                env.drawData.context.translate(30,0);
                env.drawData.context.fillRect(-45,-10,30,5);
                env.drawData.context.beginPath();
                env.drawData.context.moveTo(-37,-7);
                env.drawData.context.lineTo(-33,-13);
                env.drawData.context.lineTo(-27,-13);
                env.drawData.context.lineTo(-23,-7);
                env.drawData.context.fill();
                env.drawData.context.restore();

                env.drawData.context.beginPath();
                env.drawData.context.moveTo(-13,-2);
                env.drawData.context.lineTo(-8,-2);
                env.drawData.context.lineTo(-5,13);
                env.drawData.context.lineTo(5,13);
                env.drawData.context.lineTo(8,-2);
                env.drawData.context.lineTo(13,-2);
                env.drawData.context.lineTo(9,18);
                env.drawData.context.lineTo(-9,18);
                env.drawData.context.fill();

                env.drawData.context.save();
                stroke("scenes.buttons.dark.icon", env.drawData.context);
                env.drawData.context.lineWidth=3;
                env.drawData.context.singleLine(-3,0, -2,10);
                env.drawData.context.singleLine(3,0, 2,10);
                env.drawData.context.restore();
            }
        }] as {
            el:((nodes:NodeGroup, env:BoardRenderEnv, historicalNodes:NodeGroup)=>SelectableElement|void),
            draw:(nodes:NodeGroup, env:BoardRenderEnv, historicalNodes:NodeGroup)=>void
        }[]).concat((zipped.map(d=>{
            const el = new HexOminoEl(d, "", HexOrientation.default);
            return{
                el:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=> {
                    el.onMouse = new Vector(0,0);
                    env.cursor.heldElement = el;
                    return el;
                },
                draw:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=>{
                    env.drawData.context.save();
                    env.drawData.context.scale(20, 20)
                    HexOminoEl.drawFromConnTree(d, env, "center");
                    env.drawData.context.restore();
                }
        }}))).concat([{
            el:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=> {
                if(data.scene instanceof MainScene)
                    data.scene = new CreatingOminoScene(data.scene, env.cursor,
                        (close)=>new Inner((self)=>{
                            close();
                            const newEl = self.getOmino();
                            newEl.onMouse = new Vector(0,0);
                            env.cursor.heldElement = newEl;
                        }));
            },
            draw:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=>{
                fill("scenes.sidebar.button.color", env.drawData.context);
                env.drawData.context.fillRect(-30,-5,60,10);
                env.drawData.context.fillRect(-5,-30,10,60);
            }
        }]).concat([{
            el:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=> {
                const el = new PortalEl("", "portal");
                el.onMouse = new Vector(0,0);
                env.cursor.heldElement = el;
                return el;
            },
            draw:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=>{
                env.drawData.context.save();
                env.drawData.context.scale(70,70)
                PortalEl.draw("I", env)
                env.drawData.context.restore();
            }
        }]);
    }

    getNodePos(n:Node<any, {pos:Vector}>, scale:number) {
        if(!n) return new Vector(0,0);
        return n.custom.pos.scale(scale);
    }

    infoTextPass(){
        return `${this.extrusions} hexagon`;
    }

    private setBounds(extrusions: {
        0?:number,
        1?:number,
        2?:number,
        3?:number,
        4?:number,
        5?:number,
    }) {

    }
}
