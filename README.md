# Layers Embed

**Let visitors read, fill in and sign your contracts right on your website.**

Live demo: https://sumofficeapp.github.io/layers-embed/

One script tag. Links to `.docx`, `.xlsx` and `.pptx` files on your page get a button. Your visitor reads the file, fills it in and sends it for signature in the browser. Nothing to install.

```html
<script src="https://cdn.jsdelivr.net/gh/SumOfficeApp/layers-embed@v1/embed.js" defer></script>

<a data-layers href="/files/contract.docx">Contract</a>
```

Every office link on the page at once:

```html
<script src="https://cdn.jsdelivr.net/gh/SumOfficeApp/layers-embed@v1/embed.js" data-links="all" defer></script>
```

A live document from the catalog of 4,000+ letters, contracts and calculators, filled in right on your page:

```html
<div data-layers-form="invoice-template-with-tax-calculation" data-height="720"></div>
```

## Options

| Attribute on the script tag | What it does |
|---|---|
| `data-links="all"` | Adds the button to every `.docx`, `.xlsx`, `.pptx` link |
| `data-label="Sign this"` | Button text |
| `data-from="my-site"` | Your own tag in Layers statistics |

The file has to be reachable by a public link. Nothing is sent to Layers until the visitor clicks.

## What happens after the click

The file opens in Layers. The visitor can edit it, send it for signature, or save a finished copy to their own account: https://app.layers.md/register?from=door-embed. Plans: https://layers.md/pricing?from=door-embed.

## Also in this repository

`layers-door.js` works in Node 18+ too:

```js
const D = require('./layers-door.js');
D.viewerUrl('https://example.com/contract.docx', 'my-app'); // link that opens the file
const { openUrl } = await D.open('https://example.com/contract.docx', 'my-app'); // ready link for 24 hours
```

MIT. Made by SumOffice.
