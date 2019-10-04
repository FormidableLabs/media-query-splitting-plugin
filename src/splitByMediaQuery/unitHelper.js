"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pxToRems = pxToRems;
exports.remsToPix = remsToPix;

function pxToRems(pixels, base) {
  return pixels / base;
}

function remsToPix(rems, base) {
  return pixels * base;
}