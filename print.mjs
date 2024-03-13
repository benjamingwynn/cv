#!/usr/bin/env -S node
import md from "markdown-it";
import fsp from "fs/promises";

const file = await fsp.readFile("./final.md");
const markdown = md({
  // enable HTML tags like <small
  html: true,
});
const out = markdown.render(file.toString("utf-8"));
await fsp.writeFile("final.html", out);
