## Updating StarRupture Data

Requires:

- FModel
- Game mappings (usually acquired from modding sites or directly using [ue4ss](https://github.com/UE4SS-RE/RE-UE4SS) or similar)

Steps:

1. Acquire game mappings
2. Setup FModel to point at the game directory, the mapping file, and output to `factoriolab/sr-data/`
3. Load all packages/archives then navigate to `StarRupture/Content/Chimera`, right click and:
   - Save Folder's Packages Properties
   - Save Folder's Packages Textures
4. Run `npm run starrupture-build`
5. Run `npm run minify-data str` to minify the output JSON
