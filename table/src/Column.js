import React from 'react';
import Cell from './Cell.js';
import Header from './Header.js';
import FloatingBorder from './FloatingBorder.js';
import style from './style.js';

class Column extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mouseOnBorderRight: false,
            borderBottomOn: false,
            resizingWidth: false
        };
        this.onWidthChange = this.onWidthChange.bind(this);
        this.onRowHeightChange = this.onRowHeightChange.bind(this);
        this.onMouseEnterBorderBottom = this.onMouseEnterBorderBottom.bind(this);
        this.onMouseEnterBorderRight = this.onMouseEnterBorderRight.bind(this);
        this.onMouseLeaveBorderBottom = this.onMouseLeaveBorderBottom.bind(this);
        this.onMouseLeaveBorderRight = this.onMouseLeaveBorderRight.bind(this);
        this.onResizeWidthStart = this.onResizeWidthStart.bind(this);
        this.onResizeWidthEnd = this.onResizeWidthEnd.bind(this);
        this.onResizeHeightStart = this.onResizeHeightStart.bind(this);
        this.onResizeHeightEnd = this.onResizeHeightEnd.bind(this);
    }
    onWidthChange(newWidth) {
        this.props.onColumnWidthChange(this.props.colIdx, newWidth);
    }
    onRowHeightChange(idx, newHeight) {
        this.props.onRowHeightChange(idx, newHeight);
    }
    onMouseEnterBorderRight() {
        this.setState({mouseOnBorderRight: true});
    }
    onMouseLeaveBorderRight() {
        this.setState({mouseOnBorderRight: false});
    }
    onMouseEnterBorderBottom(idx) {
        this.props.onMouseEnterBorderBottom(idx);
    }
    onMouseLeaveBorderBottom(idx) {
        this.props.onMouseLeaveBorderBottom(idx);
    }
    onResizeWidthStart() {
        this.setState({resizingWidth: true});
    }
    onResizeWidthEnd() {
        this.setState({resizingWidth: false});
    }
    onResizeHeightStart(idx) {
        this.props.onResizeRowHeightStart(idx);
    }
    onResizeHeightEnd(idx) {
        this.props.onResizeRowHeightEnd(idx);
    }
    renderHeader(row, rowIdx, rowIdxOffset, isHorizontallyResizable, isVerticallyResizable) {
        return <Header 
            key={`header-${this.props.colIdx}-${rowIdx + rowIdxOffset}`} 
            cell={row[this.props.colIdx]} 
            height={this.props.rowHeights[rowIdx + rowIdxOffset]}
            onWidthChange={isHorizontallyResizable ? this.onWidthChange : undefined}
            onMouseEnterBorderRight={isHorizontallyResizable ? this.onMouseEnterBorderRight : undefined}
            onMouseLeaveBorderRight={isHorizontallyResizable ? this.onMouseLeaveBorderRight : undefined}
            onResizeWidthStart={isHorizontallyResizable ? this.onResizeWidthStart : undefined}
            onResizeWidthEnd={isHorizontallyResizable ? this.onResizeWidthEnd : undefined}
            onHeightChange={isVerticallyResizable ? newHeight => this.onRowHeightChange(rowIdx + rowIdxOffset, newHeight) : undefined}
            onMouseEnterBorderBottom={isVerticallyResizable ? () => this.onMouseEnterBorderBottom(rowIdx + rowIdxOffset) : undefined}
            onMouseLeaveBorderBottom={isVerticallyResizable ? () => this.onMouseLeaveBorderBottom(rowIdx + rowIdxOffset) : undefined}
            onResizeHeightStart={isVerticallyResizable ? () => this.onResizeHeightStart(rowIdx + rowIdxOffset) : undefined}
            onResizeHeightEnd={isVerticallyResizable ? () => this.onResizeHeightEnd(rowIdx + rowIdxOffset) : undefined}
            resizingWidth={this.state.resizingWidth}
            highlightedBorderBottom={this.props.highlightedBorderBottomIdx === rowIdx + rowIdxOffset || this.props.rowIdxBeingResized === rowIdx + rowIdxOffset}
            highlightColor={this.props.highlightColor}
        />
    }
    renderCell(row, rowIdx, rowIdxOffset) {
        return <Cell 
            key={`cell-${this.props.colIdx}-${rowIdx}`} 
            cell={row[this.props.colIdx]} 
            height={this.props.rowHeights[rowIdx + rowIdxOffset]}
            highlightedBorderBottom={this.props.highlightedBorderBottomIdx === rowIdx + rowIdxOffset || this.props.rowIdxBeingResized === rowIdx + rowIdxOffset}
            highlightColor={this.props.highlightColor}
        />
    }
    render() {
        return (
            <div className={style('bt-column')} style={{width: this.props.columnWidth}}>
                {this.props.data.slice(0, this.props.frozenCellsCount).map((row, rowIdx) => this.renderHeader(row, rowIdx, 0, true, this.props.frozen))}
                <div className={style('bt-column-body')} style={{top: this.props.offsetTop}}>
                    {this.props.data.slice(this.props.frozenCellsCount).map((row, rowIdx) => (
                        this.props.frozen ?
                            this.renderHeader(row, rowIdx, this.props.frozenCellsCount, false, this.props.frozen)
                        : 
                            this.renderCell(row, rowIdx, this.props.frozenCellsCount)
                            
                    ))}
                </div>
                <FloatingBorder visible={this.state.mouseOnBorderRight || this.state.resizingWidth} color={this.props.highlightColor}/>
            </div>
        );
    }
}

export default Column;