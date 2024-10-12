const changelog = [
`v0.2.8 xxx
- Fixed the settings menu so it looks better and works with colorfiles
- Updated the default colorfile
- Moved the changelog into settings
- Changed the locking tiles mechanic to allow for click and dragging (it now works `+
`just like drawing a custom omino`,
`v0.2.7c 9/21/24
- Fixed the crash (part 2)`,
`v0.2.7b 9/20/24
- Fixed a crash hopefully`,
`v0.2.7 9/20/24
- Added new "safeMode" URL parameter: if the app isn't loading for whatever reason, add "?safeMode=true" or `+
`"&safeMode=true" to the end of the URL, and the app will load without colorfiles and mods.
- Added an events system for helping modfile developers
- Cleaned up adding modfiles and colorfiles`,
`v0.2.6 9/14/24
- Change omino drawing so it's click and drag
- Fixed mobile input crashing on weird screen sizes
- Fixed omino drawing letting you draw outside the bounds (thanks @dr.koffeeblahajedition!)`,
`v0.2.5 9/11/24
- Highlighting ominoes not in palette now works for unfilled palettes (heptominoes, octominoes...)
- Changed rendering on torus mode to make the board easier to visualize
- Fixed screenshot not capturing board correctly (again)
- Fixed links sometimes generating incorrectly (again) (thanks @hhhguir!)
- Fixed changelog saying undefined at the end`,
`v0.2.4 9/9/24
- Fixed the "Calculate Path" tickbox incorrectly recalculating the path when it shouldn't
- Fixed the app crashing when trying to set a size of 0 in torus torusMode (thanks @hhhguir!)
- Fixed keybindings not working when Caps Lock is on (thanks @bruhh9930!)
- Fixed some palettes not having correct colors (thanks @hhhguir!)
- Added more advanced wrapping in the changelog
- Increased Options size on mobile
- Added a number pad for mobile (so they can change the size now!)
- Fixed more mobile controls jank
- Fixed the Add Omino button not having a background`,
`v0.2.3b 9/6/24
- Fixed image copying not working`,
`v0.2.3 9/6/24
- added mobile support :3`,
`v0.2.2 9/6/24
- Fixed the High Contrast colorfile to make creating ominoes actually visible
- Made the High Contrast colorfile more easily accessible (there's a button for it now)
- Improved changing colorfiles
- Added more functions for use in colorfiles (lighten, darken)
- Added board building to colorfiles
- Fixed locked tiles in links (again again) (thanks @hhhguir :3)
- Fixed the cursor still showing you can grab ominoes under the Share Board screen
- Stopped removing pieces when going into puzzle editing mode`,
`v0.2.1 9/3/24
- Fixed locked tiles decoding incorrectly for very large boards (thanks @hhhguir!)
- Added colorfiles! This is a way to recolor every part of Omino Playground, through a javascript file. `+
`Open kyfexuwu.com/‍assets/‍omino/‍colorfiles/‍default.js to view an example of a colorfile, `+
`and instructions on how to make and use your own.
- Fixed omino adding screen letting the mouse through
- Redid graphics for the Palette tab (add button + omino buttons)
- Fixed some elements overlapping the settings button and fullscreen button when scrolling
- Added board type to screenshot
- Added highlights to screenshot`,
`v0.2.0 8/29/24 (the puzzle + hhhguir update)
- Fixed pieces overlapping others or going out of the board when resizing (thanks @hhhguir!)
- Pieces in the palette that are on the board are now highlighted when "Highlight duplicate pieces" is checked (thanks @hhhguir!)
- Clearing the board doesn't bug out locked tiles any more (thanks @hhhguir!)
- Fixed links not having the locked tiles data (thanks @hhhguir!)
note: v0.1.10 is v0.2.0`,
`v0.1.10-alpha3 8/28/24
- Added toggle for highlighting duplicate pieces (thanks @hhhguir!)
- Added toggle for highlighting pieces not in the current palette (thanks @hhhguir!)
- Added board dimensions in screenshot (thanks @stefliew!)`,
`v0.1.10-alpha2 8/27/24
- Fixed end point not showing up when enabling it
- Started adding the custom piece palette
- Added keybinds for building mode
- Divided keybinds up into sections
- Greatly optimized pathfinding algorithm (it was a bug lol)`,
`v0.1.10-alpha1 8/26/24
- Moved fullscreen button to top left
- Added board data! This is meant for puzzles, and includes:
. - Setting "locked" squares
. - Setting an arbitrary start and/or end point
. - Coming soon: setting a piece palette to solve the puzzle with
- Fixed a bug where clicking on the trash without an omino would crash
- Refactored Vectors (>:3)
- Split the "Overwrite" button into 2 buttons: "Apply" and "Clear"
- Added a toggle for calculating path length (so you don't lag your computer when building on big boards)`,
`v0.1.9d 8/22/24
- Fixed torus mode being broken`,
`v0.1.9c 8/22/24
- Made path render a bit cleaner (no overlaps at corners)
- Fixed cursor changing outside of board when it shouldn't when on torus mode
- Added bug report button in settings
- fixed a bug lol
- Added keybinds! You can view and change them`,
`v0.1.9b 8/22/24
- Made drawing ominoes look prettier
- Fixed being able to place ominoes on top of themselves in torus mode (thanks @yeacloth)
- Made ominoes render better at large sizes
- Removed path calculation lag when not calculating a super long path anymore `+
`(ex: switching from a big board to a small board)
- Tweaked delete animation
- Fixed the options panel scroll offsetting weirdly on app resize`,
`v0.1.9 8/21/24
- Added a settings screen, this includes:
. - Keybinds
. - nothing else atm lol
- Added comments to the board length calculator so it can be more easily understood `+
`(/assets/‍omino/‍BoardLengthCalculator.js)
- Added animations on omino transforms
- Boards now don't calculate path again when copying image
- Fixed bug with ad covering canvas
- Fixed app not resizing properly when sharing image
- Fixed path not considering all empty groups when calculating longest path (thanks @hhhguir)
- Fixed the "Add Omino" confirm button being offset wrong when app resized
- Added hover text to buttons
- Fixed the options on the left freaking out on resize`,
`v0.1.8c 8/19/24
- Path calculation should be slightly faster when loading a board from url`,
`v0.1.8b 8/16/24
- Fixed text not rendering correctly in the options panel
- Fixed screenshot incorrectly showing board as not in torus mode when it is
- Made it possible to put ominoes on the border in torus mode`,
`v0.1.8 8/15/24
- Added torus mode
- Removed lag when calculating optimal path (it's calculated in another thread now)
- Added color change to the board options when they are different from what's on the board `+
  `to show the use of the "Overwrite" button
- Let the user press enter on the options to apply changes`,
`v0.1.7b 8/14/24
- Fixed pieces past (9,y) or (x,9) decoding incorrectly when loading board from url`,
`v0.1.7 8/13/24 (again hehe)
- Fixed drawing mode so it doesn't create duplicate ominoes
- Added palettes for mono- to hexominoes (1 to 6)
- Added palette swapping
- Added board sharing! (the link button)`,
`v0.1.6 8/13/24
- Changed buttons to have icons instead of text
- Improved scrolling steal
- Made ominoes transparent when holding them
- Reworked internals to be neater
- Added dimension changing in app
- Added url parameter "fullscreen=[true, false]", which starts the app fullscreened if true
- Added a screenshot/share button`,
`v0.1.5 8/10/24
- Added better omino rotation
- Added better(?) fullscreen
- Added changelog (+ arbitrary version number lol)`,

`Special thanks to these users:
- @hhhguir - for finding so many bugs thank you so much`,
];

