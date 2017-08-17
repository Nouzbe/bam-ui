import React from 'react';
import Cell from './Cell.js';
import Header from './Header.js';
import FloatingBorder from './FloatingBorder.js';
import TranslucentLayer from './TranslucentLayer.js';
import style from './style.js';

class Column extends React.Component {
    constructor(props) {
        super(props);
        this.onResizeWidthStart = this.onResizeWidthStart.bind(this);
        this.onResizeRowHeightStart = this.onResizeRowHeightStart.bind(this);
        this.onMouseEnterBorderBottom = this.onMouseEnterBorderBottom.bind(this);
        this.onMouseLeaveBorderBottom = this.onMouseLeaveBorderBottom.bind(this);
        this.onMouseEnterBorderRight = this.onMouseEnterBorderRight.bind(this);
        this.onMouseLeaveBorderRight = this.onMouseLeaveBorderRight.bind(this);
        this.onMoveStart = this.onMoveStart.bind(this);
        this.onSelectCellsStart = this.onSelectCellsStart.bind(this);
        this.rowRef = this.rowRef.bind(this);
    }
    onResizeWidthStart(initialOffset) {
        this.props.onResizeWidthStart(this.props.colIdx, initialOffset);
    }
    onResizeRowHeightStart(rowIdx, initialOffset) {
        this.props.onResizeRowHeightStart(rowIdx, initialOffset);
    }
    onMouseEnterBorderBottom(rowIdx) {
        this.props.onMouseEnterBorderBottom(rowIdx);
    }
    onMouseLeaveBorderBottom(rowIdx) {
        this.props.onMouseLeaveBorderBottom(rowIdx);
    }
    onMouseEnterBorderRight() {
        this.props.onMouseEnterBorderRight(this.props.colIdx);
    }
    onMouseLeaveBorderRight() {
        this.props.onMouseLeaveBorderRight(this.props.colIdx);
    }
    onMoveStart() {
        this.props.onMoveStart(this.props.colIdx);
    }
    onSelectCellsStart(rowIdx) {
        this.props.onSelectCellsStart(rowIdx, this.props.colIdx);
    }
    rowRef(rowIdx, elt) {
        this.props.rowRef(this.props.colIdx, rowIdx, elt);
    }
    renderHeader(row, rowIdx, isHorizontallyResizable, isVerticallyResizable, isMovable) {
        return <Header 
            key={`header-${this.props.colIdx}-${rowIdx}`} 
            rowRef={this.rowRef}
            cell={row[this.props.colIdx]} 
            height={this.props.rowHeights[this.props.getDataRowIdx(rowIdx)] || this.props.defaultRowHeight}
            onResizeWidthStart={isHorizontallyResizable ? this.onResizeWidthStart : undefined}
            onMouseEnterBorderBottom={isVerticallyResizable ? this.onMouseEnterBorderBottom : undefined}
            onMouseLeaveBorderBottom={isVerticallyResizable ? this.onMouseLeaveBorderBottom : undefined}
            onMouseEnterBorderRight={isHorizontallyResizable ? this.onMouseEnterBorderRight  : undefined}
            onMouseLeaveBorderRight={isHorizontallyResizable ? this.onMouseLeaveBorderRight : undefined}
            onResizeHeightStart={isVerticallyResizable ? this.onResizeRowHeightStart : undefined}
            onMoveStart={isMovable ? this.onMoveStart : undefined}
            rowIdx={rowIdx}
        />
    }
    renderCell(row, rowIdx) {
        let isSelected = false;
        let dataRowIdx;
        if(this.props.cellsSelection !== undefined) {
            dataRowIdx = this.props.getDataRowIdx(rowIdx);
            isSelected = this.props.cellsSelection.colIdx.min <= this.props.displayColIdx && this.props.displayColIdx <= this.props.cellsSelection.colIdx.max && 
                            this.props.cellsSelection.rowIdx.min <= dataRowIdx && dataRowIdx <= this.props.cellsSelection.rowIdx.max;
        }
        return <Cell 
            key={`cell-${this.props.colIdx}-${rowIdx}`} 
            rowRef={this.rowRef}
            cell={row[this.props.colIdx]} 
            height={this.props.rowHeights[this.props.getDataRowIdx(rowIdx)] || this.props.defaultRowHeight}
            onSelectCellsStart={this.onSelectCellsStart}
            isSelected={isSelected}
            isTopOfSelection={isSelected && !this.props.isSelecting && dataRowIdx === this.props.cellsSelection.rowIdx.min}
            isBottomOfSelection={isSelected && !this.props.isSelecting && dataRowIdx === this.props.cellsSelection.rowIdx.max}
            isLeftOfSelection={isSelected && !this.props.isSelecting && this.props.displayColIdx === this.props.cellsSelection.colIdx.min}
            isRightOfSelection={isSelected && !this.props.isSelecting && this.props.displayColIdx === this.props.cellsSelection.colIdx.max}
            selectHintColor={this.props.selectHintColor}
            selectHintBorderColor={this.props.selectHintBorderColor}
            rowIdx={rowIdx}
        />
    }
    shouldComponentUpdate(nextProps, nextState) {
        const propKeys = _.intersection(Object.keys(nextProps) || [], Object.keys(this.props) || []);
        for(let i = 0; i < propKeys.length; i++) {
            if(nextProps[propKeys[i]] !== this.props[propKeys[i]]) {
                return true;
            }
        }
        return false;
    }
    render() {
        return <div className={style('bt-column')} style={{width: this.props.columnWidth}} ref={elt => this.props.columnRef(this.props.colIdx, elt)}>
            {this.props.data.slice(0, this.props.frozenCellsCount).map((row, rowIdx) => this.renderHeader(row, rowIdx, true, this.props.frozen, true))}
            <div className={style('bt-column-body')} style={{top: this.props.offsetTop}}>
                {this.props.data.slice(this.props.frozenCellsCount).map((row, rowIdx) => (
                    this.props.frozen ?
                        this.renderHeader(row, rowIdx + this.props.frozenCellsCount, false, this.props.frozen, false)
                    : 
                        this.renderCell(row, rowIdx + this.props.frozenCellsCount, this.props)
                        
                ))}
            </div>
            <TranslucentLayer visible={this.props.isMoving} style={{width: this.props.columnWidth, background: this.props.moveHintColor, zIndex: 5}}/>
            <FloatingBorder right visible={this.props.isBorderRightHighlighted} offset={2} color={this.props.resizeHintColor}/>
            <FloatingBorder left visible={this.props.isMoveTarget} offset={0} color={this.props.moveHintBorderColor} width={2}/>
        </div>
    }
}

export default Column;