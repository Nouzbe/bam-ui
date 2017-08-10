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
    position: 'relative',
    zIndex: 3
  },
  'bt-header': {
    float: 'left',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    borderBottom: '1px solid #b3b3b3',
    textAlign: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    padding: '3px',
    background: '#fff',
  },
  'bt-header-right-border': {
    float: 'right', 
    position: 'absolute',
    right: '-3px',
    zIndex: 4,
    width: '1px', 
    height: 'calc(100% - 1px)', 
    backgroundColor: '#b3b3b3',
    borderLeft: '3px solid #fff', 
    borderRight: '3px solid #fff',
    cursor: 'col-resize'
  },
  'bt-cell': {
    height: '100%',
    boxSizing: 'border-box',
    borderRight: '1px solid #d3d3d3',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    padding: '3px'
  },
  'bt-cell-bottom-border': {
    height: '1px',
    backgroundColor: '#d3d3d3',
    borderTop: '3px solid #fff', 
    borderBottom: '3px solid #fff',
    width: 'calc(100% - 1px)',
    position: 'absolute',
    bottom: '-3px',
    zIndex: 2,
    cursor: 'row-resize'
  },
  'bt-column': {
    float: 'left',
    height: '100%'
  },
  'bt-column-body': {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  'bt-scroll-guide': {
    boxSizing: 'border-box', 
    borderRight: '1px solid #b3b3b3',
    width: '15px'
  },
  'bt-scroll-handle': {
    backgroundColor: '#c3c3c3',
    transition: 'top 50ms, left 50ms',
    ':hover': {
      backgroundColor: '#d3d3d3',
    }
  }
};

export default (className, style) => `${className} ${css(Object.assign(styles[className], style || {}))}`;
