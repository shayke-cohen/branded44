// React Native SVG polyfill for web
import React from 'react';

// Basic SVG components that work in web
export const Svg = ({ children, width, height, viewBox, ...props }) => {
  return React.createElement('svg', {
    width,
    height,
    viewBox,
    xmlns: 'http://www.w3.org/2000/svg',
    ...props
  }, children);
};

export const Circle = ({ cx, cy, r, fill, stroke, strokeWidth, ...props }) => {
  return React.createElement('circle', {
    cx,
    cy,
    r,
    fill,
    stroke,
    strokeWidth,
    ...props
  });
};

export const Rect = ({ x, y, width, height, fill, stroke, strokeWidth, ...props }) => {
  return React.createElement('rect', {
    x,
    y,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    ...props
  });
};

export const Path = ({ d, fill, stroke, strokeWidth, ...props }) => {
  return React.createElement('path', {
    d,
    fill,
    stroke,
    strokeWidth,
    ...props
  });
};

export const G = ({ children, ...props }) => {
  return React.createElement('g', props, children);
};

export const Text = ({ children, x, y, fontSize, fill, ...props }) => {
  return React.createElement('text', {
    x,
    y,
    fontSize,
    fill,
    ...props
  }, children);
};

export const Line = ({ x1, y1, x2, y2, stroke, strokeWidth, ...props }) => {
  return React.createElement('line', {
    x1,
    y1,
    x2,
    y2,
    stroke,
    strokeWidth,
    ...props
  });
};

export const Polygon = ({ points, fill, stroke, strokeWidth, ...props }) => {
  return React.createElement('polygon', {
    points,
    fill,
    stroke,
    strokeWidth,
    ...props
  });
};

export const Polyline = ({ points, fill, stroke, strokeWidth, ...props }) => {
  return React.createElement('polyline', {
    points,
    fill,
    stroke,
    strokeWidth,
    ...props
  });
};

export default {
  Svg,
  Circle,
  Rect,
  Path,
  G,
  Text,
  Line,
  Polygon,
  Polyline,
};
