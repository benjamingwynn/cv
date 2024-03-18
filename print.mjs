#!/usr/bin/env -S node
/**
 * This file generates the markdown document into a PDF then opens it on the host system.
 *
 * @author Benjamin Gwynn <benjamin@benjamingwynn.com>
 * @format
 */

import md from "markdown-it"
import fsp from "fs/promises"
import puppeteer from "puppeteer"
import c from "ansi-colors"
import cproc from "child_process"
import path from "path"

// simple state monitor
let _lastState
function status(state) {
	if (_lastState) console.log(c.green("[ OK ]"), c.cyan(_lastState))
	if (state) console.log(c.yellow("[ .. ]"), c.cyan(state))
	_lastState = state
}
process.on("beforeExit", () => {
	status(null)
})

function toBase64Url(input, mediatype = "text/plain") {
	const header = `data:${mediatype};base64,`
	return `${header}${Buffer.from(input).toString("base64")}`
}

async function htmlToPdf(html) {
	const url = toBase64Url(html, "text/html")

	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	await page.goto(url, {waitUntil: "networkidle0"})

	await page.emulateMediaType("screen")

	const margin = "0.5in" // <-- matches MS Word's "narrow" default (see: https://columbiacollege-ca.libguides.com/microsoft-word/margins)
	// const margin = "1in" // <-- matches MS Word's "normal" default
	const pdf = await page.pdf({
		margin: {top: margin, right: margin, bottom: margin, left: margin},
		printBackground: true,
		format: "A4",
	})

	await browser.close()

	return pdf
}

/** if the last commit was tagged in Git returns the tag, otherwise returns a default string */
function getVersion() {
	const command = `git tag -l --contains`
	const result = cproc.execSync(command).toString()
	return result.trim() || `WIP` // <-- the default string
}

status("Cleaning up")
await fsp.rm("./out", {force: true, recursive: true})
await fsp.mkdir("./out")

status("Generating name from Git tag")
const version = getVersion()
const outputFilename = `cv-2024-${getVersion()}.pdf`

status("Read document")
const file = await fsp.readFile("./document.md")

status("Render to markdown")
const mdHtml = md({
	// enable HTML tags like <small>
	html: true,
}).render(file.toString())

// HACK: inject the version into the document itself
const pdfHtml = mdHtml.replace("</h1>", `</h1><h1>${version}</h1>`)

status("Render to PDF")
const pdf = await htmlToPdf(pdfHtml)

status("Save to disk")
const outputFullPath = path.join(process.cwd(), `./out/${outputFilename}`)
await fsp.writeFile(outputFullPath, pdf)

status("Open the created file")
cproc.execSync(`${process.platform === "darwin" ? "open" : "xdg-open"} "${outputFullPath}"`)
