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
import {renderDocument} from "./render.mjs"
import {status, getVersion} from "./common.mjs"

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
		outline: true,
		format: "A4",
	})

	await browser.close()

	return pdf
}

status("Cleaning up")
await fsp.rm("./out", {force: true, recursive: true})
await fsp.mkdir("./out")

status("Generating name from Git tag")
const version = getVersion()
const outputFilename = `cv-${new Date().getFullYear()}-${version}.pdf`

const pdfHtml = await renderDocument()

status("Render to PDF")
const pdf = await htmlToPdf(pdfHtml)

status("Save to disk")
const outputFullPath = path.join(process.cwd(), `./out/${outputFilename}`)
await fsp.writeFile(outputFullPath, pdf)

if (!process.argv.includes("--no-open")) {
	status("Open the created file")
	cproc.execSync(`${process.platform === "darwin" ? "open" : "xdg-open"} "${outputFullPath}"`)
}
