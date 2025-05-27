import {ApplyData, Element, Pass, SelectableElement} from "/assets/omino/pathfinding/elements/Element.js";
import Node from "/assets/omino/pathfinding/Node.js";
import RectOrientation from "/assets/omino/pathfinding/orientation/RectOrientation.js";
import Vector from "/assets/omino/Vector.js";
import {background, fill} from "/assets/omino/Colors.js";

//  0
// 3 1
//  2

export default class RectBoardEl extends Element {
    constructor(width, height) {
        super();
        this.width = width;
        this.height = height;

        this.currId=0;
        this.board=[];
        this.addRow(this.height);
        this.addColumn(this.width);

        this.applyPasses = [
            new Pass(-1000, (nodes, env) => {//generate nodes
                const toReturn = new ApplyData();

                let currRowNode;
                for (let y = 0; y < this.height; y++) {
                    let leftView;
                    for (let x = 0; x < this.width; x++) {
                        let node = new Node(RectOrientation.default);
                        node.id = this.board[y][x];
                        node.custom.pos = new Vector(x, y);
                        toReturn.add(node);

                        let nodeView = node.getView(RectOrientation.default);
                        if (x !== 0) {
                            nodeView.connectNode(3, 1, leftView.node);

                            if (y !== 0) {
                                nodeView.connectNode(0, 2, leftView.get(0).getNode(1));
                            }
                        } else if (y !== 0) {
                            nodeView.connectNode(0, 2, currRowNode);
                        }
                        if (x === 0) currRowNode = node;
                        leftView = nodeView;
                    }
                }

                return toReturn;
            }),
        ];

        this.renderPasses = [
            new Pass(-1000, (nodes, env) => {//initializes the board area
                this.renderScale = Math.min(env.container.dims.x / this.width, env.container.dims.y / this.height);

                Object.assign(env.drawData, {
                    nodeToTexPos: n => this.getNodePos(n, this.renderScale),
                    nodeSize: this.renderScale,
                });
            }),

            new Pass(-10, (nodes, env) => {//draws grid
                fill("board.grid", env.drawData.context);
                let size = env.drawData.nodeSize;

                for (const node of Object.values(nodes)) {
                    let pos = env.drawData.nodeToTexPos(node);
                    env.drawData.context.rect((pos.x / size + 0.1) * size, (pos.y / size + 0.1) * size,
                        size * 0.8, size * 0.8, size * 0.1);
                }
            }),
            new Pass(1000, (nodes, env, historicalNodes) => {//draws path
                fill("board.grid", env.drawData.context);
                let halfCell = env.drawData.nodeSize / 2;
                let positions = env.board.path.map(id => historicalNodes[id]).map(n =>//todo: revert this back to just nodes
                    env.drawData.nodeToTexPos(n).add(halfCell, halfCell));
                let size = env.drawData.nodeSize * 0.1;

                env.drawData.context.push();
                env.drawData.context.beginClip();
                for (const position of positions) {
                    env.drawData.context.rect(position.x - size / 2, position.y - size / 2, size, size, size);
                }
                for (let i = 1; i < positions.length; i++) {
                    let p1 = positions[i - 1];
                    let p2 = positions[i];

                    //this math is so gross lol
                    env.drawData.context.push();
                    env.drawData.context.translate(p1.x, p1.y);
                    env.drawData.context.rotate(-Math.atan2(p2.x - p1.x, p2.y - p1.y));
                    env.drawData.context.rect(-size / 2, 0, size, Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2));
                    env.drawData.context.pop();
                }
                env.drawData.context.endClip();
                background("board.pathColor", env.drawData.context);
                env.drawData.context.pop();

                fill("board.text", env.drawData.context);
                env.drawData.context.textAlign(p5.CENTER, p5.CENTER);
                let i = 1;
                for (const position of positions) {
                    env.drawData.context.textSize(
                        env.drawData.nodeSize * 0.5 / (Math.floor(Math.log10(i)) * 0.3 + 1));
                    env.drawData.context.text(i++, position.x, position.y);
                }
            }),

            new Pass(1010, (nodes, env, historicalNodes) => {//handle click
                if (!env.cursor.heldElement) {
                    for (const element of env.elements) {
                        if (element instanceof SelectableElement && element.isSelected(nodes, env, historicalNodes)) {
                            env.cursor.heldElement = element;
                            env.board.remove(element);
                            break;
                        }
                    }
                } else {
                    if (env.cursor.heldElement.tryPlace(nodes, env, historicalNodes)) {
                        env.board.add(env.cursor.heldElement);
                        env.container.unHold();
                    }
                }
            }),
        ];
    }


    settings() {
        return [{
            type: "counter",
            label: "Width",
            data: {
                min: 1,
                value: this.width,
                submit: v => {
                    this.addColumn(v-this.width);
                    this.width = v;
                    this.needsUpdate=true;
                    return true;
                }
            }
        }, {
            type: "counter",
            label: "Height",
            data: {
                min: 1,
                value: this.height,
                submit: v => {
                    this.addRow(v-this.height);
                    this.height = v;
                    this.needsUpdate=true;
                    return true;
                }
            }
        }];
    }
    addRow(count=1){
        if(count<0) return this.subRow(-count);
        for(;count>0;count--) {
            let toAdd = [];
            for (let i = 0; i < this.width; i++)
                toAdd.push(this.currId++);
            this.board.push(toAdd);
        }
    }
    addColumn(count=1){
        if(count<0) return this.subColumn(-count);
        for(;count>0;count--) {
            for (let i = 0; i < this.height; i++)
                this.board[i].push(this.currId++);
        }
    }
    subRow(count=1){
        if(count<0) return this.addRow(-count);
        for(;count>0;count--) {
            this.board.pop();
        }
    }
    subColumn(){
        if(count<0) return this.addColumn(-count);
        for(;count>0;count--) {
            for(let i=0;i<this.width;i++)
                this.board[i].pop();
        }
    }

    getNodePos(n, scale) {
        return n.custom.pos.scale(scale);
    }

    infoTextPass(){
        return `${this.width}x${this.height}`;
    }
}
