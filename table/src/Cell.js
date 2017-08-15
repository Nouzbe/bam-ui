import React from 'react';
import style from './style.js';
import FloatingBorder from './FloatingBorder.js';

export default props => {
    return (
    <div 
        ref={props.rowRef ? e => props.rowRef(e) : undefined}
        onMouseDown={e => e.button === 0 ? props.onSelectCellsStart(e) : null}
        className={style('bt-cell-container')}
        style={{
            height: `${props.height}px`,
            backgroundColor: props.isSelected ? props.selectHintColor : '#fff'
        }} 
    >
        <div className={style("bt-cell")}>{props.cell.caption}</div>
        <FloatingBorder top visible={props.isTopOfSelection} height={2} color={props.selectHintBorderColor} zIndex={2}/>
        <FloatingBorder bottom visible={props.isBottomOfSelection} height={2} color={props.selectHintBorderColor} zIndex={2}/>
        <FloatingBorder left visible={props.isLeftOfSelection} width={2} color={props.selectHintBorderColor} zIndex={2}/>
        <FloatingBorder right visible={props.isRightOfSelection} width={2} color={props.selectHintBorderColor} zIndex={2}/>
        <FloatingBorder bottom visible={props.highlightedBorderBottom} offset={2} color={props.resizeHintColor}/>
    </div>
);
}