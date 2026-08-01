This directory will contain subsetted OFL webfonts (.woff2).

Chosen open/free fonts for this project (download from Google Fonts or FontSquirrel/FontSpace):

- Playfair Display (PlayfairDisplay-Regular.woff2, PlayfairDisplay-Bold.woff2)
  https://fonts.google.com/specimen/Playfair+Display

- Inter (variable) (Inter-Variable.woff2)
  https://fonts.google.com/specimen/Inter
  or https://rsms.me/inter/

- Cormorant Garamond (CormorantGaramond-Regular.woff2)
  https://fonts.google.com/specimen/Cormorant+Garamond

- Great Vibes (script) — used as an Aston Script Pro approximation for hero headers (GreatVibes-Regular.woff2)
  https://fonts.google.com/specimen/Great+Vibes

- Oswald / Archivo Narrow (for condensed display headings) (Oswald-Regular.woff2 or ArchivoNarrow-Regular.woff2)
  https://fonts.google.com/specimen/Oswald
  https://fonts.google.com/specimen/Archivo+Narrow

- Montserrat / Space Grotesk (minimal sans for photography pages) (Montserrat-Regular.woff2)
  https://fonts.google.com/specimen/Montserrat

- Lora / Merriweather (readable body serifs) (Lora-Regular.woff2, Merriweather-Regular.woff2)
  https://fonts.google.com/specimen/Lora
  https://fonts.google.com/specimen/Merriweather

Recommended workflow
1. Download the chosen fonts (sources above). If you have paid/licensed fonts (Aston Script Pro), upload the licensed TTF/OTF files under fonts/source/ and confirm licensing.
2. Run scripts/subset-fonts.sh locally or in CI to generate subsetted .woff2 files for the weights you need (2–3 weights per family is typical).
   Example (local):
     ./scripts/subset-fonts.sh "fonts/source/PlayfairDisplay-*.ttf" PlayfairDisplay
   The script will output optimized .woff2 files into /fonts/ (e.g. PlayfairDisplay-Regular.woff2).
3. Commit the generated .woff2 files into this /fonts/ directory (replace the .placeholder files included here).
4. Once the .woff2 files are present, css/fonts.css will load them and each page voice will render as configured.

Notes about Aston Script Pro / paid fonts
- I selected Great Vibes as a stylistic, open-source stand‑in for Aston Script Pro to approximate the flourished script style for hero headings.
- If you own Aston Script Pro and want the exact font used, upload the licensed TTF/OTF files in fonts/source/ and confirm that you have rights to include them in the repository; I will then generate subsets and swap them into the hero header as requested.

Placeholder files (replace with real subset .woff2 binaries):
- PlayfairDisplay-Regular.woff2
- PlayfairDisplay-Bold.woff2
- Inter-Variable.woff2
- CormorantGaramond-Regular.woff2
- GreatVibes-Regular.woff2
- Oswald-Regular.woff2
- Montserrat-Regular.woff2
- Lora-Regular.woff2
- Merriweather-Regular.woff2

