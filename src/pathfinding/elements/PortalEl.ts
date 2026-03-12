import element, {
    EditableElement, Element, type Env,
    type NodeGroup,
    type RenderEnv, type RenderPass,
    SelectableElement
} from "omino/pathfinding/elements/Element.js";
import {fill} from "omino/Colors.js";
import Vector from "omino/Vector.js";
import TextInputScene from "omino/scene/utils/TextInputScene.js";
import {focus} from "omino/scene/Scene.js";
import data from "omino/Global.js"
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

const portalDir = "portalEl-dir";
const colors="ILYWVTPNFXZU".split("");

class PortalEl extends EditableElement {
    public root:number;
    private id:string;
    private hashColor:string="I";

    private readonly idInput:TextInputScene;

    constructor(root:number, group:string) {
        let renderPasses:RenderPass[] = [];
        super([{order:-1, func:(nodes, env) => {
            if(nodes[this.root] === undefined) this.invalid=true;
        }}, {order:0, func:(nodes, env) => {
            let selfNode = nodes[this.root]?.getView();
            if(selfNode === undefined){
                return;
            }

            for (const element of env.elements) {
                if (!(element instanceof PortalEl)) continue;
                if (element.id !== this.id || element.root === this.root) continue;

                selfNode.connectNode(portalDir, portalDir, nodes[element.root]!);
            }
        }}], renderPasses);
        renderPasses.push({order:0, func:(...args) => this.draw(...args)},
            EditableElement.createDialogPass(this, (nodes, env) =>
                env.drawData.nodeToTexPos(nodes[this.root]!).add(env.drawData.nodeSize / 2, env.drawData.nodeSize / 2)));

        this.root = root;
        this.id=group;
        this.setId(group);

        this.idInput = new TextInputScene({value:this.id});
        this.idInput.dims.replace(150,20);
        this.idInput.addListener((newId:string) => {
            this.setId(newId)
        });
        this.editDialog.addScene(this.idInput);
    }
    setId(newId:string){
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
        return colors[Math.abs(hash)%colors.length]!;
    }

    draw(nodes:NodeGroup, env:RenderEnv, _historicalNodes:NodeGroup) {
        let size = env.drawData.nodeSize;

        let pos = env.drawData.nodeToTexPos(nodes[this.root]!).add(env.drawData.nodeSize / 2, env.drawData.nodeSize / 2);
        if (this.onMouse && env.cursor.heldElement === this)
            pos = env.mouse.pos.sub(env.container.getAbsolutePos().add(this.onMouse || new Vector(0, 0)));

        fill("ominoColors."+this.hashColor, env.drawData.context);
        env.drawData.context.beginPath();
        env.drawData.context.ellipse(pos.x, pos.y, size * 0.44, size*0.44, 0, 0, 6.29);
        env.drawData.context.fill();
        for (let i = (data.elapsed * 0.0007) % 1; i < 3; i++) {
            env.drawData.context.fillStyle = `rgba(255,255,255,${(1-Math.sin(i*2.09+1.5))*20}%)`;
            const centerSize = size * 0.88 * (3 - i) / 6;
            env.drawData.context.beginPath();
            env.drawData.context.ellipse(pos.x, pos.y, centerSize, centerSize, 0, 0, 6.29);
            env.drawData.context.fill();
        }
    }

    isSelected(nodes:NodeGroup, env:RenderEnv, historicalNodes:NodeGroup<any,{pos:Vector}>) {
        if(this.editing && env.mouse.clickedLeft){
            return SelectableElement.CLICK.CONSUME;
        }

        if (env.mouse.clickedLeft) {
            let cellPos = env.mouse.pos.sub(env.container.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize);

            let node = Object.values(historicalNodes).find(n => n.custom.pos.equals(cellPos.floor()));
            if (node && this.root === node.id) {
                this.onMouse = env.mouse.pos.sub(env.drawData.nodeToTexPos(nodes[this.root]!))
                    .sub(env.drawData.nodeSize / 2, env.drawData.nodeSize / 2)
                    .sub(env.container.getAbsolutePos());
                return SelectableElement.CLICK.PICKUP;
            }
        }
        return SelectableElement.CLICK.NONE;
    }
    isEditing(_nodes:NodeGroup, env:RenderEnv, historicalNodes:NodeGroup<any,{pos:Vector}>) {
        if (env.mouse.clickedRight) {
            let cellPos = env.mouse.pos.sub(env.container.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize);

            let node = Object.values(historicalNodes).find(n => n.custom.pos.equals(cellPos.floor()));
            return !!node && this.root === node.id;
        }
        return false;
    }
    edit(env:Env){
        super.edit(env);

        focus(this.idInput);
    }

    tryPlace(nodes:NodeGroup<any,{pos:Vector}>, env:RenderEnv) {
        if (env.mouse.clickedLeft) {
            let cellPos = env.mouse.pos.sub(env.container.getAbsolutePos())
                .sub(this.onMouse || new Vector(0, 0)).scale(1 / env.drawData.nodeSize).floor();

            let newRoot = Object.values(nodes).find(n => n.custom.pos.equals(cellPos));
            if (newRoot === undefined) return false;

            if (Object.values(nodes).find(n => n.id === newRoot.id)) {
                this.root = newRoot.id;
                this.onMouse = false;
                return true;
            }
        }
        return false;
    }

    drawAtMouse(nodes:NodeGroup, env:RenderEnv, historicalNodes:NodeGroup) {
        this.draw(nodes, env, historicalNodes);
    }

    palette(nodes: NodeGroup, env: Env, historicalNodes: NodeGroup){
        return [];
    }

    settings(nodes: NodeGroup, env: Env, historicalNodes: NodeGroup) {
        return [];
    }
}

export default PortalEl;
