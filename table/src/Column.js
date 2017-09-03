import React from 'react';
import Cell from './Cell.js';
import Header from './Header.js';
import FloatingBorder from './FloatingBorder.js';
import TranslucentLayer from './TranslucentLayer.js';
import style from './style.js';
import constants from './constants.js';
import {range} from 'bam-utils';

class Column extends React.Component {
    constructor(props) {
        super(props);
        this.onResizeWidthStart = this.onResizeWidthStart.bind(this);
        this.onResizeHeightStart = this.onResizeHeightStart.bind(this);
        this.onMoveStart = this.onMoveStart.bind(this);
        this.onSelectCellsStart = this.onSelectCellsStart.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.getRowRange = this.getRowRange.bind(this);
        this.findNextIdx = this.findNextIdx.bind(this);
        this.findPreviousIdx = this.findPreviousIdx.bind(this);
        this.isDifferent = this.isDifferent.bind(this);
    }

    onResizeWidthStart() {
        this.props.onResizeWidthStart(this.props.displayColIdx);
    }

    onResizeHeightStart(rowIdxFrom, rowIdxTo) {
        this.props.onResizeHeightStart(rowIdxFrom, rowIdxTo);
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
            if (nextProps[propKeys[i]] !== this.props[propKeys[i]]) return true;
        }
        return false;
    }

    isDifferent(rowIdx, from) {
        for(let i = 0; i <= this.props.dataColIdx; i++) {
            if(this.props.getter(this.props.data[rowIdx][i]) !== this.props.getter(this.props.data[from][i])) return true;
        }
        return false;
    }

    findNextIdx(from, reverse) {
        let i = from + (reverse ? -1 : 1);
        let height = reverse ? 0 : this.props.rowHeights[from] || this.props.defaultRowHeight;
        while(i > 0 && i < this.props.data.length - 1) {
            if(this.isDifferent(i, from)) return [i, height];
            height += this.props.rowHeights[i] || this.props.defaultRowHeight;
            reverse ? i-- : i++
        }
        return [i, height];
    }

    findPreviousIdx(from) {
        return this.findNextIdx(from, true);
    }

    getRowRange() {
        if(this.props.isMerged !== true || this.props.bottomRowIdx <= this.props.topRowIdx + 1) {
            const result = range(this.props.topRowIdx, this.props.bottomRowIdx).map(i => ({
                indexFrom: i,
                indexTo: i + 1,
                height: this.props.rowHeights[i] || this.props.defaultRowHeight
            }));
            return result;
        }
        else {
            const result = [];
            let [idx, offsetHeight] = this.findPreviousIdx(this.props.topRowIdx);
            if(this.container !== undefined) this.container.style.top = `${- offsetHeight}px`;
            idx += 1;
            while(idx < this.props.bottomRowIdx) {
                const [nextIdx, nextHeight] = this.findNextIdx(idx);
                result.push({indexFrom: idx, indexTo: nextIdx, height: nextHeight});
                idx = nextIdx;
            }
            return result;
        }
    }

    componentDidMount() {
        this.props.columns !== undefined ? this.props.columns[this.props.displayColIdx] = this.container : undefined;
    }

    componentWillUnmount() {
        this.props.columns !== undefined ? delete this.props.columns[this.props.displayColIdx] : undefined;
    }

    renderCell(cell) {
        let isSelected = false;
        let isTopOfSelection = false;
        let isBottomOfSelection = false;
        if (this.props.selectedRowsIdx !== undefined) {
            isSelected = this.props.selectedRowsIdx.min <= cell.indexFrom && cell.indexFrom <= this.props.selectedRowsIdx.max;
            isTopOfSelection = this.props.selectedRowsIdx.min === cell.indexFrom;
            isBottomOfSelection = this.props.selectedRowsIdx.max === cell.indexFrom;
        }
        return <Cell 
            key={`cell-${this.props.dataColIdx}-${cell.indexFrom}`}
            cell={this.props.data[cell.indexFrom][this.props.dataColIdx]}
            rowIdxFrom={cell.indexFrom}
            rowIdxTo={cell.indexTo}
            height={cell.height}
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
            isEdited={this.props.editedRowIdx === cell.indexFrom}
            userInput={this.props.editedRowIdx === cell.indexFrom ? this.props.userInput : undefined}
            onChange={this.props.onChange}

            rows={this.props.rows}            

            cellRenderer={this.props.cellRenderer}
            getter={this.props.getter}
        />
    }

    render() {
        if(this.props.topRowIdx === undefined || this.props.bottomRowIdx === undefined) return null;
        const rowRange = this.getRowRange();
        return (
            <div className={style('bt-column')} style={{width: this.props.columnWidths[this.props.dataColIdx] || this.props.defaultWidth}} ref={elt => this.container = elt}>
                {rowRange.map(cell => this.renderCell(cell))}
                <TranslucentLayer visible={this.props.isMoving} style={{width: this.props.columnWidth, background: constants.moveHintColor, zIndex: 5}}/>
                <FloatingBorder left visible={this.props.isMoveTarget} offset={0} color={constants.moveHintBorderColor} width={2}/>
            </div>
        )
    }
}

export default Column;
