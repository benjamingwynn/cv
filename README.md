# Benjamin's CV

This repo generates a PDF for my CV. I also use this repo to track changes to that document.

The CV is written in markdown under the `document.md` file.

This markdown file first generated to HTML, then puppeteer is used to generate a PDF.

### Prepare the repo

Either with pnpm or npm run `pnpm i` to download dependencies. This is pure node.js project without Typescript.

### Running development web server

Run `pnpm start` to start the dev server, this serve a web server at `localhost:8080` where the document will be rendered to HTML, and will be reloaded whenever the source document (`document.md`) changes.

The web server also injects additional CSS so that the page will be rendered at A4 page size with matching margins of the PDF.

This allows one to style their document and see changes apply in real-time.

### Generating PDF

To generate a PDF simply do one of:

- Hit F5 in VSCode
- Run `pnpm run build`
- Run `node build/print.mjs`

The PDF will be outputted to the `out` folder, and open automatically (provided you're on macos or `xdg-open` is installed)

#### Naming/tagging

The PDF's name will include either the current timestamp with "WIP" or the tag name if the last commit is tagged. To tag and set a name:

```
git tag draft-n
```

This will then change the output to `cv-2024-draft-n.pdf` and add `draft-n` in faint text at the bottom right of the document.

### Known limitations

The webserver and PDF generation only support a single file, so there's no current support for external images/fonts which are served from the local machine. However, external links do work fine.