import Vector from "/assets/omino/Vector.js";
import MainScene from "/assets/omino/scene/MainScene.js";
import {pageData} from "/assets/omino/Options.js";
import {createKey, rawKeys} from "/assets/omino/Keybinds.js";
import Board from "/assets/omino/Board.js";
import {isKindaMobile} from "/assets/omino/scene/Scene.js";

import events from "/assets/omino/Events.js";

import RectBoardEl from "/assets/omino/pathfinding/boards/RectBoardEl.js";
import OminoEl from "/assets/omino/pathfinding/elements/OminoEl.js";
import PortalEl from "/assets/omino/pathfinding/elements/PortalEl.js";
import RectOrientation from "/assets/omino/pathfinding/orientation/RectOrientation.js";

//--

const data = {
    scene: undefined,
    isFullscreened: false,
    canvElt: undefined,

    listeners:{
        mouseDown:[],
        mouseUp:[],
        keyDown:[],
        keyUp:[],
        scroll:[],
        resize:[],
    }
};
export default data;

let scrollScale = 0.5;

p5.disableFriendlyErrors = true;
new p5(p5 => {
    window.p5 = p5;

    let loaded;
    p5.setup = async function () {
        await events.loaded.resolve();

        p5.noStroke();
        data.canvElt = p5.createCanvas(100, 100).elt;
        try {
            document.getElementById("app").appendChild(data.canvElt);
        } catch (e) {
        }
        data.canvElt.addEventListener("contextmenu", e => e.preventDefault());
        data.canvElt.addEventListener("scroll", e => e.preventDefault());
        data.canvElt.addEventListener("touchmove", e => e.preventDefault());
        data.canvElt.style["z-index"] = 999;

        data.scene = new MainScene({
            board: new Board({
                elements: [
                    new RectBoardEl(7, 7),
                    new OminoEl(
                        {
                            0: {
                                0: {
                                    1: {}
                                },
                                3: {}
                            }
                        }, 24, new RectOrientation(2)),
                    new OminoEl(
                        {
                            0: {
                                0: {
                                    0: {
                                        0: {},
                                    },
                                },
                            },
                        }, 5, new RectOrientation(2)),
                    new PortalEl(0, "meow"),
                    new PortalEl(4, "meow"),
                ]
            })
        });
        data.isFullscreened = pageData.fullscreen;

        data.listeners.resize.push((old,nw) => data.scene.resized(old,nw));
        data.listeners.mouseDown.push((x,y) => data.scene.mouseDown(x,y));
        data.listeners.mouseUp.push((x,y) => data.scene.mouseUp(x,y));
        data.listeners.keyDown.push((key) => data.scene.keyPressed(key));
        data.listeners.keyUp.push((key) => data.scene.keyReleased(key));
        data.listeners.scroll.push((x, y, amt) => data.scene.scrolled(x, y, amt));

        loaded = true;
        p5.windowResized();
    }
    p5.windowResized = function () {
        if (!loaded) return;

        let oldWidth = p5.width;
        let oldHeight = p5.height;
        let newWidth;
        let newHeight;
        if (data.isFullscreened) {
            if (isKindaMobile) p5.fullscreen(true);
            newWidth = p5.windowWidth;
            newHeight = p5.windowHeight;

            Object.assign(data.canvElt.style, {
                position: "absolute",
                left: 0,
                top: 0
            });
            try {
                document.getElementById("lightmode-toggle").style.display = "none";
            } catch (e) {
            }
        } else {
            if (isKindaMobile) p5.fullscreen(false);
            newWidth = data.canvElt.parentElement.clientWidth;
            newHeight = Math.min(data.canvElt.parentElement.clientWidth * 3 / 4, p5.windowHeight * 0.96);

            Object.assign(data.canvElt.style, {
                position: "static"
            });
            try {
                document.getElementById("lightmode-toggle").style.display = "unset";
            } catch (e) {
            }
        }
        p5.resizeCanvas(newWidth, newHeight);
        for(const listener of data.listeners.resize) listener(new Vector(oldWidth, oldHeight), new Vector(p5.width, p5.height));
    }

    p5.mousePressed = function () {
        if (!loaded) return;
        for(const listener of data.listeners.mouseDown) listener(p5.mouseX, p5.mouseY);
    }
    p5.touchStarted = p5.mousePressed;
    p5.mouseReleased = function () {
        if (!loaded) return;
        for(const listener of data.listeners.mouseUp) listener(p5.mouseX, p5.mouseY);
    }
    p5.touchEnded = p5.mouseReleased;
    p5.keyPressed = function (e) {
        if (!loaded) return;
        let key = p5.key.length == 1 ? p5.key.toLowerCase() : p5.key;
        createKey(key);
        rawKeys[key].press();
        for(const listener of data.listeners.keyDown) listener(key);
    }
    p5.keyReleased = function () {
        if (!loaded) return;
        let key = p5.key.length == 1 ? p5.key.toLowerCase() : p5.key;
        createKey(key);
        rawKeys[key].release();
        for(const listener of data.listeners.keyUp) listener(key);
    }
    p5.mouseWheel = function (e) {
        if (!loaded) return;
        if (p5.mouseX >= 0 && p5.mouseY >= 0 && p5.mouseX < p5.width && p5.mouseY < p5.height) {
            let consumed=false;
            for(const listener of data.listeners.scroll)
                consumed ||= listener(p5.mouseX, p5.mouseY, e.delta * scrollScale);
            if (consumed) {
                window.scroll(0, data.canvElt.getBoundingClientRect().y - document.body.getBoundingClientRect().y -
                    (p5.windowHeight - p5.height) / 2);
            }
        }
    }

    p5.draw = function () {
        if (!loaded) return;

        p5.clear();
        p5.cursor(p5.ARROW);
        p5.textSize(30);
        p5.noStroke();
        p5.noFill();
        data.scene.render();

        //--

        for (const key of Object.values(rawKeys)) {
            key.pressed = false;
            key.released = false;
        }
    }
});

export const o = obj=>obj;
