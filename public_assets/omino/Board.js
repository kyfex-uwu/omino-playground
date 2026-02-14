import Element from "/assets/omino/pathfinding/elements/Element.js";
import * as FakeWebWorker from "/assets/omino/pathfinding/Pathfinder.js";

const defaultOptions = {
    elements: [],
    calcPath: true,
    path: [],
    startPoint: undefined,
    endPoint: undefined,
};

class Board {
    constructor(options = {}) {
        let filledInOptions = {};
        Object.assign(filledInOptions, defaultOptions);
        Object.assign(filledInOptions, options);

        this.elements = [...filledInOptions.elements];

        this.startPoint = filledInOptions.startPoint;//id
        this.endPoint = filledInOptions.endPoint;//id

        this.path = filledInOptions.path;//list of ids
        this.shouldRecalcPath = filledInOptions.calcPath;
        this.recalcPath();

        this.elementsListeners = [];
    }

    add(element) {
        this.elements.push(element);
        for (const l of this.elementsListeners) l(this);
        this.recalcPath();
    }

    remove(element) {
        if (this.elements.includes(element)) {
            for (const l of this.elementsListeners) l(this);
            this.elements.splice(this.elements.indexOf(element), 1);
            this.recalcPath();
        }
    }

    getNodes() {
        return Element.apply(this.elements, {
            board: this
        });
    }

    recalcPath() {
        try {
            this.lengthWorker.terminate();
        } catch (e) {
        }
        if (!this.shouldRecalcPath) return;

        let lengthWorker;
        try {
            lengthWorker = new Worker("/assets/omino/pathfinding/Pathfinder.js", {type: "module"});
        } catch (e) {
            const fakePostMessage = data => lengthWorker.onmessage({data});
            FakeWebWorker.fake(fakePostMessage);

            lengthWorker = {
                postMessage: data => FakeWebWorker.onMessage({data}),
                terminate: _ => 0,
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
            console.log(e.data[0],this.path[0])
            this.path = e.data;
            lengthWorker.terminate();
        };

        lengthWorker.postMessage({
            startPoint: this.startPoint,
            endPoint: this.endPoint,
            nodes: Object.values(nodes).map(n => [n.id, Object.values(n.connections).map(c => c.node.id)]),
        });
    }

    clone() {
        let toReturn = new Board({
            startPoint: this.startPoint,
            endPoint: this.endPoint,
            calcPath: this.shouldRecalcPath,
            path: this.path,
            elements: this.elements,
        });

        return toReturn;
    }
}

export default Board;
