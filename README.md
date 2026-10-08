# Root Kernel Home

Generated homepage for GitHub Pages at https://rootkernel.xyz (v5): Korean at
`/`, English under `/en/`.
`www.rootkernel.xyz` redirects here through GitHub Pages, and
`home.rootkernel.xyz` through a redirect page in the separate
`root-kernel-home-redirect` repository.
Do not hand-edit public HTML, JavaScript, CSS, or generated-files.json.

From the sibling generator repository:

```sh
make test
make deliver
```

`make deliver` updates this checkout and removes obsolete files named in the
managed output list. It does not commit, push, or publish. Repository and local
tool settings are preserved. GitHub Pages publishes `main` from the root when a
separately authorized push is made. `build-info.json` records source hashes.

Every route has its own `index.html` in both languages, with its own title,
description, canonical URL, and hreflang links to its twin. Every page also
carries the company's facts: a footer with the name, founder, business
registration number, address, email, and founding year, and the same
Organization JSON-LD. The v4 `/ko/` addresses redirect to the matching Korean
page; its `/en/` addresses are English pages.
The site loads three.js r170 (MIT) from `vendor/`.
