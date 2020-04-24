# Factorio Lab

[![Build Status](https://travis-ci.org/factoriolab/factorio-lab.svg?branch=master)](https://travis-ci.org/factoriolab/factorio-lab) [![Known Vulnerabilities](https://snyk.io/test/github/factoriolab/factorio-lab/badge.svg?targetFile=package.json)](https://snyk.io/test/github/factoriolab/factorio-lab?targetFile=package.json)

This is the repository for the [Factorio Lab](https://factoriolab.github.io) project, a tool for calculating resource and factory requirements for the game [Factorio](https://factorio.com).  
This project is intended to build on the features of the Kirk McDonald [Factorio Calculator](https://kirkmcdonald.github.io) ([GitHub](https://github.com/KirkMcDonald/kirkmcdonald.github.io)). It is built from the ground up using Angular, Redux, and Typescript.

## Running locally

To run this project locally:

1. Install [NodeJS](https://nodejs.org/en/)
1. Install Angular CLI, using `npm install -g @angular/cli`
1. Build and serve the project, using `npm start`
1. Open a browser at `http://localhost:4200`

The app will reload automatically if source code is changed.

## Running tests

To run the automated unit tests:

1. Install NodeJs and Angular CLI as described above
2. Build and run the tests, using `npm test`

Currently, this project does not include any end-to-end tests, though the Angular CLI automatically includes a skeleton in the [e2e](./e2e) folder.
