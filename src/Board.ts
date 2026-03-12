import Element from "omino/pathfinding/elements/Element.js";
import * as FakeWebWorker from "omino/pathfinding/Pathfinder.js";

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

export default class Board {
    elements: Element[];
    private startPoint: number|undefined;
    private endPoint: number|undefined;
    path: number[];
    private shouldRecalcPath: boolean;
    elementsListeners: ((board:this)=>void)[];
    private lengthWorker: {
        postMessage: (message: any) => void
        terminate: ()=>void
        onmessage: ((ev: MessageEvent<any>) => any) | null
    }|undefined;

    constructor(options:Partial<Options> = {}) {
        let filledInOptions:Options = {...defaultOptions}
        Object.assign(filledInOptions, options);

        this.elements = [...filledInOptions.elements];

        this.startPoint = filledInOptions.startPoint;//id
        this.endPoint = filledInOptions.endPoint;//id

        this.path = filledInOptions.path;//list of ids
        this.shouldRecalcPath = filledInOptions.calcPath;
        this.recalcPath();

        this.elementsListeners = [];
    }

    add(element:Element) {
        this.elements.push(element);
        for (const l of this.elementsListeners) l(this);
        this.recalcPath();
    }

    remove(element:Element) {
        if (this.elements.includes(element)) {
            for (const l of this.elementsListeners) l(this);
            this.elements.splice(this.elements.indexOf(element), 1);
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
}
