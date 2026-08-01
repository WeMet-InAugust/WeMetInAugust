Font Subsetting and Deployment

This document explains how to produce subsetted webfonts (.woff2) for improved LCP and reduced payload size.

Requirements
- Python 3
- fonttools (pip install fonttools)
- Source TTF/OTF font files (place them under fonts/source/)

Quick steps
1. Install fonttools:
   pip install fonttools

2. Run the subset script (example):
   ./scripts/subset-fonts.sh fonts/source/EBGaramond-Regular.ttf "U+0020-007E" fonts/EBGaramond-Regular.woff2

Notes
- The unicode range above includes basic Latin characters (U+0020-007E). Adjust ranges for additional language coverage.
- Keep the original full fonts in a private source directory. Commit only subsetted .woff2 files in /fonts/ for the web.
- We recommend generating separate subsets for Regular/Bold/Italic and variable fonts as needed.

Font CSS
- Add @font-face declarations in css/fonts.css pointing to the subsetted /fonts/*.woff2 files with font-display: swap and crossOrigin support.

Example @font-face snippet

@font-face {
  font-family: 'EB Garamond';
  src: url('/fonts/EBGaramond-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

Automation
- Consider adding this script to CI to produce fonts automatically from source assets if you have the legal rights and source files available.
