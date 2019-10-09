function pxToRems(pixels, base) {
  return pixels / base;
}

module.exports = ({ mediaQuery: _mediaQuery = '', mediaOptions, remBase }) => {
  const mediaQuery                = _mediaQuery.replace(/:/g, ': ').replace(/,/g, ', ').replace(/  /g, ' ')

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

  const isDesktop = (
    desktop.test(mediaQuery)
    || tabletLandscapeAndHigher.test(mediaQuery)
    || tabletPortraitAndHigher.test(mediaQuery)
    || exceptMobile.test(mediaQuery)
  )

  const isTabletLandscape = (
    tablet.test(mediaQuery)
    || tabletLandscape.test(mediaQuery)
   || tabletPortraitAndHigher.test(mediaQuery)
    || tabletLandscapeAndLower.test(mediaQuery)
   || tabletLandscapeAndHigher.test(mediaQuery)
   || exceptMobile.test(mediaQuery)
    || exceptDesktop.test(mediaQuery)
  )

  const isTabletPortrait = (
    tablet.test(mediaQuery)
    || tabletPortrait.test(mediaQuery)
    || tabletPortraitAndHigher.test(mediaQuery)
    || tabletPortraitAndLower.test(mediaQuery)
   || tabletLandscapeAndLower.test(mediaQuery)
   || exceptMobile.test(mediaQuery)
    || exceptDesktop.test(mediaQuery)
  )

  const isTablet = isTabletPortrait || isTabletLandscape

  const isMobile = (
    mobile.test(mediaQuery)
    || tabletPortraitAndLower.test(mediaQuery)
    || tabletLandscapeAndLower.test(mediaQuery)
    || exceptDesktop.test(mediaQuery)
  )

  return {
    isDesktop,
    isTablet,
    isTabletLandscape,
    isTabletPortrait,
    isMobile,
  }
}
