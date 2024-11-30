//unused and unfinished

export default function Model3dViewer({model, texture, distance=2, rot=0, height=0}={}, env=p5){
	const points = model.vertices.map((v,i)=>{
		return {
			x:v.x,
			y:v.y,
			z:v.z,
			uv:model.uvs[i]
		};
	});

	let faces=model.faces.map(f=>{
		let thisPoints=f.map(v=>points[v]);
		return {
			points:thisPoints,
			//TODO: this needs to be from cam perspective
			depth:thisPoints.map(p=>p.z).reduce((a,c)=>a+c,0)/thisPoints.length
		}
	}).sort((f1,f2)=>f1.depth-f2.depth);

	env.texture(texture);
	for(const face of model.faces){
		env.beginShape();
		for(const point of face.points)
			env.vertex(point.x,point.y, point.uv[0],point.uv[1]);
		env.endShape();
	}
}