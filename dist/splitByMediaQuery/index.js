const css            = require('css')
const CleanCSS       = require('clean-css')
const matchMedia     = require('./matchMedia')

module.exports = ({ cssSource, mediaOptions, remBase }) => {
  const output       = {}
  const textOutput   = {}
  const inputRules   = css.parse(cssSource).stylesheet.rules
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
      addToAll(rule)
    }
  })

  Object.keys(outputRules).forEach((mediaType) => {
    output[mediaType]      = []
    textOutput[mediaType]  = ''
    const rules            = outputRules[mediaType]

    const style = css.stringify({
      type: 'stylesheet',
      stylesheet: { rules }
    })

    textOutput[mediaType] = (new CleanCSS().minify(style)).styles
  })

  textOutput.common = 'html{}'

  return textOutput
}
