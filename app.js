import express from 'express';
import fs from 'fs';
const website = new express();

import { fileURLToPath } from 'url';
const __dirname=fileURLToPath(import.meta.url).slice(0,"/app.js".length*-1);

const server = website.listen(4000);
console.log("App hosted at http://localhost:4000");

//--

website.use("/omino-dist", express.static(__dirname + "/dist/"));
website.get('/favicon.ico', (req, res) => res.sendFile(__dirname+"/public_assets/omino/favicon.ico"));
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
		<div id="app"></div>
		<script type="importmap">
			{
				"imports": {
					"three": "https://cdn.jsdelivr.net/npm/three@0.171.0/build/three.module.js",
					"three/addons/": "https://cdn.jsdelivr.net/npm/three@0.171.0/examples/jsm/",
					
					"omino/": "/omino-dist/"
				}
			}
		</script>
		<script src="/omino-dist/launcher.js" type="module"></script>
	</body>
</html>`);
});
