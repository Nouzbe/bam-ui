import React from 'react';
import Cell from './Cell.js';
import Header from './Header.js';
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
    render() {
        return (
            <div className={style('bt-column')} style={{width: this.props.columnWidth}}>
                {this.props.data.slice(0, this.props.frozenCells).map((c, idx) => (
                    <Header 
                        key={`header-${this.props.colIdx}-${idx}`} 
                        cell={c} 
                        height={this.props.rowHeights[idx]}
                        onWidthChange={this.onWidthChange}
                        onMouseEnterBorderRight={this.onMouseEnterBorderRight}
                        onMouseLeaveBorderRight={this.onMouseLeaveBorderRight}
                        onResizeWidthStart={this.onResizeWidthStart}
                        onResizeWidthEnd={this.onResizeWidthEnd}
                        onHeightChange={this.props.frozen ? newHeight => this.onRowHeightChange(idx, newHeight) : undefined}
                        onMouseEnterBorderBottom={this.props.frozen ? () => this.onMouseEnterBorderBottom(idx) : undefined}
                        onMouseLeaveBorderBottom={this.props.frozen ? () => this.onMouseLeaveBorderBottom(idx) : undefined}
                        onResizeHeightStart={this.props.frozen ? () => this.onResizeHeightStart(idx) : undefined}
                        onResizeHeightEnd={this.props.frozen ? () => this.onResizeHeightEnd(idx) : undefined}
                        resizingWidth={this.state.resizingWidth}
                        highlightedBorderBottom={this.props.highlightedBorderBottomIdx === idx || this.props.rowIdxBeingResized === idx}
                        highlightColor={this.props.highlightColor}
                    />
                ))}
                <div className={style('bt-column-body')} style={{top: this.props.offsetTop}}>
                    {this.props.data.slice(this.props.frozenCells).map((c, idx) => (
                        this.props.frozen ? 
                            <Header 
                                key={`cell-${this.props.colIdx}-${idx}`} 
                                cell={c} 
                                height={this.props.rowHeights[this.props.frozenCells + idx]}
                                onHeightChange={this.props.frozen ? newHeight => this.onRowHeightChange(this.props.frozenCells + idx, newHeight) : undefined}
                                onMouseEnterBorderBottom={this.props.frozen ? () => this.onMouseEnterBorderBottom(this.props.frozenCells + idx) : undefined}
                                onMouseLeaveBorderBottom={this.props.frozen ? () => this.onMouseLeaveBorderBottom(this.props.frozenCells + idx) : undefined}
                                onResizeHeightStart={this.props.frozen ? () => this.onResizeHeightStart(this.props.frozenCells + idx) : undefined}
                                onResizeHeightEnd={this.props.frozen ? () => this.onResizeHeightEnd(this.props.frozenCells + idx) : undefined}
                                highlightedBorderBottom={this.props.highlightedBorderBottomIdx === this.props.frozenCells + idx || this.props.rowIdxBeingResized === this.props.frozenCells + idx}
                                highlightColor={this.props.highlightColor}
                            />
                        :    
                            <Cell 
                                key={`cell-${this.props.colIdx}-${idx}`} 
                                cell={c} 
                                height={this.props.rowHeights[this.props.frozenCells + idx]}
                                highlightedBorderBottom={this.props.highlightedBorderBottomIdx === this.props.frozenCells + idx || this.props.rowIdxBeingResized === this.props.frozenCells + idx}
                                highlightColor={this.props.highlightColor}
                            />
                    ))}
                </div>
                {this.state.mouseOnBorderRight || this.state.resizingWidth ?
                    <div className={style('bt-column-border-right')} style={{background: this.props.highlightColor}}/>
                :
                    null
                }
            </div>
        );
    }
}

export default Column;