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

    // if (media && JSON.stringify(rule).includes("masonry-grid-tile__cta:after")) {
    //   console.log("=========================");
    //   console.log({
    //     isNoMatch,
    //     media,
    //     isDesktop,
    //     isTablet,
    //     isTabletLandscape,
    //     isTabletPortrait,
    //     isMobile
    //   });
    //   console.log(rule);
    // }

    // // todo: why are mobile styles ending up in other stylesheets?
    // if (type === 'media' && isNoMatch) {
    //   debugger;
    //   console.log('=========================');
    //   console.log(`(max-width: (${mediaOptions.mobileEnd}px)|${pxToRems(mediaOptions.mobileEnd, remBase)}rem)`);
    //   console.log("no match", {
    //     media,
    //     isDesktop,
    //     isTablet,
    //     isTabletLandscape,
    //     isTabletPortrait,
    //     isMobile
    //   });
    //   console.log(rule);
    // }

    //outputRules.common.push(rule)

    // if (type === 'media' && !isNoMatch) {
    //   if (isDesktop) {
    //     outputRules.desktop.push(rule)
    //   }
    //   if (isTabletLandscape) {
    //     outputRules.tablet.push(rule)
    //     outputRules.tabletLandscape.push(rule)
    //   }
    //   if (isTabletPortrait) {
    //     outputRules.tablet.push(rule)
    //     outputRules.tabletPortrait.push(rule)
    //   }
    //   if (isMobile) {
    //     outputRules.mobile.push(rule)
    //   }
    // }
    // else {
    //   addToAll(rule)
    // }


    if (type === 'media') {
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
      if (isNoMatch) {
        outputRules.common.push(rule)
      }
    }
    else {
      outputRules.common.push(rule)
    }
  })

  Object.keys(outputRules).forEach((mediaType) => {
    // output[mediaType]      = []
    // textOutput[mediaType]  = ''
    // const rules            = outputRules[mediaType]

    // // todo: source map?
    // const style = css.stringify({
    //   type: 'stylesheet',
    //   stylesheet: { rules }
    // })

    // textOutput[mediaType] = (new CleanCSS().minify(style)).styles

    output[mediaType]      = []
    textOutput[mediaType] = []
    const rules      = outputRules[mediaType]

    // Merge duplicates media conditions
    rules.forEach((rule, index) => {
      const { media, rules, position } = rule

      const foo = output[mediaType]
      const lastMedia = foo.length ? foo[foo.length - 1].media : null;
      const mediaIndex = output[mediaType].map(({ media }) => media).indexOf(media)

      if(media && lastMedia === media) {
        output[mediaType][mediaIndex].rules = output[mediaType][mediaIndex].rules.concat(rules)
      } else {
        output[mediaType].push(rule)
      }

      // if (!media || mediaIndex < 0) {
      //   output[mediaType].push(rule)
      // }
      // else {
      //   output[mediaType][mediaIndex].rules = output[mediaType][mediaIndex].rules.concat(rules)
      // }
    })

    // Stringify styles
    const style = css.stringify({
      type: 'stylesheet',
      stylesheet: { rules: output[mediaType] }
    })

    // Minify styles
    textOutput[mediaType] = (new CleanCSS().minify(style)).styles
  })

  //textOutput.common = 'html{}'

  return textOutput
}

function pxToRems(pixels, base) {
  return pixels / base;
}