const splitByMediaQuery = require("./splitByMediaQuery");

// todo
const defaults = {
  mobileEnd: {px: 568},
  tabletPortraitStart: {px: 569},
  tabletPortraitEnd: {px: 768},
  tabletLandscapeStart: {px: 769},
  tabletLandscapeEnd: {px: 1024},
  desktopStart: {px: 1025},
};

module.exports = class MediaQuerySplittingPlugin {
  constructor(options) {
    const { media = {}, splitTablet = false, remBase = 16, ignoredSelectors = [] } = options || {};
    this.options = {
      media: {
        mobileEnd: media.mobileEnd || 568,
        tabletPortraitStart: media.mobileEnd ? media.mobileEnd + 1 : 569,
        tabletPortraitEnd: media.tabletPortraitEnd || 768,
        tabletLandscapeStart: media.tabletPortraitEnd
          ? media.tabletPortraitEnd + 1
          : 769,
        tabletLandscapeEnd: media.tabletLandscapeEnd || 1024,
        desktopStart: media.tabletLandscapeEnd
          ? media.tabletLandscapeEnd + 1
          : 1025
      },
      splitTablet,
      remBase,
      ignoredSelectors,
    };
  }

  buildCode() {
    return `
    function debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };

    // matchMedia polyfill
    window.matchMedia||(window.matchMedia=function(){"use strict";var e=window.styleMedia||window.media;if(!e){var t,d=document.createElement("style"),i=document.getElementsByTagName("script")[0];d.type="text/css",d.id="matchmediajs-test",i?i.parentNode.insertBefore(d,i):document.head.appendChild(d),t="getComputedStyle"in window&&window.getComputedStyle(d,null)||d.currentStyle,e={matchMedium:function(e){var i="@media "+e+"{ #matchmediajs-test { width: 1px; } }";return d.styleSheet?d.styleSheet.cssText=i:d.textContent=i,"1px"===t.width}}}return function(t){return{matches:e.matchMedium(t||"all"),media:t||"all"}}}());

    // Define current mediaType
    var getMediaType = function() {
      return {
        isMobile: window.matchMedia('(max-width: ${
          this.options.media.mobileEnd
        }px)').matches,
        isTabletPortrait: window.matchMedia('(min-width: ${
          this.options.media.tabletPortraitStart
        }px) and (max-width: ${
      this.options.media.tabletPortraitEnd
    }px)').matches,
        isTabletLandscape: window.matchMedia('(min-width: ${
          this.options.media.tabletLandscapeStart
        }px) and (max-width: ${
      this.options.media.tabletLandscapeEnd
    }px)').matches,
        isDesktop: window.matchMedia('(min-width: ${
          this.options.media.desktopStart
        }px)').matches,
      }
    };

    var mediaType                = getMediaType();
    var currentMediaType         = 'desktop';

    if (mediaType.isMobile) {
      currentMediaType           = 'mobile'
    }
    ${
      this.options.splitTablet
        ? `
        else if (mediaType.isTabletPortrait) {
          currentMediaType       = 'tabletPortrait'
        }
        else if (mediaType.isTabletLandscape) {
          currentMediaType       = 'tabletLandscape'
        }`
        : `
        else if (mediaType.isTabletPortrait || mediaType.isTabletLandscape) {
          currentMediaType       = 'tablet'
        }
      `
    }

    var collectExistingStylesheets = function(chunkIds) {
      var chunkIds           = {};

      var linkElements = Array
        .prototype
        .slice
        .call(document.getElementsByTagName('link'), 0)
        .filter(element => /style_.*?\.css$/.test(element.href));
      
      for (var i = 0; i < linkElements.length; i++) {
        var chunkHref            = linkElements[i].href.replace(/.*\\//, '');
        
        if (/(mobile|tablet|desktop)/.test(chunkHref)) {
          // media specific stylesheets
          var chunkId            = chunkHref.replace(/\\..*/, '');
          var chunkMediaType     = chunkHref.replace(chunkId + '.', '').replace(/\\..*/, '');
          var chunkHash          = chunkHref.replace(/\\.css$/, '').replace('' + chunkId + '.' + chunkMediaType + '.', '');
          var chunkHrefPrefix    = linkElements[i].href.replace('' + chunkId + '.' + chunkMediaType + '.' + chunkHash + '.css', '');

          if (!chunkIds[chunkId]) {
            chunkIds[chunkId]    = {
              mediaTypes: [ chunkMediaType ],
              hash: chunkHash,
              prefix: chunkHrefPrefix,
            }
          }
          else {
            chunkIds[chunkId].mediaTypes.push(chunkMediaType);
          }
        } else {
          // base stylesheets
          var chunkId            = chunkHref.replace(/\\..*/, '');
          var chunkHash          = chunkHref.replace(/\\.css$/, '').replace('' + chunkId + '.', '');
          var chunkHrefPrefix    = linkElements[i].href.replace('' + chunkId + '.' + chunkHash + '.css', '');

          if (!chunkIds[chunkId]) {
            chunkIds[chunkId]    = {
              mediaTypes: [],
              hash: chunkHash,
              prefix: chunkHrefPrefix,
            }
          }
        }
      }

      return chunkIds;
    };

    var determineLinksToAdd = function(chunkIds) {
      // go through all of the chunks and make sure we have the appropriate media stylesheets in the document
      var linkTagsToAdd = [];
      for (var i in chunkIds) {
        if (chunkIds.hasOwnProperty(i)) {
          var isTablet           = /tablet/.test(currentMediaType);
          var hasTablet          = chunkIds[i].mediaTypes.indexOf('tablet') !== -1;
          var _hasCurrentMedia   = chunkIds[i].mediaTypes.indexOf(currentMediaType) !== -1;
          var hasCurrentMedia    = isTablet ? hasTablet || _hasCurrentMedia : _hasCurrentMedia;

          if (!hasCurrentMedia) {
            var fullhref         = '' + chunkIds[i].prefix + '' + i + '.' + currentMediaType + '.' + chunkIds[i].hash + '.css';
            var linkTag          = document.createElement('link');
            linkTag.rel          = 'stylesheet';
            linkTag.type         = 'text/css';
            linkTag.href         = fullhref;
            linkTag.addEventListener('load', (function(chunkIds) {
              // remove other media types for this chunk
              for(var j = 0; j < chunkIds[i].mediaTypes.length; j++) {
                var oldMediaType = chunkIds[i].mediaTypes[j];
                var linkElementsToRemove = Array
                  .prototype
                  .slice
                  .call(document.getElementsByTagName('link'), 0)
                  .filter(element => new RegExp(i + '.' + oldMediaType + '.*?\\.css').test(element.href));

                for(var k = 0; k < linkElementsToRemove.length; k++) {
                  linkElementsToRemove[k].remove();
                }
              }
            })(chunkIds))

            linkTagsToAdd.push(linkTag);
          }
        }
      }

      return linkTagsToAdd;
    }

    var tryAppendNewMedia = function(linkTagFromMiniCssPlugin, resolveFromMiniCssPlugin, rejectFromMiniCssPlugin) {
      var chunkIds           = collectExistingStylesheets();

      if (linkTagFromMiniCssPlugin) {
        // this is what mini-css-extract-plugin is trying to add.  We need information from it to load the media specific stylesheet
        var chunkHref          = linkTagFromMiniCssPlugin.href.replace(/.*\\//, '');
        var chunkId            = chunkHref.replace(/\\..*/, '');
        var chunkHash          = chunkHref.replace(/\\.css$/, '').replace('' + chunkId + '.', '');
        var chunkHrefPrefix    = linkTagFromMiniCssPlugin.href.replace('' + chunkId + '.' + chunkHash + '.css', '');

        if (!chunkIds[chunkId]) {
          chunkIds[chunkId]    = {
            mediaTypes: [],
            hash: chunkHash,
            prefix: chunkHrefPrefix,
          }
        }
      }

      var linkTagsToAdd = determineLinksToAdd(chunkIds);

      // add the approriate media stylesheets to the document
      Promise.all(linkTagsToAdd.map(function(linkTagToAdd) {
        return new Promise(function(res, rej) {
          linkTagToAdd.onload = res;
          linkTagToAdd.onerror = rej;
        });
      }))
      .then(resolveFromMiniCssPlugin)
      .catch(rejectFromMiniCssPlugin);

      var header = document.getElementsByTagName('head')[0];
      for(var i = 0; i < linkTagsToAdd.length; i++) {
        header.appendChild(linkTagsToAdd[i]);
      }
    };

    var setCurrentMediaType = function() {
      var newMediaType
      var mediaType = getMediaType();

      if (mediaType.isMobile) {
        newMediaType = 'mobile'
      }
      ${
        this.options.splitTablet
          ? `
      else if (mediaType.isTabletPortrait) {
        newMediaType         = 'tabletPortrait'
      }
      else if (mediaType.isTabletLandscape) {
        newMediaType         = 'tabletLandscape'
      }`
          : `
      else if (mediaType.isTabletPortrait || mediaType.isTabletLandscape) {
            newMediaType = 'tablet'
      }`
      }
      else {
        newMediaType = 'desktop'
      }

      if (currentMediaType !== newMediaType) {
        currentMediaType = newMediaType;
      }
    };

    var resizeListener = debounce(() => {
      setCurrentMediaType();
      tryAppendNewMedia();
    }, 250);

    if(!window._MEDIA_CSS_RESIZE_LISTENER_) {
      window.addEventListener('resize', resizeListener);
      window._MEDIA_CSS_RESIZE_LISTENER_ = true;
    }`;
  }

  apply(compiler) {
    const { media: mediaOptions, splitTablet, remBase, ignoredSelectors } = this.options;
    const pluginName = "media-query-splitting-plugin";

    compiler.hooks.thisCompilation.tap(pluginName, compilation => {
      // initial page load
      compilation.mainTemplate.hooks.require.tap(pluginName, source => {
        if (source) {
          return this.buildCode() + source;
        }
      });

      // when accessing code split point
      compilation.mainTemplate.hooks.requireEnsure.tap(pluginName, source => {
        if (source) {
          const promisesString =
            "promises.push(installedCssChunks[chunkId] = new Promise(function(resolve, reject) {";
          const newPromisesString = `
          promises.push(installedCssChunks[chunkId] = Promise.all([ \'common\', currentMediaType ]
            .map(function (mediaType) {
              return new Promise(function(resolve, reject) {
                // Don't load tabletPortrait or tabletLandscape if there is tablet style
                if (/tablet/.test(mediaType)) {
                  var linkElements         = document.getElementsByTagName('link');
                  var hasTabletStyle       = false;
  
                  for (var i = 0; i < linkElements.length; i++) {
                    var chunkHref          = linkElements[i].href.replace(/.*\\//, '');
                    var currentChunkRegExp = new RegExp('^' + chunkId + '\\\\' + '.tablet' + '\\\\' + '.') 
                    
                    if (currentChunkRegExp.test(chunkHref)) {
                      mediaType            = 'tablet';
                      break;
                    }
                  }
                }
          `;

          const promisesBottomRegExp = /head\.appendChild\(linkTag\);(.|\n)*}\)\.then/;
          const newPromisesBottomString =
            "head.appendChild(linkTag);\nsetCurrentMediaType();\ntryAppendNewMedia(linkTag, resolve, reject);\n})\n})).then";

          const hrefString = source
            .replace(/(.|\n)*var href = \"/, "")
            .replace(/\";(.|\n)*/, "");
          const mediaTypeString = hrefString.replace(
            / chunkId /,
            ' chunkId + (mediaType !== "common" ? "."  + mediaType : "") '
          );

          return source
            .replace(promisesString, `${this.buildCode()}${newPromisesString}`)
            .replace(hrefString, mediaTypeString)
            .replace(promisesBottomRegExp, newPromisesBottomString);
        }
      });
    });

    /**
     * build the media-query split CSS files during compilation
     */
    compiler.plugin("emit", (compilation, callback) => {
      const cssChunks = Object.keys(compilation.assets).filter(asset =>
        /\.css$/.test(asset)
      );

      // Split each css chunk
      cssChunks.forEach(chunkName => {
        const asset = compilation.assets[chunkName];
        const child = asset.children && asset.children[0];
        const cssSource =
          typeof asset.source === "function"
            ? asset.source()
            : (child || asset)._value;
        const chunkHash = chunkName.replace(/\.css$/, "").replace(/.*\./, "");
        const chunkId = chunkName.replace(/\..*/, "");
        const splitValue = splitByMediaQuery({
          cssSource,
          mediaOptions,
          remBase,
          ignoredSelectors
        });

        Object.keys(splitValue).forEach(mediaType => {
          const splitMediaChunk = splitValue[mediaType];

          if (splitTablet || !/tablet(Portrait|Landscape)/.test(mediaType)) {
            const isCommon = mediaType === "common";
            const splitMediaChunkFilename = isCommon
              ? chunkName
              : `${chunkId}.${mediaType}.${chunkHash}.css`;

            // Add chunk to assets
            compilation.assets[splitMediaChunkFilename] = {
              size: () => Buffer.byteLength(splitMediaChunk, "utf8"),
              source: () => new Buffer(splitMediaChunk)
            };
          }
        });
      });

      callback();
    });
  }
};
