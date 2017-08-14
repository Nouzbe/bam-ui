import React from 'react';
import style from './style.js';

export default props => (
    props.visible ? 
        <div 
            className={style('bt-floating-border')}
            style={{
                background: props.color,
                height: props.horizontal ? 1 : '100%',
                width: props.horizontal ? '100%' : (props.left !== undefined ? 2 : 1),
                bottom: props.horizontal ? 2 : 0,
                right: props.horizontal ? 0 : 2,
                left: props.left !== undefined ? props.left : 'auto',
                position: props.left !== undefined ? 'fixed' : 'absolute'
            }}
        />
    :
        null
);