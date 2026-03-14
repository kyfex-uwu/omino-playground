import {
    ApplyData,
    type BoardEnv,
    type BoardRenderEnv,
    EditableElement,
    type NodeGroup,
    type Pass,
    type RenderPass,
    SelectableElement
} from "omino/pathfinding/elements/Element.js";
import Vector from "omino/Vector.js";
import PortalEl from "omino/pathfinding/elements/PortalEl.js";
import Node, {type NodeView} from "omino/pathfinding/Node.js";
import type {OType} from "omino/pathfinding/orientation/Orientation.js";
import Orientation from "omino/pathfinding/orientation/Orientation.js";

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
            hash = hash*4357277 + char.charCodeAt(0);
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


export const hashOrder = ["I", "L", "N", "F", "W", "U", "Z", "X", "V", "T", "Y", "P"]
abstract class OminoEl<ThisOType extends OType> extends EditableElement {
    protected connTree;
    protected root;
    protected readonly orientation;
    protected readonly nodes:Node<ThisOType, {pos:Vector}>[]=[];

    public readonly color: string;

    constructor(connTree:ConnTree<Orientation<ThisOType>, any>, root:string, orientation:Orientation<ThisOType>,
                applyPasses:Pass[], renderPasses:RenderPass[]) {
        super(applyPasses,renderPasses);
        this.connTree = connTree;
        this.root = root;
        this.orientation = orientation;

        this.color=hashOrder[connTreeHash(this.connTree)%12]!

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

    checkValid(root:string, nodes:NodeGroup, env:BoardEnv) {
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
            const mousePos = env.mouse.pos.sub(env.board.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize);
            if(this.nodes.some(node => node.custom.pos.distTo(mousePos) < 0.5)){
                this.onMouse = env.mouse.pos.sub(this.getNodePos(
                    this.getRoot(historicalNodes), env, historicalNodes))
                    .sub(env.board.getAbsolutePos());
                return SelectableElement.CLICK.PICKUP;
            }
        }
        return SelectableElement.CLICK.NONE;
    }

    isEditing(nodes:NodeGroup, env:BoardRenderEnv, historicalNodes:NodeGroup) {
        if (env.mouse.clickedRight) {
            const mousePos = env.mouse.pos.sub(env.board.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize);

            return this.nodes.some(node => node.custom.pos.distTo(mousePos) < 0.5);
        }
        return false;
    }

    tryPlace(nodes:NodeGroup, env:BoardRenderEnv) {
        if (env.mouse.clickedLeft) {
            const mousePos = env.mouse.pos.sub(env.board.getAbsolutePos())
                .sub(this.onMouse || new Vector(0, 0));//.scale(1 / env.drawData.nodeSize);

            const clickedNode = Object.values(env.board.getNodes())
                .map(node => [env.drawData.nodeToTexPos(node).distTo(mousePos), node] as [number, Node<any, any>])
                .sort((n1,n2)=>n1[0]-n2[0])[0]?.[1];
            if (clickedNode === undefined) return false;

            if (this.checkValid(clickedNode.id, nodes, env)) {
                this.root = clickedNode.id;
                this.onMouse = false;
                return true;
            }
        }
        return false;
    }

    palette(){
        return [];
    }

    settings() {
        return [];
    }
}

export default OminoEl;
