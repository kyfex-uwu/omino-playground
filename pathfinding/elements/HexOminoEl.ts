import OminoEl, {type ConnTree, connTreeHash, hashOrder} from "omino/pathfinding/elements/OminoEl.js";
import HexOrientation, {hexOrienDirs, type HexOrienVal} from "omino/pathfinding/orientation/HexOrientation.js";
import Vector from "omino/Vector.js";
import Scene, {DimsScene, OneTimeButtonScene} from "omino/scene/Scene.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";
import {fill, stroke} from "omino/Colors.js";
import Orientation, {type OType} from "omino/pathfinding/orientation/Orientation.js";
import {
    type BoardRenderEnv,
    EditableElement,
    type NodeGroup, type Pass,
    type RenderPass
} from "omino/pathfinding/elements/Element.js";

const button = (
    click:((self: OneTimeButtonScene<any>, x: number, y: number) => void), icon:((env:AnyEnhancedEnv)=>void)) =>
    new OneTimeButtonScene((self, env)=>{
        fill("scenes.util.button."+(self.isIn()?"bgHover":"bg"), env);
        env.beginPath();
        env.sRect(0,0,self.dims.x,self.dims.y,self.dims.x*0.1);
        env.fill();
        fill("scenes.util.button.color", env);
        env.save();
        env.translate(20,20);
        env.scale(0.8,0.8);
        icon(env);
        env.restore();
    },click,self => {
        self.dims.replace(40,40);
    });
const buttonBar = (...buttons:Scene<any>[]) => {
    const toReturn = new DimsScene();
    toReturn.dims.replace(45*buttons.length-5,40);
    for(let i=0;i<buttons.length;i++)
        toReturn.addScene(buttons[i]!).pos.replace(45*i,0);
    return toReturn;
}

const rotateShape = (env:AnyEnhancedEnv)=>{
    env.beginPath();
    env.moveTo(10,10);
    env.lineTo(15,15);
    env.bezierCurveTo(23,7,23,-7,15,-15);
    env.bezierCurveTo(7,-23,-7,-23,-15,-15);
    env.bezierCurveTo(-23,-7,-23,7,-15,15);
    env.lineTo(-18,18);
    env.lineTo(-7,18);
    env.lineTo(-7,7);
    env.lineTo(-10,10);
    env.bezierCurveTo(-15,5,-15,-5,-10,-10);
    env.bezierCurveTo(-5,-15,5,-15,10,-10);
    env.bezierCurveTo(15,-5,15,5,10,10);
    env.fill();
};
const flipShape = (env:AnyEnhancedEnv) =>{
    env.fillRect(-3,-13,6,26);
    env.polygon([-9,-9],[9,-9],[0,-19]);
    env.fill();
    env.polygon([-9,9],[9,9],[0,19]);
    env.fill();
}

export function swap<T extends OType>(obj: ConnTree<any, T>, p1:T, p2:T){
    const a = obj[p1];
    const b = obj[p2];
    if(a) {
        obj[p2] = a;
        delete obj[p1];
    }
    if(b) {
        obj[p1] = b;
        if(!a) delete obj[p2];
    }
}

export default class HexOminoEl extends OminoEl<HexOrienVal>{

    private readonly rotateLeft = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;

