import React from 'react';
import Cell from './Cell.js';
import Header from './Header.js';
import FloatingBorder from './FloatingBorder.js';
import TranslucentLayer from './TranslucentLayer.js';
import style from './style.js';

const isBetween = (a, x, b) => (a - x) * (b - x) <= 0;

const renderHeader = (row, rowIdx, isHorizontallyResizable, isVerticallyResizable, isMovable, props) => <Header 
    key={`header-${props.colIdx}-${rowIdx}`} 
    rowRef={props.rowRef !== undefined ? elt => props.rowRef(rowIdx, elt) : undefined}
    cell={row[props.colIdx]} 
    height={props.rowHeights[rowIdx]}
    onResizeWidthStart={isHorizontallyResizable ? initialOffset => props.onResizeWidthStart(props.colIdx, initialOffset) : undefined}
    onMouseEnterBorderBottom={isVerticallyResizable ? () => props.onMouseEnterBorderBottom(rowIdx) : undefined}
    onMouseLeaveBorderBottom={isVerticallyResizable ? () => props.onMouseLeaveBorderBottom(rowIdx) : undefined}
    onMouseEnterBorderRight={isHorizontallyResizable ? () => props.onMouseEnterBorderRight(props.colIdx) : undefined}
    onMouseLeaveBorderRight={isHorizontallyResizable ? () => props.onMouseLeaveBorderRight(props.colIdx) : undefined}
    onResizeHeightStart={isVerticallyResizable ? initialOffset => props.onResizeRowHeightStart(rowIdx, initialOffset) : undefined}
    highlightedBorderBottom={props.highlightedBorderBottomIdx === rowIdx || props.resizedRowIdx === rowIdx}
    resizeHintColor={props.resizeHintColor}
    onMoveStart={isMovable ? () => props.onMoveStart(props.colIdx) : undefined}
/>

const renderCell = (row, rowIdx, props) => {
    const dataRowIdx = props.getDataRowIdx(rowIdx);
    const isSelected = props.cellsSelection !== undefined && 
        isBetween(props.cellsSelection.colIdx.from, props.displayColIdx, props.cellsSelection.colIdx.to) && 
        isBetween(props.cellsSelection.rowIdx.from, dataRowIdx, props.cellsSelection.rowIdx.to);
    return <Cell 
        key={`cell-${props.colIdx}-${rowIdx}`} 
        rowRef={props.rowRef !== undefined ? elt => props.rowRef(rowIdx, elt) : undefined}
        cell={row[props.colIdx]} 
        height={props.rowHeights[rowIdx]}
        highlightedBorderBottom={props.highlightedBorderBottomIdx === rowIdx || props.resizedRowIdx === rowIdx}
        resizeHintColor={props.resizeHintColor}
        onSelectCellsStart={() => props.onSelectCellsStart(rowIdx, props.colIdx)}
        isSelected={isSelected}
        isTopOfSelection={isSelected && dataRowIdx === Math.min(props.cellsSelection.rowIdx.from, props.cellsSelection.rowIdx.to)}
        isBottomOfSelection={isSelected && dataRowIdx === Math.max(props.cellsSelection.rowIdx.from, props.cellsSelection.rowIdx.to)}
        isLeftOfSelection={isSelected && props.displayColIdx === Math.min(props.cellsSelection.colIdx.from, props.cellsSelection.colIdx.to)}
        isRightOfSelection={isSelected && props.displayColIdx === Math.max(props.cellsSelection.colIdx.from, props.cellsSelection.colIdx.to)}
        selectHintColor={props.selectHintColor}
        selectHintBorderColor={props.selectHintBorderColor}
    />
}

export default props => (
    <div className={style('bt-column')} style={{width: props.columnWidth}} ref={elt => props.columnRef(elt)}>
        {props.data.slice(0, props.frozenCellsCount).map((row, rowIdx) => renderHeader(row, rowIdx, true, props.frozen, true, props))}
        <div className={style('bt-column-body')} style={{top: props.offsetTop}}>
            {props.data.slice(props.frozenCellsCount).map((row, rowIdx) => (
                props.frozen ?
                    renderHeader(row, rowIdx + props.frozenCellsCount, false, props.frozen, false, props)
                : 
                    renderCell(row, rowIdx + props.frozenCellsCount, props)
                    
            ))}
        </div>
        <TranslucentLayer visible={props.isMoving} style={{width: props.columnWidth, background: props.moveHintColor, zIndex: 5}}/>
        <FloatingBorder right offset={2} visible={props.isBorderRightHighlighted} color={props.resizeHintColor}/>
    </div>
);