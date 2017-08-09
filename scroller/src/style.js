import { css } from 'glamor';

const styles = {
  'bs-guide': {
    boxSizing: 'border-box', 
    borderRight: '1px solid #b3b3b3',
    width: '15px'
  },
  'bs-handle': {
    backgroundColor: '#c3c3c3',
    transition: 'top 50ms, left 50ms',
    ':hover': {
      backgroundColor: '#d3d3d3',
    }
  }
};

export default (className, style) => `${className} ${css(Object.assign(styles[className], style || {}))}`;
