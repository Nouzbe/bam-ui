import { css } from 'glamor';

const styles = {
  'bt-container': {
    userSelect: 'none',
    height: '100%',
    width: '100%',
    overflow: 'hidden'
  },
  'bt-header-container': {
    width: '100%',
    position: 'relative'
  },
  'bt-header': {
    float: 'left',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    borderRight: '1px solid #b3b3b3',
    borderBottom: '1px solid #b3b3b3',
    textAlign: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    padding: '3px',
    background: '#f2f2f2',
  },
  'bt-header-right-border': {
    float: 'right', 
    position: 'absolute',
    right: 0,
    width: 8, 
    height: '100%', 
    backgroundColor: 'transparent',
    cursor: 'ew-resize'
  },
  'bt-header-bottom-border': {
    height: 8,
    backgroundColor: 'transparent',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    zIndex: 2,
    cursor: 'ns-resize'
  },
  'bt-cell': {
    height: '100%',
    boxSizing: 'border-box',
    borderRight: '1px solid #d3d3d3',
    borderBottom: '1px solid #d3d3d3',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    padding: '3px'
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
    zIndex: 7,
    pointerEvents: 'none'
  },
  'bt-translucent-layer': {
    height: '100%',
    opacity: 0.1,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    zIndex: 5
  }
};

export default (className, style) => `${className} ${css(Object.assign(styles[className], style || {}))}`;
