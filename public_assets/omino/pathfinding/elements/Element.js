import Vector from "/assets/omino/Vector.js";
import data, {o} from "/assets/omino/Main.js";
import {DimsScene} from "/assets/omino/scene/Scene.js";
import {fill} from "/assets/omino/Colors.js";
import events from "/assets/omino/Events.js";

class Pass {
    constructor(order, func) {
        this.func = func;
        this.order = order;
    }
}

class Element {
    constructor() {
        this.applyPasses = [];
        this.renderPasses = [];

        this.needsUpdate=false;
        this.invalid=false;
    }

    settings() {
    }

    palette() {
    }

    infoTextPass(){
    }
}

class SelectableElement extends Element {
    constructor() {
        super();
        this.onMouse = false;
    }

    isSelected(nodes, env, historicalNodes) {
        return SelectableElement.CLICK.NONE;
    }

    tryPlace(nodes, env, historicalNodes) {
        return false;
    }

    drawAtMouse(nodes, env, historicalNodes) {

    }
}
SelectableElement.CLICK = {
    PICKUP:0,
    CONSUME:1,
    NONE:2
};
class EditableDialog extends DimsScene{
    constructor(){
        super();
    }

    addScene(scene) {
        super.addScene(scene);

        let dims = new Vector(0,10);
        for(const el of this.subScenes){
            if(!(el instanceof DimsScene)) continue;
            dims.x = Math.max(dims.x, el.dims.x+10);
        }
        for(const el of this.subScenes){
            if(!(el instanceof DimsScene)) continue;
            el.pos = new Vector(dims.x/2-el.dims.x/2, dims.y);
            dims.y += el.dims.y + 5;
        }
        this.dims=dims;
        this.resized(this.dims, dims);
    }

    render(env, pointerOffs) {
        fill("elementDialog.bg", env.drawData.context);
        env.drawData.context.rect(0,5,this.dims.x,this.dims.y-5, 5);
        env.drawData.context.triangle(
            this.dims.x/2+pointerOffs, 0,
            this.dims.x/2-6+pointerOffs, 6,
            this.dims.x/2+6+pointerOffs, 6);
        super.render();
    }

    mouseUp(x, y) {
        return super.mouseUp(x-this.getAbsolutePos().x,y-this.getAbsolutePos().y)
    }
    mouseDown(x, y) {
        return super.mouseDown(x-this.getAbsolutePos().x,y-this.getAbsolutePos().y)
    }
    scrolled(x, y, delta) {
        return super.scrolled(x-this.getAbsolutePos().x,y-this.getAbsolutePos().y, delta)
    }
}
let editableElementDialog = undefined;
events.loaded.on(_=>{
    data.listeners.keyDown.push((key)=>editableElementDialog?.keyPressed(key));
    data.listeners.keyUp.push((key)=>editableElementDialog?.keyReleased(key));
    data.listeners.mouseDown.push((x,y)=>editableElementDialog?.mouseDown(x,y));
    data.listeners.mouseUp.push((x,y)=>editableElementDialog?.mouseUp(x,y));
    data.listeners.scroll.push((x,y,delta)=>editableElementDialog?.scrolled(x,y,delta));
});
class EditableElement extends SelectableElement {
    constructor() {
        super();
        this.editing=false;

        this.editDialog = new EditableDialog();
    }

    edit(env){
        this.editing=true;
        for(const element of env.elements){
            if(element!==this && element instanceof EditableElement && element.editing)
                element.finishEdit();
        }
        editableElementDialog=this.editDialog;
    }
    finishEdit(){
        this.editing=false;
    }
    isEditing(nodes, env, historicalNodes) {
        return false;
    }
    shouldUnselect(nodes, env, historicalNodes){
        if(this.editing && this.editDialog.isIn()) return false;
        return env.mouse.clicked;
    }


}
EditableElement.createDialogPass = (self, posFunc) => {
    self.posFunc = posFunc;

    return new Pass(1000, (nodes, env, historicalNodes) => {

        if(self.shouldUnselect(nodes, env, historicalNodes)) self.finishEdit();
        if(self.isEditing(nodes, env, historicalNodes)) self.edit(env);

        if(self.editing){
            const pos = self.posFunc(nodes, env, historicalNodes);
            env.drawData.context.push();
            let origCenterX=pos.x - self.editDialog.dims.x/2;
            let offs = new Vector(Math.max(0,origCenterX),pos.y);
            self.editDialog.pos = offs;
            env.drawData.context.translate(offs.x,offs.y);//todo: snap to right edge as well
            self.editDialog.getAbsolutePos = _=> offs.add(env.container.pos);
            self.editDialog.render(env,Math.min(0,origCenterX));
            env.drawData.context.pop();
        }
    })
}

Element.apply = (elements, env = {}, historicalNodes = {}) => {
    Object.assign(env, {
        elements: elements
    });
    let nodes = {};

    let passes = elements.map(e => e.applyPasses.map(pass=>o({e, pass}))).flat()
        .toSorted((p1, p2) => p1.pass.order - p2.pass.order);

    for (let passData of passes) {
        let data = passData.pass.func(nodes, env);
        if(passData.e.invalid){
            env.elements.splice(env.elements.indexOf(passData.e),1);
            break;
        }

        if (data) {
            for (const node of Object.values(data.added)) {
                nodes[node.id] = node;
                historicalNodes[node.id] = node;
            }
            for (const id of Object.keys(data.removed)) delete nodes[id];
        }
    }
    return nodes;
}
Element.render = (elements, nodes, historicalNodes, env = {}) => {
    Object.assign(env, {
        drawData: {
            nodeToTexPos: n => new Vector(0, 0),
            context: p5,
            nodeSize: 0,
            notifyTexture: _ => {
            },
        },
        elements: elements,
    });

    let passes = elements.map(e => e.renderPasses).flat().toSorted((p1, p2) => p1.order - p2.order);

    for (let pass of passes) {
        pass.func(nodes, env, historicalNodes);
    }
}
Element.applyAndRender = (elements, applyEnv, renderEnv = applyEnv) => {
    const historicalNodes = {};
    let nodes = Element.apply(elements, applyEnv, historicalNodes);
    Element.render(elements, nodes, historicalNodes, renderEnv);
    return {nodes, historicalNodes};
}

Element.infoText = (elements, env = {}) => {
    Object.assign(env, {
        elements: elements
    });
    let text=[];
    for (let el of elements) {
        text.push(el.infoTextPass(env));
    }
    return text.filter(t=>!!t).join(" ");
}

class ApplyData {
    constructor({added = [], removed = []} = {}) {
        this.added = {};
        for (const node of added) this.added[node.id] = node;
        this.removed = {};
        for (const node of removed) this.removed[node.id] = node;
    }

    add(node) {
        this.added[node.id] = node;
        return this;
    }

    remove(node) {
        this.removed[node.id] = node;
        return this;
    }
}

export default Element;
export {
    Element, Pass, ApplyData,
    SelectableElement, EditableElement
};
