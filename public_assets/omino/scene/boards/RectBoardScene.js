import BoardScene from "/assets/omino/scene/boards/BoardScene";

export default class RectBoardScene extends BoardScene{
	constructor(board, drawMouse) {
        super(board, drawMouse);
    }
    drawBoard({palette}){
		//nder(pos, {palette=nullPalette, env=p5, mouse=true}={}){

		for(let y=0;y<this.board.height;y++){
			for(let x=0;x<this.board.width;x++){
				let pos=new Vector(x,y);
				fill(this.get(pos)?"board.filled":"board.grid",env);

				if(pos.equals(this.startPoint)) fill("board.start", env);
				else if(pos.equals(this.endPoint)) fill("board.end", env);
				env.rect((x+tileSpacing)*this.renderData.scale,
				(y+tileSpacing)*this.renderData.scale,
				this.renderData.scale*(1-tileSpacing*2),this.renderData.scale*(1-tileSpacing*2),
				this.renderData.scale*tileRadius);
			}
		}

		env.push();
		env.beginClip();
		env.scale(this.renderData.scale);
		env.translate(0.5,0.5);
		const line=(x1,y1,x2,y2) => {
			if(x2<x1) [x1,x2]=[x2,x1];
			if(y2<y1) [y1,y2]=[y2,y1];
			env.rect(x1-0.05,y1-0.05,x2-x1+0.1,y2-y1+0.1, 0.05);
		};
		for(let i=1;i<this.path.length;i++){
			if(this.torusMode&&
				(Math.abs(this.path[i-1].x-this.path[i].x)>1||Math.abs(this.path[i-1].y-this.path[i].y)>1)){
				let portalDist = 0.5-tileSpacing;

				if(this.path[i-1].y!=this.path[i].y){
					line(this.path[i-1].x,this.path[i-1].y, this.path[i].x,
					this.path[i-1].y+(this.path[i].y>this.path[i-1].y?-1:1)*portalDist);
					line(this.path[i].x,this.path[i].y, this.path[i-1].x,
					this.path[i].y+(this.path[i-1].y>this.path[i].y?-1:1)*portalDist);
				}else{
					line(this.path[i-1].x,this.path[i-1].y,
					this.path[i-1].x+(this.path[i].x>this.path[i-1].x?-1:1)*portalDist, this.path[i].y);
					line(this.path[i].x,this.path[i].y,
					this.path[i].x+(this.path[i-1].x>this.path[i].x?-1:1)*portalDist, this.path[i].y);
				}
			continue;
			}

			line(this.path[i-1].x,this.path[i-1].y, this.path[i].x,this.path[i].y);
		}
		env.endClip();
		background("board.pathColor");
		env.pop();

		env.fill(0);
		fill("board.text",env);
		env.push();
		env.textAlign(env.CENTER,env.CENTER);
		env.textSize(this.renderData.scale*0.5);
		for(let i=0;i<this.path.length;i++){
			env.text(i+1,(this.path[i].x+0.5)*this.renderData.scale, (this.path[i].y+0.5)*this.renderData.scale);
		}
		env.pop();

		let over = this.get(new Vector(p5.mouseX,p5.mouseY).sub(pos).scale(1/this.renderData.scale)
			.sub(new Vector(0.5,0.5)).round());
		if(mouse&&over&&!(over instanceof LockedOmino))
			p5.cursor(p5.MOVE);

		env.push();
		env.beginClip();
		env.rect(0,0,this.renderData.scale*this.width, this.renderData.scale*this.height, this.renderData.scale*(tileRadius+tileSpacing));
		env.endClip();

		for(const omino of this.ominoes){
			let renderFunc = this.renderType(omino, palette);
			if(this.torusMode){
				for(let y=0;y<omino.pos.y+omino.height();y+=this.height){
					for(let x=0;x<omino.pos.x+omino.width();x+=this.width){
						let newOmino = omino.clone();
						newOmino.pos = newOmino.pos.clone();
						newOmino.pos.x-=x;
						newOmino.pos.y-=y;
						newOmino[renderFunc](this.renderData.scale, new Vector(0,0), {env});
					}
				}
			}else omino[renderFunc](this.renderData.scale, new Vector(0,0), {env});
		}
		env.pop();
    }

    mouseUp(x, y){}
}