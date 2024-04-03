/** @format */

import fsp from "fs/promises"
import {getVersionReal} from "./common.mjs"

function makeDownloadUrl(tag) {
	return `https://github.com/benjamingwynn/cv/releases/download/${tag}/cv-2024-${tag}.pdf`
}

const url = makeDownloadUrl(getVersionReal())
const html = `
<!doctype html>
<head>
	<meta http-equiv="Refresh" content="0; url='${url}'" />
</head>
<body>
	<p style="font-family: system-ui, sans-serif">Please <a href="${url}">click here</a> to download the PDF</p>
</body>
`
await fsp.mkdir("./netlify", {recursive: true})
await fsp.writeFile("./netlify/index.html", html)
