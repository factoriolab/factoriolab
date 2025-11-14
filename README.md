# FactorioLab

[![prod](https://github.com/factoriolab/factoriolab/actions/workflows/prod.yml/badge.svg)](https://github.com/factoriolab/factoriolab/actions/workflows/prod.yml) [![tests](https://github.com/factoriolab/factoriolab/actions/workflows/tests.yml/badge.svg)](https://github.com/factoriolab/factoriolab/actions/workflows/tests.yml)

This is the repository for the [FactorioLab](https://factoriolab.github.io) project, a tool for calculating resource and factory requirements for factory games.

| Supported games                                                   |                                                              |                                                                            |
| ----------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| [Factorio](https://factorio.com)                                  | [Calculator](https://factoriolab.github.io/factorio)         | [Steam](https://store.steampowered.com/app/427520/Factorio/)               |
| Dyson Sphere Program                                              | [Calculator](https://factoriolab.github.io/dsp)              | [Steam](https://store.steampowered.com/app/1366540/Dyson_Sphere_Program/)  |
| [Satisfactory](https://www.satisfactorygame.com/)                 | [Calculator](https://factoriolab.github.io/satisfactory)     | [Steam](https://store.steampowered.com/app/526870/Satisfactory/)           |
| [Captain of Industry](https://www.captain-of-industry.com/)       | [Calculator](https://factoriolab.github.io/coi)              | [Steam](https://store.steampowered.com/app/1594320/Captain_of_Industry/)   |
| [Techtonica](https://techtonicagame.com/)                         | [Calculator](https://factoriolab.github.io/techtonica)       | [Steam](https://store.steampowered.com/app/1457320/Techtonica/)            |
| Final Factory                                                     | [Calculator](https://factoriolab.github.io/final-factory)    | [Steam](https://store.steampowered.com/app/1383150/Final_Factory/)         |
| [Factor Y](https://buckmartin.de/products/factor-y.html)          | [Calculator](https://factoriolab.github.io/fay)              | [Steam](https://store.steampowered.com/app/2220850?utm_source=FactorioLab) |
| [Foundry](https://www.paradoxinteractive.com/games/foundry/about) | [Calculator](https://factoriolab.github.io/foundry)          | [Steam](https://store.steampowered.com/app/983870/FOUNDRY/)                |
| Outworld Station                                                  | [Calculator](https://factoriolab.github.io/outworld-station) | [Steam](https://store.steampowered.com/app/3242950/Outworld_Station/)      |

This project is intended to build on the features of the Kirk McDonald [Factorio Calculator](https://kirkmcdonald.github.io) ([GitHub](https://github.com/KirkMcDonald/kirkmcdonald.github.io)). It is built from the ground up using Angular, Redux, and TypeScript.

**To submit suggestions or issues,** please check out the [issues page](https://github.com/factoriolab/factoriolab/issues).

**To discuss the calculator,** join the [Discord](https://discord.gg/N4FKV687x2).

**If you love FactorioLab,** consider supporting it by [buying me a ☕](https://ko-fi.com/dcbroad3)!

## Running online

The calculator can be found at <https://factoriolab.github.io>.  
The staging environment, for testing pull requests, can be found at <https://factoriolab.github.io/staging>.

## Running locally

To run this project locally:

1. Install [NodeJS](https://nodejs.org/en/)
1. Install dependencies, using `npm ci`
1. Build and serve the project, using `npm start`
1. Open a browser at <http://localhost:4200>

The app will reload automatically if source code is changed.

## Running tests

To run the automated unit tests:

1. Install NodeJs, Angular CLI, and the dependencies as described above
2. Build and run the tests, using `npm test`

## Contributing language data

Language data is stored in the [i18n](./public/i18n/) folder. Translations are managed via an automated script. The English file, [en.json](./public/i18n/en.json), is the main translation data file; any keys added to that file will be added to all other files, and any keys missing from that file will be removed from other files.

### Setup

In order to fully contribute, you must first fork FactorioLab in GitHub and clone your fork. If you are not experienced with GitHub and git, you are also welcome to copy and modify the raw JSON files, and share them via the [Discord](https://discord.gg/N4FKV687x2).

### Updating files

The main script that maintains translation data is `npm run sync-i18n`. This command:

1. Sorts all of the translation keys in all files, including the English file
1. Removes any translation keys in non-English data files that are not found in the English file
1. Adds English translation values to non-English data files where they are missing

As such, one of the best ways to contribute is to browse the non-English files and replace any English strings with a proper translation, or improve existing translations.

### Adding a new language

In order to add support for a new language, there are a few additional steps.

1. Add a new file in the `i18n` folder, using the localization key for the language. This is usually a two-letter locale code but may include a country code as well where relevant (e.g. pt-BR is Brazilian Portuguese).
1. Enter `{}` in the file for an empty JSON object.
1. Run `npm run sync-i18n`. This should fill in the file with English translations.
1. Replace the English strings with translations.
1. Add the code (which should match the file name) to the Language string union type in [language.ts](./src/translate/language.ts)
1. Add the langage as an `Option` in the `languageOptions` array in the same file.
1. Open a Pull Request with your changes.

Thanks for your help in improving FactorioLab!
