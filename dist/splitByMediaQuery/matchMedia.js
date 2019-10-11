function pxToRems(pixels, base) {
  return pixels / base;
}

module.exports = ({ mediaQuery: _mediaQuery = '', mediaOptions, remBase }) => {
  const normalizedMediaQuery = _mediaQuery.replace(/:/g, ': ').replace(/,/g, ', ').replace(/  /g, ' ')

  // todo: clean this up
  const desktop                   = new RegExp(`(min-width: (${mediaOptions.desktopStart}px)|(${pxToRems(mediaOptions.desktopStart, remBase)}rem))`)
  const tabletLandscape           = new RegExp(`(min-width: (${mediaOptions.tabletLandscapeStart}px)|(${pxToRems(mediaOptions.tabletLandscapeStart, remBase)}rem)) and (max-width: (${mediaOptions.tabletLandscapeEnd}px)|(${pxToRems(mediaOptions.tabletLandscapeEnd, remBase)}rem))`)
  const tablet                    = new RegExp(`(min-width: (${mediaOptions.tabletPortraitStart}px)|(${pxToRems(mediaOptions.tabletPortraitStart, remBase)}rem)) and (max-width: (${mediaOptions.tabletLandscapeEnd}px)|(${pxToRems(mediaOptions.tabletLandscapeEnd, remBase)}rem))`)
  const tabletPortrait            = new RegExp(`(min-width: (${mediaOptions.tabletPortraitStart}px)|(${pxToRems(mediaOptions.tabletPortraitStart, remBase)}rem)) and (max-width: (${mediaOptions.tabletPortraitEnd}px)|(${pxToRems(mediaOptions.tabletPortraitEnd, remBase)}rem))`)
  const mobile                    = new RegExp(`(max-width: (${mediaOptions.mobileEnd}px)|(${pxToRems(mediaOptions.mobileEnd, remBase)}rem))`)
  const tabletLandscapeAndHigher  = new RegExp(`(min-width: (${mediaOptions.tabletLandscapeStart}px)|(${pxToRems(mediaOptions.tabletLandscapeStart, remBase)}rem))`)
  const tabletLandscapeAndLower   = new RegExp(`(max-width: (${mediaOptions.tabletLandscapeEnd}px)|(${pxToRems(mediaOptions.tabletLandscapeEnd, remBase)}rem))`)
  const exceptMobile              = new RegExp(`(min-width: (${mediaOptions.tabletPortraitStart}px)|(${pxToRems(mediaOptions.tabletPortraitStart, remBase)}rem))`)
  const exceptDesktop             = new RegExp(`(max-width: (${mediaOptions.tabletLandscapeEnd}px)|(${pxToRems(mediaOptions.tabletLandscapeEnd, remBase)}rem))`)
  const tabletPortraitAndHigher   = new RegExp(`(min-width: (${mediaOptions.tabletPortraitStart}px)|(${pxToRems(mediaOptions.tabletPortraitStart, remBase)}rem))`)
  const tabletPortraitAndLower    = new RegExp(`(max-width: (${mediaOptions.tabletPortraitEnd}px)|(${pxToRems(mediaOptions.tabletPortraitEnd, remBase)}rem))`)

  const isDesktop =
    desktop.test(normalizedMediaQuery) ||
    tabletLandscapeAndHigher.test(normalizedMediaQuery) ||
    tabletPortraitAndHigher.test(normalizedMediaQuery) ||
    exceptMobile.test(normalizedMediaQuery);

  const isTabletLandscape =
    tablet.test(normalizedMediaQuery) ||
    tabletLandscape.test(normalizedMediaQuery) ||
    tabletPortraitAndHigher.test(normalizedMediaQuery) ||
    tabletLandscapeAndLower.test(normalizedMediaQuery) ||
    tabletLandscapeAndHigher.test(normalizedMediaQuery) ||
    exceptMobile.test(normalizedMediaQuery) ||
    exceptDesktop.test(normalizedMediaQuery);

  const isTabletPortrait =
    tablet.test(normalizedMediaQuery) ||
    tabletPortrait.test(normalizedMediaQuery) ||
    tabletPortraitAndHigher.test(normalizedMediaQuery) ||
    tabletPortraitAndLower.test(normalizedMediaQuery) ||
    tabletLandscapeAndLower.test(normalizedMediaQuery) ||
    exceptMobile.test(normalizedMediaQuery) ||
    exceptDesktop.test(normalizedMediaQuery);

  const isTablet = isTabletPortrait || isTabletLandscape

  const isMobile = (
    mobile.test(normalizedMediaQuery)
    || tabletPortraitAndLower.test(normalizedMediaQuery)
    || tabletLandscapeAndLower.test(normalizedMediaQuery)
    || exceptDesktop.test(normalizedMediaQuery)
  )

  return {
    isDesktop,
    isTablet,
    isTabletLandscape,
    isTabletPortrait,
    isMobile,
  }
}
