import {
    ApplyData,
    EditableElement, Element, type Env, type NodeGroup,
    type Pass, type RenderEnv,
    type RenderPass,
    SelectableElement
} from "omino/pathfinding/elements/Element.js";
import {fill, stroke} from "omino/Colors.js";
import Vector from "omino/Vector.js";
import PortalEl from "omino/pathfinding/elements/PortalEl.js";
import Scene, {DimsScene, OneTimeButtonScene} from "omino/scene/Scene.js";
import Node, {type NodeView} from "omino/pathfinding/Node.js";
import  Orientation from "omino/pathfinding/orientation/Orientation.js";
import type { OType } from "omino/pathfinding/orientation/Orientation.js";
import data from "omino/Global.js"
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

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

type ConnTree<O extends Orientation<T>, T extends OType> = {[key in T]:ConnTree<O, T>}

function getNodes(currNodeView:NodeView<any, any>|undefined, connTree:ConnTree<any, any>, toReturn:Set<Node<any, any>> = new Set()) {
    if(currNodeView === undefined) return toReturn;

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

class OminoEl extends EditableElement {
    private readonly connTree;
    private root;
    private readonly orientation;
    private readonly nodes:Node<any, any>[]=[];

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

    constructor(connTree:ConnTree<any, any>, root:number, orientation:Orientation<any>) {
        let applyPasses:Pass[]=[];
        let renderPasses:RenderPass[]=[];
        super(applyPasses,renderPasses);
        this.connTree = connTree;
        this.root = root;
        this.orientation = orientation;

        this.editDialog.addScene(buttonBar(this.rotateLeft, this.rotateRight));
        this.editDialog.addScene(buttonBar(this.flipH, this.flipV));

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

    draw(nodes:NodeGroup, env:RenderEnv, historicalNodes:NodeGroup) {
        let size = env.drawData.nodeSize;

        env.drawData.context.save();
        fill("ominoColors.P", env.drawData.context);
        env.drawData.context.lineWidth = size * 0.88;
        for (const node of this.nodes) {
            let pos = this.getNodePos(node, env, historicalNodes);

            this.drawNode(env, pos);

            stroke("ominoColors.P", env.drawData.context);
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

    drawNode(env:RenderEnv, pos:Vector) {
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

    getNodePos(node:Node<any, {pos:Vector}>, env:RenderEnv, historicalNodes:NodeGroup) {
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

    isMyNode(node:Node<any, any>) {
        return this.nodes.includes(node);
    }

    checkValid(root:number, nodes:NodeGroup, env:Env) {
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

    isSelected(_nodes:NodeGroup, env:RenderEnv, historicalNodes:NodeGroup) {
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

    isEditing(nodes:NodeGroup, env:RenderEnv, historicalNodes:NodeGroup) {
        if (env.mouse.clickedRight) {
            let cellPos = env.mouse.pos.sub(env.board.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize);

            let node = Object.values(historicalNodes).find(n => n.custom.pos.equals(cellPos.floor()));
            return !!node && this.nodes.some(n => n.id === node.id);
        }
        return false;
    }

    tryPlace(nodes:NodeGroup, env:RenderEnv) {
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

    drawAtMouse(nodes: NodeGroup, env: RenderEnv, historicalNodes: NodeGroup) {
        this.draw(nodes, env, historicalNodes);
    }

    static factory(connTree:ConnTree<any, any>){
        return (root:number, orientation:Orientation<any>) => new OminoEl(connTree, root, orientation)
    }

    palette(){
        return [];
    }

    settings() {
        return [];
    }
}

export default OminoEl;
