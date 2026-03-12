import Element, {type NodeGroup, type BoardRenderEnv, SelectableElement} from "omino/pathfinding/elements/Element.js";
import * as FakeWebWorker from "omino/pathfinding/Pathfinder.js";
import {DimsScene} from "omino/scene/Scene.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";
import {Keybinds} from "omino/Keybinds.js";
import Vector from "omino/Vector.js";
import data from "omino/Global.js";
import {MultipleEvents} from "omino/Listeners.js";

type Options={
    elements: Element[],
    calcPath: boolean,
    path: number[],
    startPoint: number|undefined,
    endPoint: number|undefined,
}
const defaultOptions:Options = {
    elements: [],
    calcPath: true,
    path: [],
    startPoint:undefined,
    endPoint:undefined
};

export default class Board extends MultipleEvents(DimsScene<any>, {
    elements:null! as [Board],
}){
    private dragging:false|{
        orig: Vector
        curr: Vector
        delta: Vector
    }=false;
    private shouldUnhold=false;
    private env: BoardRenderEnv;
    private applyData: {
        historicalNodes:NodeGroup,
        nodes:NodeGroup
    }={
        historicalNodes:undefined!,
        nodes:undefined!,
    };
    center=new Vector(0,0);
    cursor: { heldElement: SelectableElement|undefined }={heldElement:undefined};
    private clicked: boolean[]=[];

    elements: Element[];
    private startPoint: number|undefined;
    private endPoint: number|undefined;
    path: number[];
    private shouldRecalcPath: boolean;
    private lengthWorker: {
        postMessage: (message: any) => void
        terminate: ()=>void
        onmessage: ((ev: MessageEvent<any>) => any) | null
    }|undefined;

    constructor(options:Partial<Options> = {}) {
        super();

        let filledInOptions:Options = {...defaultOptions}
        Object.assign(filledInOptions, options);

        this.elements = [...filledInOptions.elements];

        this.startPoint = filledInOptions.startPoint;//id
        this.endPoint = filledInOptions.endPoint;//id

        this.path = filledInOptions.path;//list of ids
        this.shouldRecalcPath = filledInOptions.calcPath;
        this.recalcPath();

        this.env=({} as unknown as undefined)!;//todo:fix

        this.addListener("elements", ()=>this.onElementsChange());

    }

    setEnv(env:AnyEnhancedEnv=data.env) {
        let newEnv = {
            drawData: {
                ...this.env.drawData,
                context:env,
            },
            board: this,
            mouse: {
                dragging: this.dragging,
                clickedLeft: !!this.clicked[0],
                clickedRight: !!this.clicked[2],
                pos: new Vector(data.mouseX, data.mouseY),
            },
            cursor: this.cursor,

            elements:[]
        } satisfies BoardRenderEnv;
        Object.assign(this.env, newEnv);
    }

    unHold() {
        this.shouldUnhold = true;
    }

    apply() {
        this.applyData.historicalNodes = {};
        this.applyData.nodes = Element.apply(this.elements,
            this.env, this.applyData.historicalNodes);
    }
    getRenderingData(env?:AnyEnhancedEnv):[NodeGroup, BoardRenderEnv, NodeGroup]{
        return [
            this.applyData.nodes,
            {...this.env, drawData:{...this.env.drawData, context:env ?? this.env.drawData.context}},
            this.applyData.historicalNodes
        ];
    }

    add(element:Element) {
        this.elements.push(element);
        this.emitEvent("elements", this);
        this.recalcPath();
    }

    removeElement(element:Element) {
        if (this.elements.includes(element)) {
            this.elements.splice(this.elements.indexOf(element), 1);
            this.emitEvent("elements", this);
            this.recalcPath();
        }
    }

    getNodes() {
        return Element.apply(this.elements, {
            board: this,
            elements: this.elements,
        });
    }

    recalcPath() {
        this.lengthWorker?.terminate();
        if (!this.shouldRecalcPath) return;

        let lengthWorker: {
            postMessage: (message: any) => void
            terminate: ()=>void
            onmessage: ((ev: MessageEvent<any>) => any) | null
        };
        try {
            lengthWorker = new Worker("/omino-dist/pathfinding/Pathfinder.js", {type: "module"});
        } catch (e) {
            const fakePostMessage = (data: any) =>
                lengthWorker.onmessage!(new MessageEvent("", {data}));
            FakeWebWorker.fake(fakePostMessage);

            lengthWorker = {
                postMessage: data => FakeWebWorker.onMessage({data}),
                terminate: ()=>{},
                onmessage: null,
            };
        }
        this.lengthWorker = lengthWorker;

        const nodes = this.getNodes();

        lengthWorker.onmessage = e => {
            if (e.data[0] !== undefined && e.data[0].id === this.endPoint ||
                e.data[e.data.length - 1].id === this.startPoint)
                e.data.reverse();
            if(this.startPoint === undefined && this.endPoint === undefined && e.data[0] !== undefined &&
                e.data[0] === this.path[this.path.length-1] || e.data[e.data.length-1] === this.path[0])
                e.data.reverse();
            this.path = e.data;
            lengthWorker.terminate();
        };

        lengthWorker.postMessage({
            startPoint: this.startPoint,
            endPoint: this.endPoint,
            nodes: Object.values(nodes).map(n => [n.id, Object.values(n.connections)
                .map(c => c!.node.id)]),
        });
    }

    clone() {
        return new Board({
            startPoint: this.startPoint,
            endPoint: this.endPoint,
            calcPath: this.shouldRecalcPath,
            path: this.path,
            elements: this.elements,
        });
    }

    onElementsChange() {
        setTimeout(()=>this.apply(), 0);//alright
    }

    mouseUp(x:number, y:number, button:number) {
        this.clicked[button]=this.dragging ? this.dragging.orig.distTo(this.dragging.curr) < 10 : true;
        this.dragging = false;
        return true;
    }
    mouseDown(x:number, y:number, button:number) {
        if(super.mouseDown(x,y,button)) return true;

        if(!this.isIn()) return false;

        this.dragging = {
            orig: new Vector(x, y),
            curr: new Vector(x, y),
            delta: new Vector(0, 0),
        };
        return true;
    }

    render(env:AnyEnhancedEnv) {
        if(Keybinds.DEL.isReleased() && this.cursor.heldElement){
            this.cursor.heldElement=undefined;
        }

        if (this.dragging) {
            let pos = new Vector(data.mouseX, data.mouseY).sub(this.pos);
            this.dragging.delta = pos.sub(this.dragging.curr);
            this.dragging.curr = pos;
        }

        let shouldUpdate=false;
        for(const element of this.elements){
            if(element.needsUpdate){
                element.needsUpdate=false;
                shouldUpdate=true;
            }
        }
        if(shouldUpdate) {
            this.apply();
            this.emitEvent("elements", this);
            this.recalcPath();
        }

        this.setEnv(env);
        Element.render(this.elements, this.applyData.nodes, this.applyData.historicalNodes, this.env);
        this.pos.replace(new Vector(data.env.width()/4,0).add(new Vector(data.canvElt.width/2, data.canvElt.height)
            .sub(this.center.scale(2)).scale(0.5)));

        if (this.cursor.heldElement) {
            this.cursor.heldElement.drawAtMouse(this.applyData.nodes, this.env, this.applyData.historicalNodes);
        }
        if (this.shouldUnhold) {
            this.cursor.heldElement = undefined;
            this.shouldUnhold = false;
        }

        this.clicked=[];
    }
}
