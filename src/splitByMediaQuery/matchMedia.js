// @ts-check

/**
 * @typedef {import('../index.js').MediaOptions} MediaOptions
 * @typedef {import('../index.js').Units} Units
 */

/**
 * @param {Object} options
 * @param {string} [options.mediaQuery]
 * @param {MediaOptions} options.mediaOptions
 * @param {Units} options.units
 */
module.exports = ({ mediaQuery = "", mediaOptions, units }) => {
  const {
    desktopStart,
    tabletLandscapeStart,
    tabletLandscapeEnd,
    tabletPortraitStart,
    tabletPortraitEnd,
    mobileEnd
  } = mediaOptions;
  const normalizedMediaQuery = mediaQuery
    .replace(/:/g, ": ")
    .replace(/,/g, ", ")
    .replace(/  /g, " ");

  const desktop = buildRegex({ minWidth: desktopStart, units });
  const tabletLandscape = buildRegex({
    minWidth: tabletLandscapeStart,
    maxWidth: tabletLandscapeEnd,
    units,
  });
  const tablet = buildRegex({
    minWidth: tabletPortraitStart,
    maxWidth: tabletLandscapeEnd,
    units,
  });
  const tabletPortrait = buildRegex({
    minWidth: tabletPortraitStart,
    maxWidth: tabletPortraitEnd,
    units,
  });
  const mobile = buildRegex({ maxWidth: mobileEnd, units });
  const tabletLandscapeAndHigher = buildRegex({
    minWidth: tabletLandscapeStart,
    units,
  });
  const tabletLandscapeAndLower = buildRegex({
    maxWidth: tabletLandscapeEnd,
    units,
  });
  const exceptDesktop = buildRegex({
    maxWidth: tabletLandscapeEnd,
    units,
  });
  const tabletPortraitAndHigher = buildRegex({
    minWidth: tabletPortraitStart,
    units,
  });
  const tabletPortraitAndLower = buildRegex({
    maxWidth: tabletPortraitEnd,
    units,
  });

  const isDesktop =
    desktop.test(normalizedMediaQuery) ||
    tabletLandscapeAndHigher.test(normalizedMediaQuery) ||
    tabletPortraitAndHigher.test(normalizedMediaQuery);

  const isTabletLandscape =
    tablet.test(normalizedMediaQuery) ||
    tabletLandscape.test(normalizedMediaQuery) ||
    tabletPortraitAndHigher.test(normalizedMediaQuery) ||
    tabletLandscapeAndLower.test(normalizedMediaQuery) ||
    tabletLandscapeAndHigher.test(normalizedMediaQuery) ||
    exceptDesktop.test(normalizedMediaQuery);

  const isTabletPortrait =
    tablet.test(normalizedMediaQuery) ||
    tabletPortrait.test(normalizedMediaQuery) ||
    tabletPortraitAndHigher.test(normalizedMediaQuery) ||
    tabletPortraitAndLower.test(normalizedMediaQuery) ||
    tabletLandscapeAndLower.test(normalizedMediaQuery) ||
    exceptDesktop.test(normalizedMediaQuery);

  const isTablet = isTabletPortrait || isTabletLandscape;

  const isMobile =
    mobile.test(normalizedMediaQuery) ||
    tabletPortraitAndLower.test(normalizedMediaQuery) ||
    tabletLandscapeAndLower.test(normalizedMediaQuery) ||
    exceptDesktop.test(normalizedMediaQuery);

  return {
    isDesktop,
    isTablet,
    isTabletLandscape,
    isTabletPortrait,
    isMobile
  };
};

/**
 * @param {Object} options 
 * @param {number} [options.minWidth]
 * @param {number} [options.maxWidth]
 * @param {Units} options.units
 */
function buildRegex({ minWidth, maxWidth, units }) {
  const pieces = [];
  if (minWidth) {
    pieces.push(
      `(min-width: (${minWidth}${units}))`
    );
  }
  if (maxWidth) {
    pieces.push(
      `(max-width: (${maxWidth}${units}))`
    );
  }
  return new RegExp(pieces.join(" and "));
}
