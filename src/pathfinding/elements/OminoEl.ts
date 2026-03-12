import {
    ApplyData,
    EditableElement,
    type BoardEnv,
    type NodeGroup,
    type Pass,
    type BoardRenderEnv,
    type RenderPass,
    SelectableElement
} from "omino/pathfinding/elements/Element.js";
import {background, fill, stroke} from "omino/Colors.js";
import Vector from "omino/Vector.js";
import PortalEl from "omino/pathfinding/elements/PortalEl.js";
import Scene, {DimsScene, OneTimeButtonScene} from "omino/scene/Scene.js";
import Node, {type NodeView} from "omino/pathfinding/Node.js";
import type {OType} from "omino/pathfinding/orientation/Orientation.js";
import Orientation from "omino/pathfinding/orientation/Orientation.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";
import RectOrientation, {rectOrienDirs, type RectOrienVal} from "omino/pathfinding/orientation/RectOrientation.js";
import data from "omino/Global.js";

/**
 *  ##
 * ##
 *  #
 *
 * starting at bottom:
 * {
 *     0:{
 *     0:{
 *         1:{}
 *       },
 *       3:{}
 *   }
 * }
 *
 * start at some root
 *
 */

export type ConnTree<O extends Orientation<T>, T extends OType=O["__only_for_ts"]> = {[key in T]?:ConnTree<O, T>}
function internalHash(tree:ConnTree<any, any>, hash=0){
    for (const name in tree) {
        for(const char of name) {
            hash = (hash << 5) - hash + char.charCodeAt(0);
            hash |= 0; // Constrain to 32bit integer
        }
        hash=internalHash(tree[name]!, hash)
    }
    return hash;
}
export function connTreeHash(tree:ConnTree<any, any>, limit=12){
    return Math.abs(internalHash(tree))%limit;
}

function getNodes(currNodeView:NodeView<any, any>|undefined, connTree:ConnTree<any, any>, toReturn:Set<Node<any, any>> = new Set()) {
    if(currNodeView === undefined) return false;

    toReturn.add(currNodeView.node);

    for (const key in connTree) {
        //TODO: this just assumes the next node is the same type as this one
        if (!getNodes(currNodeView.get(key), connTree[key]!, toReturn)) return false;
    }

    return toReturn;
}

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

class OminoEl<ThisOType extends OType> extends EditableElement {
    private readonly connTree;
    private root;
    private readonly orientation;
    private readonly nodes:Node<ThisOType, any>[]=[];

