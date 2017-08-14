import React from 'react';
import style from './style.js';

export default props => props.visible ? <div className={style('bt-translucent-layer')} style={{width: props.width, background: props.color}}/> : null;