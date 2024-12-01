import express from 'express';
import fs from 'fs';
const website = new express();

import { fileURLToPath } from 'url';
const __dirname=fileURLToPath(import.meta.url).slice(0,"/app.js".length*-1);

const server = website.listen(80);

//--

website.use("/assets", express.static(__dirname + "/public_assets/"));
website.get('/', (req, res) => res.redirect('/omino-playground?fullscreen=true'));
website.get("/omino-playground", (req, res) => {
	res.send(`
<!DOCTYPE html>
<html>
	<head>
		<title>omino playground</title>
		<style>
			.p5Canvas{
				margin: auto;
				display: block;
			}
		</style>
	</head>
	<body style="height: 100vh; margin:0; background-color:black;">
		<script src="https://cdn.jsdelivr.net/npm/p5@1.10.0/lib/p5.js"></script>
		<script type="importmap">
			{
				"imports": {
					"three": "https://cdn.jsdelivr.net/npm/three@0.171.0/build/three.module.js",
					"three/addons/": "https://cdn.jsdelivr.net/npm/three@0.171.0/examples/jsm/"
				}
			}
		</script>
		
		<script src="/assets/omino/launcher.js" type="module"></script>
	</body>
</html>`);
});