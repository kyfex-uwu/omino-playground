import OminoEl, {type ConnTree, connTreeHash, hashOrder} from "omino/pathfinding/elements/OminoEl.js";
import RectOrientation, {rectOrienDirs, type RectOrienVal} from "omino/pathfinding/orientation/RectOrientation.js";
import Vector from "omino/Vector.js";
import Scene, {DimsScene, OneTimeButtonScene} from "omino/scene/Scene.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";
import {fill, stroke} from "omino/Colors.js";
import Orientation from "omino/pathfinding/orientation/Orientation.js";
import {
    type BoardRenderEnv,
    EditableElement,
    type NodeGroup,
    type Pass,
    type RenderPass
} from "omino/pathfinding/elements/Element.js";
import {swap} from "omino/pathfinding/elements/HexOminoEl.js";

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
const buttonBar = (b1:Scene<any>,b2:Scene<any>) => {
    const toReturn = new DimsScene();
    toReturn.dims.replace(85,40);
    toReturn.addScene(b1).pos.replace(0,0);
    toReturn.addScene(b2).pos.replace(45,0);
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

export default class RectOminoEl extends OminoEl<RectOrienVal>{

    private readonly rotateLeft = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;

        this.connTree = RectOrientation.left.applyToTree(this.connTree);
    },(env)=>{
        rotateShape(env);
    });
    private readonly rotateRight = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;

        this.connTree = RectOrientation.right.applyToTree(this.connTree);
    },(env)=>{
        env.scale(-1,1);
        rotateShape(env);
    });
    private readonly flipH = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;

        const childrenToParse:ConnTree<any, RectOrienVal>[] = [this.connTree];
        while(childrenToParse.length>0){
            swap(childrenToParse[0]!, "left", "right");
            for(const child in childrenToParse[0]){
                childrenToParse.push(childrenToParse[0][child as RectOrienVal]!);
            }

            childrenToParse.shift();
        }

    },(env)=>{
        env.rotate(Math.PI/2);
        flipShape(env);
    });
    private readonly flipV = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;

        const childrenToParse:ConnTree<any, RectOrienVal>[] = [this.connTree];
        while(childrenToParse.length>0){
            swap(childrenToParse[0]!, "up", "down");
            for(const child in childrenToParse[0]){
                childrenToParse.push(childrenToParse[0][child as RectOrienVal]!);
            }

            childrenToParse.shift();
        }
    },(env)=>{
        flipShape(env);
    });

    constructor(connTree:ConnTree<Orientation<RectOrienVal>, any>, root:string, orientation:Orientation<RectOrienVal>) {
        const applyPasses:Pass[]=[];
        const renderPasses:RenderPass[]=[]
        super(connTree, root, orientation, applyPasses, renderPasses);

        this.editDialog.addScene(buttonBar(this.rotateLeft, this.rotateRight));
        this.editDialog.addScene(buttonBar(this.flipH, this.flipV));

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

            RectOminoEl.drawNode(env, pos.sub(env.drawData.nodeSize/2, env.drawData.nodeSize/2));

            stroke("ominoColors."+this.color, env.drawData.context);
            for (const name in node.historicalConnections) {
                const connected = node.historicalConnections[name as RectOrienVal]!;
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
    static drawFromConnTree(tree:ConnTree<any, RectOrienVal>, env:BoardRenderEnv, type:"center"|"root", maybeColor?:string){
        const color = maybeColor ?? hashOrder[connTreeHash(tree)]!;

        const nodes:[ConnTree<any, RectOrienVal>, Vector][] = [];
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
                    .add(rectOrienDirs[child as RectOrienVal])]);
            untraveledNodes.shift();
        }

        env.drawData.context.save();
        fill("ominoColors."+color, env.drawData.context);
        env.drawData.context.lineWidth = 0.88;
        const offs = type === "center" ? bounds.min.add(bounds.max.sub(bounds.min).scale(0.5)).add(0.5, 0.5) : new Vector(0,0);
        for (const pos of nodes) {

            this.drawNode({...env, drawData:{...env.drawData, nodeSize:1}}, pos[1].sub(offs));

            stroke("ominoColors."+color, env.drawData.context);
            for (const name in pos[0]) {
                const destPos = rectOrienDirs[name as RectOrienVal];

                let otherPos = pos[1].sub(offs).add(destPos);
                env.drawData.context.beginPath();
                env.drawData.context.moveTo(
                    (pos[1].sub(offs).x + 0.5), (pos[1].sub(offs).y + 0.5))
                env.drawData.context.lineTo(
                    (otherPos.x + 0.5), (otherPos.y + 0.5));
                env.drawData.context.stroke();
            }
        }
        env.drawData.context.restore();
        env.drawData.notifyTexture();
    }

    static drawNode(env:BoardRenderEnv, pos:Vector) {
        env.drawData.context.strokeStyle="#0000";
        env.drawData.context.sRect(
            (pos.x / env.drawData.nodeSize + 0.06) * env.drawData.nodeSize,
            (pos.y / env.drawData.nodeSize + 0.06) * env.drawData.nodeSize,
            env.drawData.nodeSize * 0.88,
            env.drawData.nodeSize * 0.88,
            env.drawData.nodeSize * 0.2);
        //circle
        // env.drawData.context.ellipse(
        // 	(pos.x/env.drawData.nodeSize+0.5)*env.drawData.nodeSize,
        // 	(pos.y/env.drawData.nodeSize+0.5)*env.drawData.nodeSize,
        //  env.drawData.nodeSize*0.88);
    }

    private getInvRotation():number{
        switch(this.orientation.direc){
            case "up": return 0;
            case "down": return Math.PI;
            case "left": return -Math.PI/2;
            case "right": return Math.PI/2;
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
        env.drawData.context.translate(-0.5,-0.5);
        RectOminoEl.drawFromConnTree(this.connTree, env, "root", this.color);

        env.drawData.context.restore();
    }
}
