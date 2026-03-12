import Vector from "omino/Vector.js";
import {o} from "omino/Main.js";
import {DimsScene} from "omino/scene/Scene.js";
import {fill} from "omino/Colors.js";
import events from "omino/Events.js";
import type Node from "omino/pathfinding/Node.js";
import type Scene from "omino/scene/Scene.js";
import type {BoardContainer} from "omino/scene/MainScene.js";
import type Board from "omino/Board.js";
import type {OType} from "omino/pathfinding/orientation/Orientation.js";
import type {AnyEnhancedEnv, EnhancedEnv} from "omino/EnvHelper.js";
import data from "omino/Global.js";
import type {SettingData} from "omino/scene/SettingsParser.js";

export type NodeGroup<OrienType extends OType=any,Custom=any> = {[key:string]:Node<OrienType, Custom>};
export type Env = {
    elements: Element[],
    board:Board,
}
export type RenderEnv = Env & {
    drawData: {
        nodeToTexPos: (node:Node<any, any>) => Vector,
        context: AnyEnhancedEnv,
        nodeSize: number,
        notifyTexture: () => void,
    },
    container: BoardContainer,
    board: Board,
    mouse: {
        dragging: false|{
            orig:Vector,
            curr:Vector,
            delta:Vector,
        },
        clickedLeft: boolean,
        clickedRight: boolean,
        pos: Vector,
    },
    cursor: {
        heldElement: Element|undefined,
    }
}

interface Pass<ReturnType=ApplyData, E=Env>{
    func:(nodes:NodeGroup, env:E, historicalNodes:NodeGroup)=>ReturnType|void;
    order:number
}
export interface RenderPass extends Pass<void, RenderEnv>{}

abstract class Element {
    public readonly applyPasses:Pass[];
    public readonly renderPasses:RenderPass[];
    public needsUpdate=false
    public invalid=false
    public readonly center = new Vector(0,0);

    constructor(applyPasses:Pass[], renderPasses:RenderPass[]) {
        this.applyPasses=applyPasses;
        this.renderPasses=renderPasses;
    }
    abstract settings(nodes:NodeGroup, env:Env, historicalNodes:NodeGroup):SettingData<any>[];
    abstract palette(nodes:NodeGroup, env:Env, historicalNodes:NodeGroup):
        {el:((nodes:NodeGroup, env:Env, historicalNodes:NodeGroup)=>Element), draw:(env:AnyEnhancedEnv)=>void}[];
    infoTextPass(env:Env){ return ""; }

    static apply(elements:Element[], env:Env, historicalNodes:NodeGroup = {}){
        const newEnv:Env = {
            ...env,
            elements
        };
        let nodes:NodeGroup = {};

        let passes = elements.map(e => e.applyPasses.map(pass=>o({e, pass}))).flat()
            .toSorted((p1, p2) => p1.pass.order - p2.pass.order);

        for (let passData of passes) {
            let data = passData.pass.func(nodes, newEnv, historicalNodes);
            if(passData.e.invalid){
                newEnv.elements.splice(newEnv.elements.indexOf(passData.e),1);
                break;
            }

            if (data) {
                for(const nodeName in data.added){
                    nodes[data.added[nodeName]!.id] = data.added[nodeName]!;
                    historicalNodes[data.added[nodeName]!.id] = data.added[nodeName]!;
                }
                for (const id of Object.keys(data.removed)) delete nodes[id];
            }
        }
        return nodes;
    }
    static render(elements:Element[], nodes:NodeGroup, historicalNodes:NodeGroup, env:RenderEnv){
        Object.assign(env, {
            drawData: {
                nodeToTexPos: () => new Vector(0, 0),
                context: data.env,
                nodeSize: 0,
                notifyTexture: () => {},
            },
            elements: elements,
        });

        let passes = elements.map(e => e.renderPasses).flat().toSorted((p1, p2) => p1.order - p2.order);

        for (let pass of passes) {
            pass.func(nodes, env, historicalNodes);
        }
    }
    // static applyAndRender(elements:Element[], applyEnv, renderEnv = applyEnv){
    //     const historicalNodes = {};
    //     let nodes = Element.apply(elements, applyEnv, historicalNodes);
    //     Element.render(elements, nodes, historicalNodes, renderEnv);
    //     return {nodes, historicalNodes};
    // }

    static infoText(elements:Element[], env:Env){
        Object.assign(env, {
            elements: elements
        });
        let text=[];
        for (let el of elements) {
            text.push(el.infoTextPass(env));
        }
        return text.filter(t=>!!t).join(" ");
    }

}

abstract class SelectableElement extends Element {
    protected onMouse:false|Vector=false;
    public forceSelected=false;

    isSelected(nodes:NodeGroup, env:RenderEnv, historicalNodes:NodeGroup) {
        return SelectableElement.CLICK.NONE;
    }

    tryPlace(nodes:NodeGroup, env:Env, historicalNodes:NodeGroup) {
        return false;
    }

    drawAtMouse(nodes:NodeGroup, env:RenderEnv, historicalNodes:NodeGroup) {

    }
}
namespace SelectableElement{
    export enum CLICK{
        PICKUP,
        CONSUME,
        NONE
    }
}

class EditableDialog extends DimsScene<any>{
    visible=false;
    pointerOffs=0;

