#!/usr/bin/env -S node
/**
 * Automatically rebuilds the markdown document into an HTML file, and serves that HTML file on a web server.
 *
 * @format
 */

import fs from "fs"
import http from "http"
import util from "util"
import {renderDocument} from "./render.mjs"
import {status} from "./common.mjs"

async function makeDocument() {
	let doc = await renderDocument()
	doc = `<html><head><title>Document preview</title></head><body>` + doc + `</body>`
	// add the hot reload client-side code
	doc += `\n<script>(new EventSource("$")).onmessage=function(){location.reload(!0)}</script>`
	// add styling so it always looks like a pdf when in dev mode
	doc += `<style>
	@media only screen {
		html {
			background: #3b4750;
		}
		body {
			background: white;
			box-shadow: black 0 0 1em;
			margin: 0.25in auto;
			padding: 0.5in;
			max-width: 210mm;
			/* height: 297mm; */
			box-sizing: border-box;
		}
	}</style>`
	return doc
}

let document = await makeDocument()

/** sends an event to all clients on teh data stream*/
function sendEvent(res) {
	res.write("event: message\n")
	res.write(`data: \n\n`)
}
const connections = new Set()
const server = http.createServer((req, res) => {
	// use the /$ path as a special hook for auto-reload
	if (req.url === "/$") {
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		})
		connections.add(res)
		req.on("close", () => {
			connections.delete(res)
		})
		return
	}

	// serve document
	res.writeHead(200, {"Content-Type": "text/html"})
	res.end(document)
})

status("Starting HTTP server")
const listen = util.promisify(server.listen).bind(server)
await listen(8080)
status(null)
console.log("listening on", server.address())

let promise
fs.watch("document.md", () => {
	console.log("* document.md changed")
	if (promise) return
	console.log("* rebuilding")
	promise = makeDocument()
		.then((newDocument) => {
			document = newDocument
			console.log("* document.md rebuilt")
			// reload everything
			connections.forEach(sendEvent)
		})
		.catch((err) => {
			console.error("[render document error]", err)
		})
		.finally(() => {
			promise = null
		})
})
