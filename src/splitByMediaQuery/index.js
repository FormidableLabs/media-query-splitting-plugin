// @ts-check

/**
 * @typedef {import('../index.js').MediaOptions} MediaOptions
 * @typedef {import('../index.js').Units} Units
 */

const css = require("css");
const CleanCSS = require("clean-css");
const matchMedia = require("./matchMedia");


/**
 * @param {Object} rule
 * @param {string[]} excludedSelectors
 * @return {boolean}
 */
function shouldBeExcluded(rule, excludedSelectors) {
  if (!rule.rules) return false;
  const allSelectors = rule.rules.map(({ selectors }) => selectors.join(","));
  return excludedSelectors.some(excludedSelector => allSelectors.includes(excludedSelector))
}

/**
 * @param {Object} options
 * @param {string} options.cssSource
 * @param {MediaOptions} options.mediaOptions
 * @param {number} options.remBase
 * @param {string[]} options.ignoredSelectors
 * @param {Units} options.units
 */
module.exports = ({ cssSource, mediaOptions, ignoredSelectors, units }) => {
  const output = {};
  const textOutput = {};

  const inputRules = css.parse(cssSource).stylesheet.rules;
  const outputRules = {
    common: [],
    desktop: [],
    mobile: [],
    tabletPortrait: [],
    tabletLandscape: [],
    tablet: []
  };
  const hasIgnoredSelectors = ignoredSelectors.length > 0;

  inputRules.forEach((rule) => {
    const {
      isDesktop,
      isTablet,
      isTabletLandscape,
      isTabletPortrait,
      isMobile
    } = matchMedia({ mediaQuery: rule.media, mediaOptions, units });

    const isNoMatch = !isDesktop && !isTablet && !isMobile;

    if (rule.type === "media") {
      if (hasIgnoredSelectors && shouldBeExcluded(rule, ignoredSelectors)) {
        outputRules.common.push(rule);
      } else {
        if (isDesktop) {
          outputRules.desktop.push(rule);
        }
        if (isTabletLandscape) {
          outputRules.tablet.push(rule);
          outputRules.tabletLandscape.push(rule);
        }
        if (isTabletPortrait) {
          outputRules.tablet.push(rule);
          outputRules.tabletPortrait.push(rule);
        }
        if (isMobile) {
          outputRules.mobile.push(rule);
        }
        if (isNoMatch) {
          outputRules.common.push(rule);
        }
      }
    } else {
      outputRules.common.push(rule);
    }
  });

  Object.keys(outputRules).forEach(mediaType => {
    output[mediaType] = [];
    textOutput[mediaType] = [];
    const rules = outputRules[mediaType];

    // Merge consecutive duplicate media conditions
    rules.forEach((rule, index) => {
      const { media, rules, position } = rule;

      const mediaRules = output[mediaType];
      const lastMedia = mediaRules.length ? mediaRules[mediaRules.length - 1].media : null;
      const mediaIndex = output[mediaType]
        .map(({ media }) => media)
        .indexOf(media);

      if (media && lastMedia === media) {
        output[mediaType][mediaIndex].rules = output[mediaType][
          mediaIndex
        ].rules.concat(rules);
      } else {
        output[mediaType].push(rule);
      }
    });

    // Stringify styles
    const style = css.stringify({
      type: "stylesheet",
      stylesheet: { rules: output[mediaType] }
    });

    // Minify styles
    textOutput[mediaType] = new CleanCSS().minify(style).styles;
  });

  return textOutput;
};
