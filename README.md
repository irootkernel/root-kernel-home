# Root Kernel Home

Static website package for GitHub Pages.

The published HTML is generated from the canonical copy in `../docs` and the local,
gitignored build workspace in `_workspace/r5`. Do not edit generated locale pages,
redirect stubs, `404.html`, `index.html`, or `sitemap.xml` by hand.

```bash
python3 _workspace/r5/build/build.py
BASE=http://127.0.0.1:8000 bash _workspace/r5/tools/run-all.sh
```

The validation suite checks HTML and metadata, copy provenance and KO/EN parity,
published-asset/IP policy, the R13 flight contract, no-JavaScript rendering, grid
alignment, and performance. Validation artifacts stay under the ignored `_workspace`.
