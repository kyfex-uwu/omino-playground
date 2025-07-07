import {EditableElement, Pass, SelectableElement} from "/assets/omino/pathfinding/elements/Element.js";
import {fill} from "/assets/omino/Colors.js";
import Vector from "/assets/omino/Vector.js";
import TextInputScene from "/assets/omino/scene/utils/TextInputScene.js";
import {focus} from "/assets/omino/scene/Scene.js";

const portalDir = "portalEl-dir";
const colors="ILYWVTPNFXZU".split("");

class PortalEl extends EditableElement {
    constructor(root, id) {
        super();
        this.root = root;
        this.setId(id);

        this.idInput = new TextInputScene({value:this.id});
        this.idInput.dims = new Vector(150,20);
        this.idInput.addListener(newId => this.setId(newId));
        this.editDialog.addScene(this.idInput);

        this.applyPasses = [new Pass(-1, (nodes, env) => {
            if(nodes[this.root] === undefined) this.invalid=true;
        }), new Pass(0, (nodes, env) => {
            let selfNode = nodes[this.root].getView();

            for (const element of env.elements) {
                if (!(element instanceof PortalEl)) continue;
                if (element.id !== this.id || element.root === this.root) continue;

                selfNode.connectNode(portalDir, portalDir, nodes[element.root]);
            }
        })];
        this.renderPasses = [new Pass(0, (...args) => this.draw(...args)),
            EditableElement.createDialogPass(this, (nodes, env) =>
                env.drawData.nodeToTexPos(nodes[this.root]).add(env.drawData.nodeSize / 2, env.drawData.nodeSize / 2))];
    }
    setId(newId){
        this.id=newId;
        this.hashColor = this.idToColor();
        this.needsUpdate=true;
    }
    idToColor(){
        let hash = 0;
        for (let i = 0; i < this.id.length; i++) {
            let chr = this.id.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return colors[Math.abs(hash)%colors.length];
    }

    draw(nodes, env, _) {
        let size = env.drawData.nodeSize;

        let pos = env.drawData.nodeToTexPos(nodes[this.root]).add(env.drawData.nodeSize / 2, env.drawData.nodeSize / 2);
        if (this.onMouse && env.cursor.heldElement === this)
            pos = env.mouse.pos.sub(env.container.getAbsolutePos().add(this.onMouse || new Vector(0, 0)));

        fill("ominoColors."+this.hashColor, env.drawData.context);
        env.drawData.context.ellipse(pos.x, pos.y, size * 0.88);
        for (let i = (p5.frameCount * 0.01) % 1; i < 3; i++) {
            env.drawData.context.fill(255, i * 50);
            env.drawData.context.ellipse(pos.x, pos.y, size * 0.88 * (3 - i) / 3);
        }
    }

    isSelected(nodes, env, historicalNodes) {
        if(this.editing && env.mouse.clicked && p5.mouseButton === p5.LEFT){
            return SelectableElement.CLICK.CONSUME;
        }

        if (env.mouse.clicked && p5.mouseButton === p5.LEFT) {
            let cellPos = env.mouse.pos.sub(env.container.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize);

            let node = Object.values(historicalNodes).find(n => n.custom.pos.equals(cellPos.floor()));
            if (node && this.root === node.id) {
                this.onMouse = env.mouse.pos.sub(env.drawData.nodeToTexPos(nodes[this.root]))
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
            return node && this.root === node.id;
        }
        return false;
    }
    edit(env){
        super.edit(env);

        focus(this.idInput);
    }

    tryPlace(nodes, env) {
        if (env.mouse.clicked) {
            let cellPos = env.mouse.pos.sub(env.container.getAbsolutePos())
                .sub(this.onMouse || new Vector(0, 0)).scale(1 / env.drawData.nodeSize).floor();

            let newRoot = Object.values(nodes).find(n => n.custom.pos.equals(cellPos));
            if (newRoot === undefined) return false;
            newRoot = newRoot.id;

            if (Object.values(nodes).find(n => n.id === newRoot)) {
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

export default PortalEl;
