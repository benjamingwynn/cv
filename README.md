# Benjamin's CV

![example workflow](https://github.com/benjamingwynn/cv/actions/workflows/build-deploy.yml/badge.svg)
[![Netlify Status](https://api.netlify.com/api/v1/badges/32e94a93-3d5a-4742-a669-d845b450666b/deploy-status)](https://app.netlify.com/sites/bgcv/deploys)

This repo generates a PDF for my CV. I also use this repo to track changes to that document.

The CV is written in markdown under the `document.md` file.

This markdown file first generated to HTML, then puppeteer is used to generate a PDF.

### Continuous deployment

Github will rebuild the PDF automatically when tagged and upload to Github releases. This is then linked to from the netlify page `cv.benjamingwynn.com` - we could serve the CV as HTML but for consistency I want everyone to have a PDF.

### Prepare the repo

Either with pnpm or npm run `pnpm i` to download dependencies. This is pure node.js project without Typescript.

### Running development web server

Run `pnpm start` to start the dev server, this serve a web server at `localhost:8080` where the document will be rendered to HTML, and will be reloaded whenever the source document (`document.md`) changes.

The web server also injects additional CSS so that the page will be rendered at A4 page size with matching margins of the PDF.

This allows one to style their document and see changes apply in real-time.

### Generating PDF

To generate a PDF simply do one of:

- Hit F5 in VSCode
- Run `pnpm run open`
- Run `node build/print.mjs`

The PDF will be outputted to the `out` folder, and open automatically (provided you're on macos or `xdg-open` is installed)

To build without opening the PDF, do either:

- `pnpm run build`
- `node build/print.mjs --no-open`

#### Naming/tagging

The PDF's name will include either the current timestamp with "WIP" or the tag name if the last commit is tagged. To tag and set a name:

```
git tag draft-n
```

This will then change the output to `cv-2024-draft-n.pdf` and add `draft-n` in faint text at the bottom right of the document.

### Deploying

To deploy, tag the release above ^ then push the tags:

```
git push --tags
```

Github Actions will automatically release a PDF, and `cv.benjamingwynn.com` will be updated to point to it.

### Known limitations

The webserver and PDF generation only support a single file, so there's no current support for external images/fonts which are served from the local machine. However, external links do work fine.