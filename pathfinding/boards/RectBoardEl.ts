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
import RectOrientation, {rectOrienDirs, type RectOrienVal} from "omino/pathfinding/orientation/RectOrientation.js";
import Vector from "omino/Vector.js";
import {fill, stroke} from "omino/Colors.js";
import type {SettingData} from "omino/scene/SettingsParser.js";
import {type ConnTree} from "omino/pathfinding/elements/OminoEl.js";
import PortalEl from "omino/pathfinding/elements/PortalEl.js";
import data from "omino/Global.js";
import CreatingOminoScene from "omino/scene/CreatingOminoScene.js";
import MainScene from "omino/scene/MainScene.js";
import RectOminoEl from "omino/pathfinding/elements/RectOminoEl.js";
import BoardElement from "omino/pathfinding/boards/BoardElement.js";
import Scene, {DimsScene, OneTimeButtonScene} from "omino/scene/Scene.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

class Inner extends DimsScene<any>{
    private tree:ConnTree<any, RectOrienVal>={};
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
        env.translate(this.dims.x*0.45, this.dims.y*0.5-this.dims.x*0.05);
        this.drawThis(this.tree, env);
        env.restore();

        super.render(env);
    }

    drawThis(tree:ConnTree<any, RectOrienVal>, env:AnyEnhancedEnv){
        env.sRect(this.dims.x*0.01, this.dims.x*0.01, this.dims.x*0.08, this.dims.x*0.08, this.dims.x*0.02);
        for(const sub in rectOrienDirs){
            env.save();
            const translateDir = rectOrienDirs[sub as RectOrienVal].clone().scale(this.dims.x*0.1);
            if(tree[sub as RectOrienVal] !== undefined) {
                env.singleLine(this.dims.x*0.05, this.dims.x*0.05, this.dims.x*0.05+translateDir.x, this.dims.x*0.05+translateDir.y);
                env.translate(translateDir.x, translateDir.y);
                this.drawThis(tree[sub as RectOrienVal]!, env);
            }else{
                env.translate(translateDir.x, translateDir.y);
                env.fillRect(this.dims.x*0.045, this.dims.x*0.02, this.dims.x*0.01, this.dims.x*0.06);
                env.fillRect(this.dims.x*0.02, this.dims.x*0.045, this.dims.x*0.06, this.dims.x*0.01);
            }
            env.restore();
        }
    }

    mouseDown(x: number, y: number, button: number): boolean {
        if(super.mouseDown(x, y, button)) return true;

        const selectedPos = new Vector(x,y).sub(this.dims.scale(0.5)).scale(10/this.dims.x).round();

        const branchesToCheck:[ConnTree<any, RectOrienVal>, Vector][]=[[this.tree, new Vector(0,0)]];
        const maybes:[ConnTree<any, RectOrienVal>, RectOrienVal][] = [];
        while(branchesToCheck.length>0){
            for(const child in rectOrienDirs){
                const newPos = branchesToCheck[0]![1].add(rectOrienDirs[child as RectOrienVal]);
                if(newPos.equals(selectedPos)){
                    maybes.push([branchesToCheck[0]![0], child as RectOrienVal])

                    branchesToCheck.length=0;
                    break;
                }

                if(branchesToCheck[0]![0][child as RectOrienVal] !== undefined)
                    branchesToCheck.push([
                        branchesToCheck[0]![0][child as RectOrienVal]!,
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
        return new RectOminoEl(this.tree, "", RectOrientation.up);
    }
}

export default class RectBoardEl extends BoardElement {
    private width: number;
    private height: number;
    private currId=0;
    private board:number[][]=[];
    private renderScale=1;
    private portalsEnabled=false;
    constructor(width:number, height:number) {
        let applyPasses:Pass[]=[];
        let renderPasses:RenderPass[]=[];
        super(applyPasses,renderPasses);
        this.width = width;
        this.height = height;

        this.setHeight(this.height);
        this.setWidth(this.width);

        applyPasses.push(
            {order:-1000, func:() => {//generate nodes
                const toReturn = new ApplyData();

                let currRowNode;
                for (let y = 0; y < this.height; y++) {
                    let leftView;
                    for (let x = 0; x < this.width; x++) {
                        let node = new Node(RectOrientation.default, {pos:new Vector(x,y)}, x+","+y);
                        toReturn.add(node);

                        let nodeView = node.getView(RectOrientation.default);
                        if (x !== 0) {
                            nodeView.connectNode("left", "right", leftView!.node);

                            if (y !== 0) {
                                nodeView.connectNode("up", "down", leftView!.get("up")!.getNode("right")!);
                            }
                        } else if (y !== 0) {
                            nodeView.connectNode("up", "down", currRowNode!);
                        }
                        if (x === 0) currRowNode = node;
                        leftView = nodeView;
                    }
                }

                return toReturn;
            }},
        );

        renderPasses.push(
            {order:-1000, func:(nodes, env) => {//initializes the board area
                this.renderScale = Math.min(env.board.dims.x / this.width, env.board.dims.y / this.height);

                Object.assign(env.drawData, {
                    nodeToTexPos: (n:Node<any, any>) => this.getNodePos(n, this.renderScale),
                    nodeSize: this.renderScale,
                });

                this.center.replace(this.renderScale*(this.width/2-0.5), this.renderScale*(this.height/2-0.5));
                env.board.center = this.center;
            }},

            {order:-10, func:(nodes, env) => {//draws grid
                fill("board.grid", env.drawData.context);
                let size = env.drawData.nodeSize;

                for (const node of Object.values(nodes)) {
                    let pos = env.drawData.nodeToTexPos(node);
                    env.drawData.context.sRect((pos.x / size - 0.4) * size, (pos.y / size -0.4) * size,
                        size * 0.8, size * 0.8, size * 0.1);

                    // for(const conn in node.connections){
                    //     stroke(({
                    //         right:[255,0,0],
                    //         left:[255,255,0],
                    //         up:[255,255,255],
                    //         down:[0,0,0],
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
            type: "counter" as "counter",
            label: "Width",
            data: {
                value: this.width,
                submitFunc: (v:number) => {
                    this.setWidth(v);
                    this.width = v;
                    this.needsUpdate=true;
                    return true;
                },
                extra:{
                    min:1
                }
            }
        } satisfies SettingData<"counter">, {
            type: "counter" as "counter",
            label: "Height",
            data: {
                value: this.height,
                submitFunc: (v:number) => {
                    this.setHeight(v);
                    this.height = v;
                    this.needsUpdate=true;
                    return true;
                },
                extra:{
                    min:1
                }
            }
        } satisfies SettingData<"counter">, {
            type:"tickbox",
            label:"Enable Portals",
            data:{
                value:true,
                submitFunc:(v:boolean)=>{
                    this.portalsEnabled=v;
                    this.needsUpdate=true;
                    return true;
                },
                extra:{
                    requiresApply:true,
                }
            }
        } satisfies SettingData<"tickbox">];
    }
    palette(){
        const zipped = ([
            {down:{down:{down:{down:{}}}}},
            {down:{down:{down:{left:{}}}}},
            {down:{down:{down:{},right:{}}}},
            {down:{down:{right:{down:{}}}}},
            {down:{right:{down:{right:{}}}}},
            {down:{down:{right:{right:{}}}}},
            {left:{},right:{},down:{down:{}}},
            {left:{},right:{},down:{left:{up:{}}}},
            {left:{},down:{},up:{right:{}}},
            {left:{},down:{},right:{},up:{}},
            {up:{left:{}},down:{right:{}}},
            {up:{left:{}},down:{left:{}}},

        ] satisfies ConnTree<RectOrientation>[]);

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
            const el = new RectOminoEl(d, "", RectOrientation.up);

            return{
                el:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=> {
                    el.onMouse = new Vector(0,0);
                    env.cursor.heldElement = el;
                    return el;
                },
                draw:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=>{
                    env.drawData.context.save();
                    env.drawData.context.scale(20, 20)
                    RectOminoEl.drawFromConnTree(d, env, "center");
                    env.drawData.context.restore();
                }
        }}))).concat([{
            el:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=> {
                if(data.scene instanceof MainScene)
                    data.scene = new CreatingOminoScene(data.scene, env.cursor,
                        (close) => new Inner((self:Inner)=>{
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

    setHeight(height:number){
        if(this.board.length>height)
            this.board = this.board.slice(0,height);

        if(this.board.length<height)
            this.board.push(...new Array(height-this.board.length).fill(0).map(_=>
                new Array(this.width).fill(0).map(_=>this.currId++)));
    }
    setWidth(width:number){
        if(this.board.length>0 && this.board[0]!.length>width)
            for(let i=0;i<this.board.length;i++)
                this.board[i] = this.board[i]!.slice(0,width);

        if(this.board.length>0 && this.board[0]!.length<width)
            for(let i=0;i<this.board.length;i++)
                this.board[i]!.push(...new Array(width-this.board[i]!.length).fill(0).map(_=>this.currId++));

    }

    getNodePos(n:Node<any, {pos:Vector}>, scale:number) {
        if(!n) return new Vector(0,0);
        return n.custom.pos.scale(scale);
    }

    infoTextPass(){
        return `${this.width}x${this.height} rectangle`;
    }
}