    declare subScenes:DimsScene<any>[];

    addScene<T extends Scene<any>>(scene:T) {
        super.addScene(scene);

        const dims = new Vector(0,10);
        for(const el of this.subScenes){
            dims.x = Math.max(dims.x, el.dims.x+10);
        }
        for(const el of this.subScenes){
            el.pos.replace(dims.x/2-el.dims.x/2, dims.y);
            dims.y += el.dims.y + 5;
        }
        this.dims.replace(dims);
        this.resized(this.dims, dims);

        return scene;
    }

    render(env:AnyEnhancedEnv) {
        fill("elementDialog.bg", env);
        env.sRect(0,5,this.dims.x,this.dims.y-5, 5);
        env.fill();
        env.beginPath();
        env.moveTo(this.dims.x/2+this.pointerOffs, 0);
        env.lineTo(this.dims.x/2-6+this.pointerOffs, 6);
        env.lineTo(this.dims.x/2+6+this.pointerOffs, 6);
        env.fill();
        super.render(env);
    }

    mouseUp(x:number, y:number, button:number) {
        if(!this.visible) return false;
        return super.mouseUp(x-this.getAbsolutePos().x,y-this.getAbsolutePos().y, button)
    }
    mouseDown(x:number, y:number, button:number) {
        if(!this.visible) return false;
        return super.mouseDown(x-this.getAbsolutePos().x,y-this.getAbsolutePos().y, button)
    }
    scrolled(x:number, y:number, delta:number) {
        if(!this.visible) return false;
        return super.scrolled(x-this.getAbsolutePos().x,y-this.getAbsolutePos().y, delta)
    }
    keyPressed(key: string): boolean {
        if(!this.visible) return false;
        return super.keyPressed(key);
    }
    keyReleased(key: string): boolean {
        if(!this.visible) return false;
        return super.keyReleased(key);
    }
}
let editableElementDialog:EditableDialog|undefined = undefined;
events.loaded.on(()=>{
    data.listeners.keyDown.push((key:string)=>editableElementDialog?.keyPressed(key));
    data.listeners.keyUp.push((key:string)=>editableElementDialog?.keyReleased(key));
    data.listeners.mouseDown.push((x:number,y:number, button:number)=>editableElementDialog?.mouseDown(x,y, button));
    data.listeners.mouseUp.push((x:number,y:number, button:number)=>editableElementDialog?.mouseUp(x,y, button));
    data.listeners.scroll.push((x:number,y:number,delta:number)=>editableElementDialog?.scrolled(x,y,delta)??false);
});
abstract class EditableElement extends SelectableElement {
    protected editing=false;
    protected editDialog = new EditableDialog();

    edit(env:Env){
        this.editing=true;
        for(const element of env.elements){
            if(element!==this && element instanceof EditableElement && element.editing)
                element.finishEdit();
        }
        editableElementDialog=this.editDialog;
        this.editDialog.visible=true;
    }
    finishEdit(){
        this.editDialog.visible=false;
        this.editing=false;
    }
    isEditing(nodes:NodeGroup, env:RenderEnv, historicalNodes:NodeGroup) {
        return false;
    }
    shouldUnselect(nodes:NodeGroup, env:RenderEnv, historicalNodes:NodeGroup){
        if(this.editing && this.editDialog.isIn()) return false;
        return env.mouse.clickedLeft;
    }

    static createDialogPass(self:EditableElement, posFunc:((nodes:NodeGroup, env:RenderEnv, historicalNodes:NodeGroup)=>Vector)):RenderPass{
        return {
            func:(nodes, env, historicalNodes) => {
                if(self.shouldUnselect(nodes, env, historicalNodes)) self.finishEdit();
                if(self.isEditing(nodes, env, historicalNodes)) self.edit(env);

                if(self.editing){
                    const pos = posFunc(nodes, env, historicalNodes);
                    env.drawData.context.save();
                    let origCenterX=pos.x - self.editDialog.dims.x/2;
                    let offs = new Vector(Math.max(0,origCenterX),pos.y);
                    self.editDialog.pos.replace(offs);
                    env.drawData.context.translate(offs.x,offs.y);//todo: snap to right edge as well
                    self.editDialog.getAbsolutePos = ()=> offs.add(env.container.pos);
                    self.editDialog.pointerOffs=Math.min(0,origCenterX);
                    self.editDialog.render(env.drawData.context);
                    env.drawData.context.restore();
                }
            },
            order:1000
        }
    }
}

class ApplyData {
    public readonly added:{[key:number]:Node<any, any>} = {};
    public readonly removed:{[key:number]:Node<any, any>} = {};
    constructor({added = new Set(), removed = new Set()}:{added?:Set<Node<any, any>>, removed?:Set<Node<any, any>>} = {}) {
        this.added = {};
        for (const node of added) this.added[node.id] = node;
        this.removed = {};
        for (const node of removed) this.removed[node.id] = node;
    }

    add(node:Node<any, any>) {
        this.added[node.id] = node;
        return this;
    }

    remove(node:Node<any, any>) {
        this.removed[node.id] = node;
        return this;
    }
}

export default Element;
export {
    Element, type Pass, ApplyData,
    SelectableElement, EditableElement
};
