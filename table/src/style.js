import { css } from 'glamor';

const styles = {
  'bt-container': {
    userSelect: 'none',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    cursor: 'default',
    outline: 'none',
    overflow: 'hidden',
    position: 'relative'
  },
  'bt-header': {
    float: 'left',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  'bt-right-border': {
    float: 'right', 
    position: 'absolute',
    top: 0,
    right: -4,
    width: 8, 
    height: '100%', 
    backgroundColor: 'transparent',
    cursor: 'ew-resize'
  },
  'bt-bottom-border': {
    height: 8,
    backgroundColor: 'transparent',
    width: '100%',
    position: 'absolute',
    bottom: -4,
    cursor: 'ns-resize'
  },
  'bt-cell-container': {
    position: 'relative'
  },
  'bt-cell': {
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  },
  'bt-column': {
    float: 'left',
    height: '100%',
    position: 'relative'
  },
  'bt-column-body': {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  'bt-floating-border': {
    pointerEvents: 'none',
    position: 'absolute'
  },
  'bt-translucent-layer': {
    height: '100%',
    width: '100%',
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    zIndex: 5,
    boxSizing: 'border-box'
  },
  'bt-input': {
    height: '100%',
    width: '100%',
    boxShadow: 'inset 0px 0px 2px 0px #656565',
    outline: 'none',
    border: 'none',
    fontSize: 16,
    boxSizing: 'border-box',
    padding: 2,
    background: '#fbfbfb'
  },
  'bt-horizontal-border': {
    position: 'absolute',
    height: 1,
    background: '#b3b3b3',
    zIndex: 3
  },
  'bt-vertical-border': {
    position: 'absolute',
    width: 1,
    background: '#b3b3b3',
    zIndex: 3
  }
};

export default (className, style) => `${className} ${css(Object.assign(styles[className], style || {}))}`;
