import React from 'react';
import style from './style.js';

export default props => (
    props.visible ? 
        <div 
            className={style('bt-floating-border')}
            style={{
                background: props.color,
                height: (props.top || props.bottom) ? props.height || 1 : '100%',
                width: (props.top || props.bottom) ? '100%' : props.width || 1,
                bottom: (props.top || props.bottom) ? props.offset || 0 :'none',
                right: props.right ? props.offset || 0 : 'none',
                left: props.left ? props.offset || 0 : (props.top || props.bottom) ? 0 : 'none',
                top: props.top ? props.offset || 0 : (props.left || props.right) ? 0 : 'none',
                bottom: props.bottom ? props.offset || 0 : 'none',
                zIndex: props.zIndex || 7
            }}
        />
    :
        null
);