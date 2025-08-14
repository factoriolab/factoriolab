/** @type {import('stylelint').Config} */
export default {
  plugins: ['stylelint-order'],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-tailwindcss',
    'stylelint-config-concentric-order',
  ],
  rules: {
    'order/order': null,
    'selector-pseudo-element-no-unknown': [
      true,
      { ignorePseudoElements: ['ng-deep'] },
    ],
    'at-rule-no-deprecated': [true, { ignoreAtRules: 'apply' }],
  },
};
