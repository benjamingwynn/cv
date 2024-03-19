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
	doc = `<!doctype html><html><head><title>Document preview</title></head><body>` + doc + `</body></html>`
	// add the hot reload client-side code
	doc += `\n<script>(new EventSource("$")).onmessage=function(){location.reload(!0)}</script>`
	// add styling so it always looks like a pdf when in dev mode
	doc += `<style>
	@media only screen {
		html {
			background-color: #aaa;
		}
		body {
			background-color: white;
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

/** sends an event to the open data stream `req` */
function sendEvent(res) {
	res.write("event: message\n")
	res.write(`data: \n\n`)
}
const eventStreamConnections = new Set()
const server = http.createServer((req, res) => {
	switch (req.url) {
		case "/$": {
			// use the /$ path as a special hook for auto-reload
			res.writeHead(200, {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			})
			eventStreamConnections.add(res)
			req.on("close", () => {
				eventStreamConnections.delete(res)
			})
			return
		}
		case "/favicon.ico": {
			res.writeHead(404)
			res.end("Favicon not found.")
			return
		}
		default: {
			// serve document
			res.writeHead(200, {"Content-Type": "text/html"})
			res.end(document)
		}
	}
})

status("Starting HTTP server")
const listen = util.promisify(server.listen).bind(server)
await listen(8080)
status(null)
console.log("listening on", server.address())

let makeDocumentPromise
fs.watch("document.md", () => {
	console.log("* document.md changed")
	if (makeDocumentPromise) return
	console.log("* rebuilding")
	makeDocumentPromise = makeDocument()
		.then((newDocument) => {
			document = newDocument
			console.log("* document.md rebuilt")
			// reload everything
			eventStreamConnections.forEach(sendEvent)
		})
		.catch((err) => {
			console.error("[render document error]", err)
		})
		.finally(() => {
			makeDocumentPromise = null
		})
})
