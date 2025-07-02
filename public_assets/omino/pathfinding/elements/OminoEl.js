import {ApplyData, EditableElement, Pass, SelectableElement} from "/assets/omino/pathfinding/elements/Element.js";
import {fill, stroke} from "/assets/omino/Colors.js";
import Vector from "/assets/omino/Vector.js";
import PortalEl from "/assets/omino/pathfinding/elements/PortalEl.js";
import {DimsScene, OneTimeButtonScene} from "/assets/omino/scene/Scene.js";

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

const button = (click, icon) => new OneTimeButtonScene(self=>{
    fill("scenes.util.button."+(self.isIn()?"bgHover":"bg"));
    p5.rect(0,0,self.dims.x,self.dims.y,self.dims.x*0.1);
    fill("scenes.util.button.color");
    p5.push();
    p5.translate(20,20);
    p5.scale(0.8);
    icon();
    p5.pop();
},click,self => {
    self.dims = new Vector(40,40);
});
const buttonBar = (b1,b2) => {
    const toReturn = new DimsScene();
    toReturn.dims = new Vector(85,40);
    toReturn.addScene(b1).pos = new Vector(0,0);
    toReturn.addScene(b2).pos = new Vector(45,0);
    return toReturn;
}

const rotateShape = _=>{
    p5.beginShape();
    p5.vertex(10,10);
    p5.vertex(15,15);
    p5.bezierVertex(23,7,23,-7,15,-15);
    p5.bezierVertex(7,-23,-7,-23,-15,-15);
    p5.bezierVertex(-23,-7,-23,7,-15,15);
    p5.vertex(-18,18);
    p5.vertex(-7,18);
    p5.vertex(-7,7);
    p5.vertex(-10,10);
    p5.bezierVertex(-15,5,-15,-5,-10,-10);
    p5.bezierVertex(-5,-15,5,-15,10,-10);
    p5.bezierVertex(15,-5,15,5,10,10);
    p5.endShape();
};

class OminoEl extends EditableElement {
    constructor(connTree, root, orientation) {
        super();
        this.connTree = connTree;
        this.root = root;
        this.orientation = orientation;

        this.nodes = [];

        this.forceSelected=false;
        this.rotateLeft = button(_=>{
            this.forceSelected=true;

        },_=>{
            rotateShape();
        });
        this.rotateRight = button(_=>{

            this.forceSelected=true;
        },_=>{
            p5.scale(-1,1);
            rotateShape();
        });
        this.flipH = button(_=>{

            this.forceSelected=true;
        },_=>{
            p5.rect(-2,-13,4,26);
            p5.triangle(-6,-12,6,-12,0,-19);
            p5.triangle(-6,12,6,12,0,19);
        });
        this.flipV = button(_=>{

            this.forceSelected=true;
        },_=>{
            p5.rect(-2,-13,4,26);
            p5.triangle(-6,-12,6,-12,0,-19);
            p5.triangle(-6,12,6,12,0,19);
        });
        this.editDialog.addScene(buttonBar(this.rotateLeft, this.rotateRight));
        this.editDialog.addScene(buttonBar(this.flipH, this.flipV));

        //note: this assumes the omino is in a valid spot!! it will not check if it can it just does
        this.applyPasses = [new Pass(-1, (nodes, env) => {
            if(this.getRoot(nodes) === undefined ||
                !getNodes(this.getRoot(nodes).getView(this.orientation), this.connTree, nodes)) this.invalid=true;
        }), new Pass(0, (nodes, env) => {
            let allNodes = getNodes(this.getRoot(nodes).getView(this.orientation), this.connTree, nodes);

            this.nodes = [];
            for (const node of allNodes) {
                this.nodes.push(node);
                node.detach();
            }
            return new ApplyData({removed: allNodes});
        })];
        this.renderPasses = [new Pass(0, (...args) => this.draw(...args)),
            EditableElement.createDialogPass(this, (nodes, env, historicalNodes) =>
                env.drawData.nodeToTexPos(historicalNodes[this.root]).add(env.drawData.nodeSize / 2, env.drawData.nodeSize / 2))];//todo: change pos
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

    drawNode(env, pos, _, mouse) {
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
        if (this.onMouse && env.cursor.heldElement === this) {
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
        if(this.forceSelected){
            this.forceSelected=false;
            return SelectableElement.CLICK.PICKUP;
        }
        if(this.editing && env.mouse.clicked && p5.mouseButton === p5.LEFT){
            return SelectableElement.CLICK.CONSUME;
        }

        if (env.mouse.clicked && p5.mouseButton === p5.LEFT) {
            let cellPos = env.mouse.pos.sub(env.container.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize)

            let node = Object.values(historicalNodes).find(n => n.custom.pos.equals(cellPos.floor()));
            if (node && this.nodes.some(n => n.id === node.id)) {
                this.onMouse = env.mouse.pos.sub(this.getNodePos(
                    this.getRoot(historicalNodes), env, historicalNodes))
                    .sub(env.drawData.nodeSize / 2, env.drawData.nodeSize / 2)
                    .sub(env.container.getAbsolutePos());
                return SelectableElement.CLICK.PICKUP;
            }
        }
        return SelectableElement.CLICK.NONE;
    }

    isEditing(nodes, env, historicalNodes) {
        if (env.mouse.clicked && p5.mouseButton === p5.RIGHT) {
            let cellPos = env.mouse.pos.sub(env.container.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize);

            let node = Object.values(historicalNodes).find(n => n.custom.pos.equals(cellPos.floor()));
            return node && this.nodes.some(n => n.id === node.id);
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
