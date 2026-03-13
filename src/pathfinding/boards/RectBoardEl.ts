import {
    ApplyData,
    EditableElement,
    Element, type BoardEnv, type NodeGroup,
    type Pass,
    type RenderPass,
    SelectableElement, type BoardRenderEnv
} from "omino/pathfinding/elements/Element.js";
import Node from "omino/pathfinding/Node.js";
import RectOrientation, {type RectOrienVal} from "omino/pathfinding/orientation/RectOrientation.js";
import Vector from "omino/Vector.js";
import {fill, stroke} from "omino/Colors.js";
import type {SettingData} from "omino/scene/SettingsParser.js";
import OminoEl, {type ConnTree} from "omino/pathfinding/elements/OminoEl.js";
import PortalEl from "omino/pathfinding/elements/PortalEl.js";
import data from "omino/Global.js";
import CreatingOminoScene from "omino/scene/CreatingOminoScene.js";
import MainScene from "omino/scene/MainScene.js";
import RectOminoEl from "omino/pathfinding/elements/RectOminoEl.js";

export default class RectBoardEl extends Element {
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
                        let node = new Node(RectOrientation.default, {pos:new Vector(x,y)}, this.board[y]![x]!);
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

                this.center.replace(this.renderScale*this.width/2, this.renderScale*this.height/2);
                env.board.center = this.center;
            }},

            {order:-10, func:(nodes, env) => {//draws grid
                fill("board.grid", env.drawData.context);
                let size = env.drawData.nodeSize;

                for (const node of Object.values(nodes)) {
                    let pos = env.drawData.nodeToTexPos(node);
                    env.drawData.context.sRect((pos.x / size + 0.1) * size, (pos.y / size + 0.1) * size,
                        size * 0.8, size * 0.8, size * 0.1);
                }
            }},
            {order:1000, func:(nodes, env, historicalNodes) => {//draws path
                fill("board.grid", env.drawData.context);
                let halfCell = env.drawData.nodeSize / 2;
                let positions = env.board.path.map(id => historicalNodes[id]!).map(n =>//todo: revert this back to just nodes
                    env.drawData.nodeToTexPos(n).add(halfCell, halfCell));
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
        }[]).concat((zipped.map(d=>{return{
            el:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=> {
                const el = new RectOminoEl(d, 0, RectOrientation.up);
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
                    data.scene = new CreatingOminoScene(data.scene, env.cursor);
            },
            draw:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=>{
                fill("scenes.sidebar.button.color", env.drawData.context);
                env.drawData.context.fillRect(-30,-5,60,10);
                env.drawData.context.fillRect(-5,-30,10,60);
            }
        }]).concat([{
            el:(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup)=> {
                const el = new PortalEl(0, "portal");
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
