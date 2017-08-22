import { css } from 'glamor';

const styles = {
  'bs-guide': {
    boxSizing: 'border-box', 
    width: '15px',
    position: 'absolute',
  },
  'bs-guide-floating': {
    boxSizing: 'border-box', 
    width: '15px',
    position: 'absolute',
    opacity: 0,
    transition: 'opacity 100ms',
    ':hover': {
      opacity: 0.7
    }
  },
  'bs-handle': {
    backgroundColor: '#999999',
    position: 'absolute',
    zIndex: 1000
  },
  'bs-container': {
    position: 'initial',
    overflow: 'hidden',
    float: 'left',
    height: '100%'
  },
  'bs-content': {
    position: 'relative', 
    height: '100%',
    float: 'left',
    transition: 'top 30ms, left 30ms'
  }
};

export default (className, style) => `${className} ${css(Object.assign(styles[className], style || {}))}`;
