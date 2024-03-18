/**
 * @author Benjamin Gwynn <benjamin@benjamingwynn.com>
 * @format
 */

import md from "markdown-it"
import fsp from "fs/promises"
import {status, getVersion} from "./common.mjs"

export async function renderDocument() {
	status("Getting version")
	const version = getVersion()

	status("Read document")
	const file = await fsp.readFile("./document.md")

	status("Render to HTML")
	const mdHtml = md({
		// enable HTML tags like <small>
		html: true,
	}).render(file.toString())

	// HACK: inject the version into the document itself
	// const rtn = mdHtml
	const rtn = mdHtml + `<small>${version}</small>`

	status(null)

	return rtn
}
