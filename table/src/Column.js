import React from 'react';
import Cell from './Cell.js';
import Header from './Header.js';
import FloatingBorder from './FloatingBorder.js';
import TranslucentLayer from './TranslucentLayer.js';
import style from './style.js';
import constants from './constants.js';

class Column extends React.Component {
    constructor(props) {
        super(props);
        this.onResizeWidthStart = this.onResizeWidthStart.bind(this);
        this.onResizeHeightStart = this.onResizeHeightStart.bind(this);
        this.onMoveStart = this.onMoveStart.bind(this);
        this.onSelectCellsStart = this.onSelectCellsStart.bind(this);
        this.onEdit = this.onEdit.bind(this);
    }

    onResizeWidthStart(initialOffset) {
        this.props.onResizeWidthStart(this.props.dataColIdx, initialOffset);
    }

    onResizeHeightStart(rowIdx, initialOffset) {
        this.props.onResizeHeightStart(rowIdx, initialOffset);
    }

    onMoveStart() {
        if(this.props.onMoveStart) this.props.onMoveStart(this.props.displayColIdx);
    }

    onSelectCellsStart(rowIdx) {
        this.props.onSelectCellsStart(rowIdx, this.props.displayColIdx);
    }

    onEdit(rowIdx) {
        this.props.onEdit(rowIdx, this.props.displayColIdx);
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        const propKeys = _.union(Object.keys(nextProps) || [], Object.keys(this.props) || []);
        for (let i = 0; i < propKeys.length; i++) {
            if (nextProps[propKeys[i]] !== this.props[propKeys[i]]) {
                return true;
            }
        }
        return false;
    }

    componentDidMount() {
        this.props.columns !== undefined ? this.props.columns[this.props.displayColIdx] = this.container : undefined;
    }

    componentWillUnmount() {
        this.props.columns !== undefined ? delete this.props.columns[this.props.displayColIdx] : undefined;
    }

    renderCell(rowIdx) {
        let isSelected = false;
        let isTopOfSelection = false;
        let isBottomOfSelection = false;
        if (this.props.selectedRowsIdx !== undefined) {
            isSelected = this.props.selectedRowsIdx.min <= rowIdx && rowIdx <= this.props.selectedRowsIdx.max;
            isTopOfSelection = this.props.selectedRowsIdx.min === rowIdx;
            isBottomOfSelection = this.props.selectedRowsIdx.max === rowIdx;
        }
        return <Cell 
            key={`cell-${this.props.dataColIdx}-${rowIdx}`}
            cell={(rowIdx >= 0 ? this.props.data[rowIdx] : this.props.header)[this.props.dataColIdx]}
            rowIdx={rowIdx}
            height={this.props.rowHeights[rowIdx] || this.props.defaultRowHeight}
            frozen={this.props.frozen}
            onResizeHeightStart={this.onResizeHeightStart}
            onResizeWidthStart={this.onResizeWidthStart}
            onMoveStart={this.props.onMoveStart ? this.onMoveStart : undefined}
            rowRef={this.props.rowRef}
            onSelectCellsStart={this.onSelectCellsStart}
            isSelected={isSelected}
            isTopOfSelection={isTopOfSelection}
            isBottomOfSelection={isBottomOfSelection}
            isLeftOfSelection={isSelected && this.props.isLeftOfSelection}
            isRightOfSelection={isSelected && this.props.isRightOfSelection}
            onEdit={this.onEdit}
            isEdited={this.props.editedRowIdx === rowIdx}
            userInput={this.props.editedRowIdx === rowIdx ? this.props.userInput : undefined}
            onChange={this.props.onChange}

            rows={this.props.rows}            

            cellRenderer={this.props.cellRenderer}
            getter={this.props.getter}
        />
    }

    render() {
        if(this.props.topRowIdx === undefined || this.props.bottomRowIdx === undefined) return null;
        const rowRange = Array.apply(null, {length: this.props.bottomRowIdx - this.props.topRowIdx}).map(Function.call, i => this.props.topRowIdx + i);
        return (
            <div className={style('bt-column')} style={{width: this.props.columnWidths[this.props.dataColIdx] || this.props.defaultWidth}} ref={elt => this.container = elt}>
                {rowRange.map(rowIdx => this.renderCell(rowIdx))}
                <TranslucentLayer visible={this.props.isMoving} style={{width: this.props.columnWidth, background: constants.moveHintColor, zIndex: 5}}/>
                <FloatingBorder left visible={this.props.isMoveTarget} offset={0} color={constants.moveHintBorderColor} width={2}/>
            </div>
        )
    }
}

export default Column;