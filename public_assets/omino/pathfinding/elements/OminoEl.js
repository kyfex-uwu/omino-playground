import {ApplyData, Pass, SelectableElement} from "/assets/omino/pathfinding/elements/Element.js";
import {fill, stroke} from "/assets/omino/Colors.js";
import Vector from "/assets/omino/Vector.js";
import PortalEl from "/assets/omino/pathfinding/elements/PortalEl.js";

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

function getNodes(currNodeView, connTree, nodes, toReturn = new Set()) {
    if (!currNodeView) return false;

    toReturn.add(currNodeView.node);

    for (const [key, val] of Object.entries(connTree)) {
        //TODO: this just assumes the next node is the same type as this one
        if (!getNodes(currNodeView.get(parseInt(key)), val, nodes, toReturn)) return false;
    }

    return toReturn;
}

class OminoEl extends SelectableElement {
    constructor(connTree, root, orientation) {
        super();
        this.connTree = connTree;
        this.root = root;
        this.orientation = orientation;

        this.nodes = [];

        //note: this assumes the omino is in a valid spot!! it will not check if it can it just does

        this.applyPasses = [new Pass(0, (nodes, env) => {
            let allNodes = getNodes(this.getRoot(nodes).getView(this.orientation), this.connTree, nodes);

            this.nodes = [];
            for (const node of allNodes) {
                this.nodes.push(node);
                node.detach();
            }
            return new ApplyData({removed: allNodes});
        })];
        this.renderPasses = [new Pass(0, (...args) => this.draw(...args))];
    }

    draw(nodes, env, historicalNodes) {
        let size = env.drawData.nodeSize;

        env.drawData.context.push();
        fill("ominoColors.I", env.drawData.context);
        env.drawData.context.strokeWeight(size * 0.88);
        for (const node of this.nodes) {
            let pos = this.getNodePos(node, env, historicalNodes);

            this.drawNode(env, pos);

            stroke("ominoColors.I", env.drawData.context);
            for (const connected of Object.values(node.historicalConnections)) {
                if (this.nodes.some(n => n.id == connected.node.id) && connected.node.id > node.id) {
                    let otherPos = this.getNodePos(connected.node, env, historicalNodes);
                    env.drawData.context.line(
                        (pos.x / size + 0.5) * size, (pos.y / size + 0.5) * size,
                        (otherPos.x / size + 0.5) * size, (otherPos.y / size + 0.5) * size);
                }
            }
        }
        env.drawData.context.pop();
        env.drawData.notifyTexture();
    }

    drawNode(env, pos) {
        env.drawData.context.noStroke();
        env.drawData.context.rect(
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

    getNodePos(node, env, historicalNodes) {
        if (this.onMouse) {
            return env.mouse.pos.sub(env.container.getAbsolutePos())
                .sub(env.drawData.nodeToTexPos(this.getRoot(historicalNodes)))
                .sub(env.drawData.nodeSize / 2, env.drawData.nodeSize / 2)
                .sub(this.onMouse || new Vector(0, 0))
                .add(node.custom.pos.scale(env.drawData.nodeSize));
        }
        return env.drawData.nodeToTexPos(node);
    }

    getRoot(nodes) {//check if you need historicalNodes if youre running into a problem here
        return nodes[this.root];
    }

    isMyNode(id) {
        return this.nodes.includes(id);
    }

    checkValid(root, nodes, env) {
        const rootNode = Object.values(nodes).find(n => n.id === root);
        if (!rootNode) return false;
        const nodesToCheck = getNodes(rootNode.getView(this.orientation),
            this.connTree, nodes);
        if(nodesToCheck!==false){
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

    isSelected(nodes, env, historicalNodes) {
        if (env.mouse.clicked) {
            let cellPos = env.mouse.pos.sub(env.container.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize)

            let node = Object.values(historicalNodes).find(n => n.custom.pos.equals(cellPos.floor()));
            if (node && this.nodes.some(n => n.id == node.id)) {
                this.onMouse = env.mouse.pos.sub(this.getNodePos(
                    this.getRoot(historicalNodes), env, historicalNodes))
                    .sub(env.drawData.nodeSize / 2, env.drawData.nodeSize / 2)
                    .sub(env.container.getAbsolutePos());
                return true;
            }
        }
        return false;
    }

    tryPlace(nodes, env) {
        if (env.mouse.clicked) {
            let cellPos = env.mouse.pos.sub(env.container.getAbsolutePos())
                .sub(this.onMouse || new Vector(0, 0)).scale(1 / env.drawData.nodeSize).floor();

            let newRoot = Object.values(nodes).find(n => n.custom.pos.equals(cellPos));
            if (newRoot == undefined) return false;
            newRoot = newRoot.id;

            if (this.checkValid(newRoot, nodes, env)) {
                this.root = newRoot;
                this.onMouse = false;
                return true;
            }
        }
        return false;
    }

    drawAtMouse(_, env, historicalNodes) {
        this.draw(_, env, historicalNodes);
    }
}

OminoEl.factory = connTree => (root, orientation) => new OminoEl(connTree, root, orientation);

export default OminoEl;
