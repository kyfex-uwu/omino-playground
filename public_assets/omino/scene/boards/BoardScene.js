import { DimsScene } from "/assets/omino/scene/Scene.js";

class BoardScene extends DimsScene {
    constructor(board, drawMouse=true) {
        super();
        this.board=board;
        this.drawMouse=drawMouse;
    }
    render() {
        p5.push();

        p5.fill(0);
        p5.beginClip();
        p5.rect(0,0,this.dims.x,this.dims.y);
        p5.endClip();

        p5.translate(-this.dims.x/2,-this.dims.y/2);

        let palette=(this.parent.paletteScene||{}).palette;
        this.drawBoard({palette});
        
        p5.pop();
    }
    drawBoard({palette}){}

    mouseUp(x, y){}
    clickNode(node){
        //grab omino
    }
    clickEdge(/**/){}
    clickCorner(/**/){}
}

export default BoardScene;