        this.connTree = HexOrientation.upleft.applyToTree(this.connTree);
    },(env)=>{
        rotateShape(env);
    });
    private readonly rotateRight = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;

        this.connTree = HexOrientation.upright.applyToTree(this.connTree);
    },(env)=>{
        env.scale(-1,1);
        rotateShape(env);
    });
    private readonly flipHUp = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;

        const childrenToParse:ConnTree<any, HexOrienVal>[] = [this.connTree];
        while(childrenToParse.length>0){
            swap(childrenToParse[0]!, "up", "downright");
            swap(childrenToParse[0]!, "upleft", "down");
            for(const child in childrenToParse[0]){
                childrenToParse.push(childrenToParse[0][child as HexOrienVal]!);
            }

            childrenToParse.shift();
        }

    },(env)=>{
        env.rotate(Math.PI/3*2);
        flipShape(env);
    });
    private readonly flipHDown = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;

        const childrenToParse:ConnTree<any, HexOrienVal>[] = [this.connTree];
        while(childrenToParse.length>0){
            swap(childrenToParse[0]!, "up", "downleft");
            swap(childrenToParse[0]!, "upright", "down");
            for(const child in childrenToParse[0]){
                childrenToParse.push(childrenToParse[0][child as HexOrienVal]!);
            }

            childrenToParse.shift();
        }

    },(env)=>{
        env.rotate(Math.PI/3);
        flipShape(env);
    });
    private readonly flipV = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;

        const childrenToParse:ConnTree<any, HexOrienVal>[] = [this.connTree];
        while(childrenToParse.length>0){
            swap(childrenToParse[0]!, "upleft", "upright");
            swap(childrenToParse[0]!, "downleft", "downright");
            for(const child in childrenToParse[0]){
                childrenToParse.push(childrenToParse[0][child as HexOrienVal]!);
            }

            childrenToParse.shift();
        }
    },(env)=>{
        flipShape(env);
    });

    constructor(connTree:ConnTree<Orientation<HexOrienVal>, any>, root:string, orientation:Orientation<HexOrienVal>) {
        const applyPasses:Pass[]=[];
        const renderPasses:RenderPass[]=[]
        super(connTree, root, orientation, applyPasses, renderPasses);

        this.editDialog.addScene(buttonBar(this.rotateLeft, this.rotateRight));
        this.editDialog.addScene(buttonBar(this.flipHUp, this.flipHDown, this.flipV));

        renderPasses.push({order:0, func:(...args) => this.draw(...args)},
            EditableElement.createDialogPass(this, (nodes, env, historicalNodes) =>
                env.drawData.nodeToTexPos(historicalNodes[this.root]!).add(env.drawData.nodeSize / 2, env.drawData.nodeSize / 2)));//todo: change pos
    }


    draw(nodes:NodeGroup, env:BoardRenderEnv, historicalNodes:NodeGroup) {
        let size = env.drawData.nodeSize;

        env.drawData.context.save();
        fill("ominoColors."+this.color, env.drawData.context);
        env.drawData.context.lineWidth = size * 0.88;
        for (const node of this.nodes) {
            let pos = this.getNodePos(node, env, historicalNodes);

            HexOminoEl.drawNode(env, pos);

            stroke("ominoColors."+this.color, env.drawData.context);
            env.drawData.context.lineWidth=env.drawData.nodeSize * 0.48*2;
            for (const name in node.historicalConnections) {
                const connected = node.historicalConnections[name as HexOrienVal]!;
                if (this.nodes.some(n => n.id == connected.node.id) && connected.node.id > node.id) {
                    let otherPos = this.getNodePos(connected.node, env, historicalNodes);
                    env.drawData.context.beginPath();
                    env.drawData.context.moveTo(
                        (pos.x / size) * size, (pos.y / size) * size)
                    env.drawData.context.lineTo(
                        (otherPos.x / size) * size, (otherPos.y / size) * size);
                    env.drawData.context.stroke();
                }
            }
        }
        env.drawData.context.restore();
        env.drawData.notifyTexture();
    }
    static drawFromConnTree(tree:ConnTree<any, HexOrienVal>, env:BoardRenderEnv, type:"center"|"root", maybeColor?:string){
        const color = maybeColor ?? hashOrder[connTreeHash(tree)]!;

        const nodes:[ConnTree<any, HexOrienVal>, Vector][] = [];
        const bounds = {min:new Vector(Infinity, Infinity), max:new Vector(-Infinity, -Infinity)};
        const untraveledNodes:[ConnTree<any>, Vector][] = [[tree, new Vector(0,0)]];
        while(untraveledNodes.length>0){
            nodes.push(untraveledNodes[0]!);
            bounds.min.x=Math.min(bounds.min.x, untraveledNodes[0]![1].x);
            bounds.min.y=Math.min(bounds.min.y, untraveledNodes[0]![1].y);
            bounds.max.x=Math.max(bounds.max.x, untraveledNodes[0]![1].x);
            bounds.max.y=Math.max(bounds.max.y, untraveledNodes[0]![1].y);

            for(const child in untraveledNodes[0]![0])
                untraveledNodes.push([untraveledNodes[0]![0][child]!, untraveledNodes[0]![1]
                    .add(hexOrienDirs[child as HexOrienVal])]);
            untraveledNodes.shift();
        }

        env.drawData.context.save();
        fill("ominoColors."+color, env.drawData.context);
        env.drawData.context.lineWidth = 0.48*2;
        const offs = type === "center" ? bounds.min.add(bounds.max.sub(bounds.min).scale(0.5)) : new Vector(0,0);
        for (const pos of nodes) {

            this.drawNode({...env, drawData:{...env.drawData, nodeSize:1}}, pos[1].sub(offs));

            stroke("ominoColors."+color, env.drawData.context);
            for (const name in pos[0]) {
                const destPos = hexOrienDirs[name as HexOrienVal];

                let otherPos = pos[1].sub(offs).add(destPos);
                env.drawData.context.beginPath();
                env.drawData.context.moveTo(pos[1].sub(offs).x, pos[1].sub(offs).y);
                env.drawData.context.lineTo(otherPos.x, otherPos.y);
                env.drawData.context.stroke();
            }
        }
        env.drawData.context.restore();
        env.drawData.notifyTexture();
    }

    static drawNode(env:BoardRenderEnv, pos:Vector) {
        env.drawData.context.beginPath();
        env.drawData.context.ellipse(
            pos.x,
            pos.y ,
            env.drawData.nodeSize * 0.48,
            env.drawData.nodeSize * 0.48,
            0, 0, Math.PI*2);
        env.drawData.context.fill();
    }

    private getInvRotation():number{
        switch(this.orientation.direc){
            case "up": return 0;
            case "down": return Math.PI;
            case "upleft": return -Math.PI/3;
            case "upright": return Math.PI/3;
            case "downleft": return -Math.PI/3*2;
            case "downright": return Math.PI/3*2;
        }
        return 0;
    }
    drawAtMouse(nodes: NodeGroup, env: BoardRenderEnv, historicalNodes: NodeGroup) {
        // this.draw(nodes, env, historicalNodes);
        env.drawData.context.save();
        const translateAmt = env.board.getAbsolutePos().scale(-1)
            .add(env.mouse.pos);
        if(this.onMouse) translateAmt.replace(translateAmt.sub(this.onMouse));
        env.drawData.context.translate(translateAmt.x, translateAmt.y);
        env.drawData.context.scale(env.drawData.nodeSize, env.drawData.nodeSize);
        env.drawData.context.rotate(this.getInvRotation());
        HexOminoEl.drawFromConnTree(this.connTree, env, "root", this.color);

        env.drawData.context.restore();
    }
}
