import jasmine from 'karma-jasmine';
import chrome from 'karma-chrome-launcher';
import html from 'karma-jasmine-html-reporter';
import coverage from 'karma-coverage';
import junit from 'karma-junit-reporter';
import path from 'path';

/** @param {import('karma').Config} config */
export default function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [jasmine, chrome, html, coverage, junit],
    client: {
      jasmine: {},
    },
    jasmineHtmlReporter: {
      suppressAll: true, // removes the duplicated traces
    },
    junitReporter: { outputDir: './coverage' },
    coverageReporter: {
      dir: path.join(import.meta.dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'cobertura' },
      ],
      check: {
        global: {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
      },
    },
    files: [
      {
        pattern: 'node_modules/glpk-wasm/dist/glpk.all.wasm',
        watched: true,
        included: false,
        served: true,
      },
    ],
    proxies: {
      '/node_modules': '/base/node_modules',
    },
    reporters: ['progress', 'kjhtml', 'junit'],
    browsers: ['Chrome'],
    restartOnFileChange: true,
  });
}
