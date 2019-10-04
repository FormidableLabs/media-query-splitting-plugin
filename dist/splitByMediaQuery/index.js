const css            = require('css')
const CleanCSS       = require('clean-css')
const matchMedia     = require('./matchMedia')

module.exports = ({ cssFile, mediaOptions, remBase }) => {
  const output       = {}
  const textOutput   = {}
  const inputRules   = css.parse(cssFile).stylesheet.rules
  const outputRules  = {
    common: [],
    desktop: [],
    mobile: [],
    tabletPortrait: [],
    tabletLandscape: [],
    tablet: [],
  }

  function addToAll(rule) {
    outputRules.desktop.push(rule)
    outputRules.tablet.push(rule)
    outputRules.tabletLandscape.push(rule)
    outputRules.tabletPortrait.push(rule)
    outputRules.mobile.push(rule)
  }

  inputRules.forEach(({ type, media }, index) => {
    const {
      isDesktop,
      isTablet,
      isTabletLandscape,
      isTabletPortrait,
      isMobile,
    } = matchMedia({ mediaQuery: media, mediaOptions, remBase })

    const rule       = inputRules[index]
    const isNoMatch  = !isDesktop && !isTablet && !isMobile

    if (type === 'media' && !isNoMatch) {
      if (isDesktop) {
        outputRules.desktop.push(rule)
      }
      if (isTabletLandscape) {
        outputRules.tablet.push(rule)
        outputRules.tabletLandscape.push(rule)
      }
      if (isTabletPortrait) {
        outputRules.tablet.push(rule)
        outputRules.tabletPortrait.push(rule)
      }
      if (isMobile) {
        outputRules.mobile.push(rule)
      }
    }
    else {
      addToAll(rule);
    }
  })

  Object.keys(outputRules).forEach((mediaType) => {
    output[mediaType]      = []
    textOutput[mediaType]  = ''
    const rules            = outputRules[mediaType]

    // Merge duplicates media conditions
    rules.forEach((rule, index) => {
      output[mediaType].push(rule)

      // Stringify styles
      const style = css.stringify({
        type: 'stylesheet',
        stylesheet: { rules: output[mediaType] }
      })

      // Minify styles
      textOutput[mediaType] = (new CleanCSS().minify(style)).styles
    })
  })

  return textOutput
}