    private readonly rotateLeft = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;
    },(env)=>{
        rotateShape(env);
    });
    private readonly rotateRight = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;
    },(env)=>{
        env.scale(-1,1);
        rotateShape(env);
    });
    private readonly flipH = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;
    },(env)=>{
        flipShape(env);
    });
    private readonly flipV = button(_=>{
        this.onMouse = new Vector(0,0);
        this.forceSelected=true;
    },(env)=>{
        env.rotate(Math.PI/2);
        flipShape(env);
    });
    private color: string;

    constructor(connTree:ConnTree<Orientation<ThisOType>, any>, root:number, orientation:Orientation<ThisOType>) {
        let applyPasses:Pass[]=[];
        let renderPasses:RenderPass[]=[];
        super(applyPasses,renderPasses);
        this.connTree = connTree;
        this.root = root;
        this.orientation = orientation;

        this.editDialog.addScene(buttonBar(this.rotateLeft, this.rotateRight));
        this.editDialog.addScene(buttonBar(this.flipH, this.flipV));

        this.color=(["I", "L", "Y", "W", "V", "T", "P", "N", "F", "X", "Z", "U"])[connTreeHash(this.connTree)%12]!

        //note: this assumes the omino is in a valid spot!! it will not check if it can it just does
        applyPasses.push({order:-1, func:(nodes, env) => {
            if(this.getRoot(nodes) === undefined ||
                !getNodes(this.getRoot(nodes).getView(this.orientation), this.connTree)) this.invalid=true;
        }}, {order:0, func:(nodes, env) => {
            let allNodes = getNodes(this.getRoot(nodes)?.getView(this.orientation), this.connTree);
            if(!allNodes) return new ApplyData();

            this.nodes.length=0;
            for (const node of allNodes) {
                this.nodes.push(node);
                node.detach();
            }
            return new ApplyData({removed: allNodes});
        }});
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

            OminoEl.drawNode(env, pos);

            stroke("ominoColors."+this.color, env.drawData.context);
            for (const name in node.historicalConnections) {
                const connected = node.historicalConnections[name]!;
                if (this.nodes.some(n => n.id == connected.node.id) && connected.node.id > node.id) {
                    let otherPos = this.getNodePos(connected.node, env, historicalNodes);
                    env.drawData.context.beginPath();
                    env.drawData.context.moveTo(
                        (pos.x / size + 0.5) * size, (pos.y / size + 0.5) * size)
                    env.drawData.context.lineTo(
                        (otherPos.x / size + 0.5) * size, (otherPos.y / size + 0.5) * size);
                    env.drawData.context.stroke();
                }
            }
        }
        env.drawData.context.restore();
        env.drawData.notifyTexture();
    }
    static drawFromConnTree(tree:ConnTree<any, RectOrienVal>, env:BoardRenderEnv, type:"center"|"root"){
        const color = (["I", "L", "Y", "W", "V", "T", "P", "N", "F", "X", "Z", "U"])[connTreeHash(tree)]!;

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

    getNodePos(node:Node<ThisOType, {pos:Vector}>, env:BoardRenderEnv, historicalNodes:NodeGroup) {
        if (this.onMouse && env.cursor.heldElement === this) {
            return env.mouse.pos.sub(env.board.getAbsolutePos())
                .sub(env.drawData.nodeToTexPos(this.getRoot(historicalNodes)))
                .sub(env.drawData.nodeSize / 2, env.drawData.nodeSize / 2)
                .sub(this.onMouse || new Vector(0, 0))
                .add(node.custom.pos.scale(env.drawData.nodeSize));
        }
        return env.drawData.nodeToTexPos(node);
    }

    getRoot(nodes:NodeGroup) {//check if you need historicalNodes if youre running into a problem here
        return nodes[this.root]!;
    }

    isMyNode(node:Node<ThisOType, any>) {
        return this.nodes.includes(node);
    }

    checkValid(root:number, nodes:NodeGroup, env:BoardEnv) {
        const rootNode = Object.values(nodes).find(n => n.id === root);
        if (!rootNode) return false;
        const nodesToCheck = getNodes(rootNode.getView(this.orientation),
            this.connTree);
        if(nodesToCheck){
            nodesToCheck.add(rootNode);

            for(const portal of env.elements.filter(e => e instanceof PortalEl)){
                for(const node of nodesToCheck){
                    if(node.id === portal.root) return false;
                }
            }

            return true;
        }
        return false;
    }

    isSelected(_nodes:NodeGroup, env:BoardRenderEnv, historicalNodes:NodeGroup) {
        if(this.editing && env.mouse.clickedLeft)
            return SelectableElement.CLICK.CONSUME;

        if (env.mouse.clickedLeft) {
            let cellPos = env.mouse.pos.sub(env.board.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize)

            let node = Object.values(historicalNodes).find(n => n.custom.pos.equals(cellPos.floor()));
            if (node && this.nodes.some(n => n.id === node.id)) {
                this.onMouse = env.mouse.pos.sub(this.getNodePos(
                    this.getRoot(historicalNodes), env, historicalNodes))
                    .sub(env.drawData.nodeSize / 2, env.drawData.nodeSize / 2)
                    .sub(env.board.getAbsolutePos());
                return SelectableElement.CLICK.PICKUP;
            }
        }
        return SelectableElement.CLICK.NONE;
    }

    isEditing(nodes:NodeGroup, env:BoardRenderEnv, historicalNodes:NodeGroup) {
        if (env.mouse.clickedRight) {
            let cellPos = env.mouse.pos.sub(env.board.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize);

            let node = Object.values(historicalNodes).find(n => n.custom.pos.equals(cellPos.floor()));
            return !!node && this.nodes.some(n => n.id === node.id);
        }
        return false;
    }

    tryPlace(nodes:NodeGroup, env:BoardRenderEnv) {
        if (env.mouse.clickedLeft) {
            let cellPos = env.mouse.pos.sub(env.board.getAbsolutePos())
                .sub(this.onMouse || new Vector(0, 0)).scale(1 / env.drawData.nodeSize).floor();

            let newRoot = Object.values(nodes).find(n => n.custom.pos.equals(cellPos));
            if (newRoot == undefined) return false;

            if (this.checkValid(newRoot.id, nodes, env)) {
                this.root = newRoot.id;
                this.onMouse = false;
                return true;
            }
        }
        return false;
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
        OminoEl.drawFromConnTree(this.connTree, env, "root");

        env.drawData.context.restore();
    }
    private getInvRotation():number{
        if(this.orientation instanceof RectOrientation){
            switch(this.orientation.orientation){
                case "up": return 0;
                case "down": return Math.PI;
                case "left": return -Math.PI/2;
                case "right": return Math.PI/2;
            }
        }

        console.trace("Inverse rotation not found for omino "+this.orientation.toString())
        return 0;
    }

    static factory<T extends OType>(connTree:ConnTree<Orientation<T>, any>){
        return (root:number, orientation:Orientation<T>) => new OminoEl<T>(connTree, root, orientation)
    }

    palette(){
        return [];
    }

    settings() {
        return [];
    }
}

export default OminoEl;
