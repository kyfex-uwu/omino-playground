import {
    EditableElement,
    type BoardEnv,
    type NodeGroup,
    type BoardRenderEnv,
    type RenderPass,
    SelectableElement
} from "omino/pathfinding/elements/Element.js";
import {fill} from "omino/Colors.js";
import Vector from "omino/Vector.js";
import TextInputScene from "omino/scene/utils/TextInputScene.js";
import {focus} from "omino/scene/Scene.js";
import data from "omino/Global.js"
import type Node from "omino/pathfinding/Node.js";

const portalDir = "portalEl-dir";
const colors="ILYWVTPNFXZU".split("");

class PortalEl extends EditableElement {
    public root:string;
    private id:string;
    private hashColor:string="I";

    private readonly idInput:TextInputScene;

    constructor(root:string, group:string) {
        let renderPasses:RenderPass[] = [];
        super([{order:-1, func:(nodes, env) => {
            if(nodes[this.root] === undefined) this.invalid=true;
        }}, {order:0, func:(nodes, env, historicalNodes) => {
            let selfNode = nodes[this.root]?.getView();
            if(selfNode === undefined){
                return;
            }

            for (const element of env.elements) {
                if (!(element instanceof PortalEl)) continue;
                if (element.id !== this.id || element.root === this.root) continue;

                selfNode.connectNode(portalDir+historicalNodes[element.root]!.id, portalDir+historicalNodes[this.root]!.id, nodes[element.root]!);
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

    draw(nodes:NodeGroup, env:BoardRenderEnv, _historicalNodes:NodeGroup) {
        let size = env.drawData.nodeSize;

        let pos = env.drawData.nodeToTexPos(nodes[this.root]!);
        if (this.onMouse && env.cursor.heldElement === this)
            pos = env.mouse.pos.sub(env.board.getAbsolutePos().add(this.onMouse || new Vector(0, 0)));

        env.drawData.context.save();
        env.drawData.context.translate(pos.x, pos.y);
        env.drawData.context.scale(size, size);
        PortalEl.draw(this.hashColor, env);
        env.drawData.context.restore();
    }
    static draw(color:string, env:BoardRenderEnv){
        fill("ominoColors."+color, env.drawData.context);
        env.drawData.context.beginPath();
        env.drawData.context.ellipse(0,0, 0.44, 0.44, 0, 0, 6.29);
        env.drawData.context.fill();
        for (let i = (data.elapsed * 0.0007) % 1; i < 3; i++) {
            env.drawData.context.fillStyle = `rgba(255,255,255,${(1-Math.sin(i*2.09+1.5))*20}%)`;
            const centerSize = 0.88 * (3 - i) / 6;
            env.drawData.context.beginPath();
            env.drawData.context.ellipse(0,0, centerSize, centerSize, 0, 0, 6.29);
            env.drawData.context.fill();
        }
    }

    isSelected(nodes:NodeGroup, env:BoardRenderEnv, historicalNodes:NodeGroup<any,{pos:Vector}>) {
        if(this.editing && env.mouse.clickedLeft){
            return SelectableElement.CLICK.CONSUME;
        }

        if (env.mouse.clickedLeft && env.mouse.pos.sub(env.board.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize).distTo(historicalNodes[this.root]!.custom.pos) < 0.5){
            this.onMouse = env.mouse.pos.sub(env.drawData.nodeToTexPos(nodes[this.root]!))
                .sub(env.board.getAbsolutePos());
            return SelectableElement.CLICK.PICKUP;
        }
        return SelectableElement.CLICK.NONE;
    }
    isEditing(_nodes:NodeGroup, env:BoardRenderEnv, historicalNodes:NodeGroup<any,{pos:Vector}>) {
        if (env.mouse.clickedRight) {
            let cellPos = env.mouse.pos.sub(env.board.getAbsolutePos())
                .scale(1 / env.drawData.nodeSize);

            let node = Object.values(historicalNodes).find(n => n.custom.pos.equals(cellPos.floor()));
            return !!node && this.root === node.id;
        }
        return false;
    }
    edit(env:BoardEnv){
        super.edit(env);

        focus(this.idInput);
    }

    tryPlace(nodes:NodeGroup<any,{pos:Vector}>, env:BoardRenderEnv) {
        if (env.mouse.clickedLeft) {
            const mousePos = env.mouse.pos.sub(env.board.getAbsolutePos())
                .sub(this.onMouse || new Vector(0, 0));//.scale(1 / env.drawData.nodeSize);

            const newRoot = Object.values(env.board.getNodes())
                .map(node => [env.drawData.nodeToTexPos(node).distTo(mousePos), node] as [number, Node<any, any>])
                .sort((n1,n2)=>n1[0]-n2[0])[0]?.[1];
            if (newRoot === undefined) return false;

            if (Object.values(nodes).find(n => n.id === newRoot.id)) {
                this.root = newRoot.id;
                this.onMouse = false;
                return true;
            }
        }
        return false;
    }

    drawAtMouse(nodes:NodeGroup, env:BoardRenderEnv, historicalNodes:NodeGroup) {
        this.draw(nodes, env, historicalNodes);
    }

    palette(nodes: NodeGroup, env: BoardEnv, historicalNodes: NodeGroup){
        return [];
    }

    settings(nodes: NodeGroup, env: BoardEnv, historicalNodes: NodeGroup) {
        return [];
    }
}

export default PortalEl;
