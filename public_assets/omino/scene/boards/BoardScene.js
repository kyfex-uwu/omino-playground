import { DimsScene } from "/assets/omino/scene/Scene.js";
import Element from "/assets/omino/pathfinding/elements/Element.js";

class BoardScene extends DimsScene {
    constructor(board) {
        super();
        this.board=board;
    }
    render() {
        p5.push();

        p5.fill(0);
        p5.beginClip();
        p5.rect(0,0,this.dims.x,this.dims.y);
        p5.endClip();

        Element.render(this,this.board.elements);
        
        p5.pop();
    }
}

export default BoardScene;