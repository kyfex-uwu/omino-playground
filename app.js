import express from 'express';
import fs from 'fs';
const website = new express();

import { fileURLToPath } from 'url';
const __dirname=fileURLToPath(import.meta.url).slice(0,"/app.js".length*-1);

const server = website.listen(4000);
console.log("App hosted at http://localhost:4000");

//--

website.use("/omino-dist", express.static(__dirname + "/dist/"));
website.use("/public_assets", express.static(__dirname + "/src/resources/"));
website.get('/favicon.ico', (req, res) => res.sendFile(__dirname+"/public_assets/omino/favicon.ico"));
website.get('/', (req, res) => res.redirect('/omino-playground?fullscreen=true'));
website.get("/omino-playground", (req, res) => {
	res.sendFile(__dirname+"/main.html");
});
