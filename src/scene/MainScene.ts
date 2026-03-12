import Vector from "omino/Vector.js";
import {hover, Scene} from "omino/scene/Scene.js";
import OptionsScene from "omino/scene/OptionsScene.js";
import {background} from "omino/Colors.js";
import type Board from "omino/Board.js";
import type {AnyEnhancedEnv} from "omino/EnvHelper.js";

// import PaletteScene from "omino/scene/PaletteScene.js";

class MainScene extends Scene<never> {
    private settings=[];

    board: Board;
    private optionsScene: OptionsScene;
    // private paletteScene: PaletteScene;
    constructor(board:Board) {
        super();

        this.board = this.addScene(board);

        this.optionsScene = this.addScene(new OptionsScene(this.board));
        // this.paletteScene = this.addScene(new PaletteScene(this.board));

        this.board.setEnv();
        this.board.apply();
    }

    render(env:AnyEnhancedEnv) {
        background("bg", env);

        super.render(env);

        hover.draw(env);
    }

    resized(oldDims:Vector, newDims=oldDims){
        const scale= Math.min(newDims.x/2, newDims.y);
        this.board.dims.replace(scale, scale);
        this.board.pos.replace(newDims.scale(0.5).sub(this.board.dims).scale(0.5));
        super.resized(oldDims, newDims);
    }
}

export default MainScene;
