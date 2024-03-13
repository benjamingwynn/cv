import { markdown, parse } from "markdown";
import fsp from "fs/promises";

const file = await fsp.readFile("./final.md");
const out = markdown.toHTML(file.toString("utf-8"));
await fsp.writeFile("final.html", out);
