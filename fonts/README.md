This directory will contain subsetted OFL webfonts (.woff2).

I cannot generate real .woff2 font binaries in this environment, so these files are placeholders that explain how to add the generated .woff2 files.

Please generate subsetted .woff2 files locally or in CI using scripts/subset-fonts.sh and copy them here, or upload source TTF/OTF fonts under fonts/source/ and I'll generate subsets when you give me permission.

Expected filenames (examples):
- EBGaramond-Regular.woff2
- EBGaramond-Bold.woff2
- PlayfairDisplay-Regular.woff2
- PlayfairDisplay-Bold.woff2
- CormorantGaramond-Regular.woff2
- Inter-Variable.woff2

Place the real .woff2 files at the paths above so css/fonts.css can load them.
