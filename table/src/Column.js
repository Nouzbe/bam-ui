import React from 'react';
import Cell from './Cell.js';
import Header from './Header.js';
import FloatingBorder from './FloatingBorder.js';
import TranslucentLayer from './TranslucentLayer.js';
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
        this.onMouseEnterBorderRight = this.onMouseEnterBorderRight.bind(this);
        this.onMouseLeaveBorderRight = this.onMouseLeaveBorderRight.bind(this);
        this.onResizeWidthStart = this.onResizeWidthStart.bind(this);
        this.onResizeWidthEnd = this.onResizeWidthEnd.bind(this);
        this.onColumnMoveStart = this.onColumnMoveStart.bind(this);
        this.onColumnMove=this.onColumnMove.bind(this);
        this.onColumnMoveEnd=this.onColumnMoveEnd.bind(this);
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
    onResizeWidthStart() {
        this.setState({resizingWidth: true});
    }
    onResizeWidthEnd() {
        this.setState({resizingWidth: false});
    }
    onColumnMoveStart() {
        this.setState({isMoving: true});
        this.props.onColumnMoveStart(this.props.colIdx);
    }
    onColumnMove(clientX) {
        this.props.onColumnMove(this.props.colIdx, clientX);
    }
    onColumnMoveEnd() {
        this.setState({isMoving: false});
        this.props.onColumnMoveEnd(this.props.colIdx);
    }
    renderHeader(row, rowIdx, rowIdxOffset, isHorizontallyResizable, isVerticallyResizable, isMovable) {
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
            onMouseEnterBorderBottom={isVerticallyResizable ? () => this.props.onMouseEnterBorderBottom(rowIdx + rowIdxOffset) : undefined}
            onMouseLeaveBorderBottom={isVerticallyResizable ? () => this.props.onMouseLeaveBorderBottom(rowIdx + rowIdxOffset) : undefined}
            onResizeHeightStart={isVerticallyResizable ? () => this.props.onResizeRowHeightStart(rowIdx + rowIdxOffset) : undefined}
            onResizeHeightEnd={isVerticallyResizable ? () => this.props.onResizeRowHeightEnd(rowIdx + rowIdxOffset) : undefined}
            resizingWidth={this.state.resizingWidth}
            highlightedBorderBottom={this.props.highlightedBorderBottomIdx === rowIdx + rowIdxOffset || this.props.rowIdxBeingResized === rowIdx + rowIdxOffset}
            resizeHintColor={this.props.resizeHintColor}
            onColumnMoveStart={isMovable ? this.onColumnMoveStart : undefined}
            onColumnMove={isMovable ? this.onColumnMove : undefined}
            onColumnMoveEnd={isMovable ? this.onColumnMoveEnd : undefined}
        />
    }
    renderCell(row, rowIdx, rowIdxOffset) {
        return <Cell 
            key={`cell-${this.props.colIdx}-${rowIdx}`} 
            cell={row[this.props.colIdx]} 
            height={this.props.rowHeights[rowIdx + rowIdxOffset]}
            highlightedBorderBottom={this.props.highlightedBorderBottomIdx === rowIdx + rowIdxOffset || this.props.rowIdxBeingResized === rowIdx + rowIdxOffset}
            resizeHintColor={this.props.resizeHintColor}
        />
    }
    render() {
        return (
            <div className={style('bt-column')} style={{width: this.props.columnWidth}} ref={elt => this.props.columnRef(elt)}>
                {this.props.data.slice(0, this.props.frozenCellsCount).map((row, rowIdx) => this.renderHeader(row, rowIdx, 0, true, this.props.frozen, true))}
                <div className={style('bt-column-body')} style={{top: this.props.offsetTop}}>
                    {this.props.data.slice(this.props.frozenCellsCount).map((row, rowIdx) => (
                        this.props.frozen ?
                            this.renderHeader(row, rowIdx, this.props.frozenCellsCount, false, this.props.frozen, false)
                        : 
                            this.renderCell(row, rowIdx, this.props.frozenCellsCount)
                            
                    ))}
                </div>
                <TranslucentLayer visible={this.state.isMoving} width={this.props.columnWidth} color={this.props.moveHintColor}/>
                <FloatingBorder visible={this.state.mouseOnBorderRight || this.state.resizingWidth} color={this.props.resizeHintColor}/>
            </div>
        );
    }
}

export default Column;