const spaceRegex=/[ \u200d]/;
function smartText(text, x, y, w){
  let splitText=text.split("\n").map(l=>l.split(spaceRegex));
  let joiners=text.split("").filter(c=>spaceRegex.test(c));

  let toRender=[];
  let joinerIndex=0;
  for(const line of splitText){
    let lines=[];

    let newLine=[];
    for(const section of line){
      let toAdd=section+(joiners[joinerIndex]||"");
      if(p5.textWidth(newLine.join("")+toAdd||newLine.length==0)<w){
        newLine.push(toAdd);
      }else{
        lines.push(newLine);
        newLine=[toAdd];
      }
      joinerIndex++;
    }

    lines.push(newLine);
    toRender=toRender.concat(lines);
    joinerIndex--;
  }

  p5.text(toRender.map(l=>l.join("")).join("\n"), x,y);
}

//--

import {ScrollableScene} from "/assets/omino/scene/Scene.js";
import {fill} from "/assets/omino/Colors.js";

class ChangelogScene extends ScrollableScene{
	constructor(){
        super();
    }
    resized(oldDims, newDims=oldDims){
        this.dims = newDims;

        super.resized(oldDims, newDims);
    }
    scrolled(x,y,delta){
        delta*=this.dims.x*0.0007;

        let oldOffs=this.offs;
        if(!super.scrolled(x,y,delta)) return false;
        if(this.offs<0){
          for(const child of this.subScenes) child.pos.y+=oldOffs;
          this.offs=0;
          return true;
        }

        for(const child of this.subScenes) child.pos.y-=delta;

        return true;
    }

    render(){
	    p5.push();
	    p5.translate(0,-this.offs);
	    let scale = this.dims.y*0.01;
	    p5.scale(scale);

	    p5.textSize(4.5);
	    fill("scenes.settings.text");
	    p5.textAlign(p5.LEFT, p5.TOP);

	    smartText(changelog.join("\n\n"), 0,0, 1/scale*this.dims.x);

	    p5.pop();

	    super.render();
    }
}

export default ChangelogScene;