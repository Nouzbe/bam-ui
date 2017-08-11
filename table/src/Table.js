import React from 'react';
import Scroller from 'bam-scroller';

import Column from './Column.js';
import style from './style.js';

const headerHeight = 30;
const rowHeight = 30;
const columnWidth = 130;
const highlightColor = '#c3c3c3';

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topIdx: 0, // idx of the first displayed row
      data: [], // slice of this.getAllRows() that is displayed
      rowHeights: {}, // <idx to height> map for every row which height has been changed by user
      columnWidths: {}, // <idx to width> map for every column which width has been changed by user
      virtualHeight: this.getAllRows().length * rowHeight, // virtual height of the table body
      offsetTop: 0, // top of the table body (offsetting to precisely match the virtual scrolltop value)
      highlightedBorderBottomIdx: undefined, // row idx which border bottom is highlighted (on hover to signify to the user that he can resize the row)
      rowIdxBeingResized: undefined // row idx which is being resized (again, to keep its border bottom highlighted)
    };
    this.onScroll = this.onScroll.bind(this);
    this.onColumnWidthChange = this.onColumnWidthChange.bind(this);
    this.onRowHeightChange = this.onRowHeightChange.bind(this);
    this.getNumberOfRowsThatFit = this.getNumberOfRowsThatFit.bind(this);
    this.getTotalHeight = this.getTotalHeight.bind(this);
    this.getFrozenRowsHeight = this.getFrozenRowsHeight.bind(this);
    this.getRowHeights = this.getRowHeights.bind(this);
    this.getWidth = this.getWidth.bind(this);
    this.onMouseEnterRowBorderBottom = this.onMouseEnterRowBorderBottom.bind(this);
    this.onMouseLeaveRowBorderBottom = this.onMouseLeaveRowBorderBottom.bind(this);
    this.onRowHeightResizeStart = this.onRowHeightResizeStart.bind(this);
    this.onRowHeightResizeEnd = this.onRowHeightResizeEnd.bind(this);
    this.getAllRows = this.getAllRows.bind(this);
    this.getFrozenRows = this.getFrozenRows.bind(this);
    this.getLiveRows = this.getLiveRows.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  getAllRows() {
    return this.props.data.slice(this.props.frozenRows);
  }

  getFrozenRows() {
    return this.props.data.slice(0, this.props.frozenRows);
  }

  getLiveRows() {
    return this.state.data;
  }

  getFirstFittingRow(containerOffsetTop) {
    let previousIdx = - 1;
    let previousBottom = 0;
    for(let i = 0; i < Object.keys(this.state.rowHeights).length; i++) {
      const idx = parseInt(Object.keys(this.state.rowHeights)[i], 10);
      const height = this.state.rowHeights[idx];
      const top = previousBottom + (idx - previousIdx - 1) * rowHeight;
      if(top > containerOffsetTop) {
        break;
      }
      const bottom = top + height;
      if(bottom < containerOffsetTop) {
        previousIdx = idx;
        previousBottom = bottom;
      }
      else {
        return [idx, top - containerOffsetTop];
      }
    }
    const topIdx = previousIdx + 1 + Math.floor((containerOffsetTop - previousBottom) / rowHeight);
    const offset = (previousBottom - containerOffsetTop) % rowHeight;
    return [topIdx, offset];
  }

  getNumberOfRowsThatFit(idxFrom) {
    let currentIdx = idxFrom + 1;
    let requiredHeight = 0;
    while(currentIdx < this.getAllRows().length && requiredHeight < this.container.offsetHeight) {
      currentIdx++;
      const editedRowHeight = this.state.rowHeights[currentIdx];
      requiredHeight += editedRowHeight !== undefined ? editedRowHeight : rowHeight;
    }
    return currentIdx - idxFrom + 1;
  }

  onColumnWidthChange(colIdx, newWidth) {
    this.setState({columnWidths: Object.assign(this.state.columnWidths, {[colIdx]: newWidth})});
  }

  getTotalHeight() {
    return Object.keys(this.state.rowHeights).reduce((sum, idx) => {
      return sum + this.state.rowHeights[idx] - rowHeight;
    }, this.getAllRows().length * rowHeight);
  }

  getFrozenRowsHeight() {
    return Object.keys(this.state.rowHeights).filter(idx => idx <= this.props.frozenRows).reduce((sum, idx) => {
      return sum + this.state.rowHeights[idx] - rowHeight;
    }, this.props.frozenRows * rowHeight);
  }

  getRowHeights(rows) {
    return rows.map((r, idx) => this.state.rowHeights[idx < this.props.frozenRows ? idx : idx + this.state.topIdx] || rowHeight);
  }

  onRowHeightChange(rowIdx, newHeight) {
    // console.log(rowIdx, newHeight);
    this.setState({
      rowHeights: Object.assign(this.state.rowHeights, {[rowIdx < this.props.frozenRows ? rowIdx : this.state.topIdx + rowIdx]: newHeight})
    }, () => {
      this.setState({
        virtualHeight: this.getTotalHeight()
      }, this.refresh);
    });
  }

  refresh() {
    this.setState({
      data: this.getAllRows().slice(this.state.topIdx, this.state.topIdx + this.getNumberOfRowsThatFit(this.state.topIdx))
    });
  }

  onScroll(scroll) {
    if(this.state.virtualHeight > this.container.offsetHeight || scroll === 0) {
      const containerOffsetTop = scroll * (this.state.virtualHeight + this.getFrozenRowsHeight() - this.container.offsetHeight);
      const [topIdx, offsetTop] = this.getFirstFittingRow(containerOffsetTop);
      // console.log('scroll : ' + scroll +  ',containerTop : ' + containerOffsetTop + ', top idx : ' + topIdx + ', offsetTop : ' + offsetTop + ', virtual height : ' + this.state.virtualHeight);
      this.setState({
        topIdx,
        offsetTop
      }, this.refresh);
    }
  }

  getWidth(columns) {
    return columns.reduce((sum, h, idx) => {
      if(this.state.columnWidths[idx] !== undefined) {
        return sum + this.state.columnWidths[idx];
      }
      return sum + columnWidth;
    }, 0);
  }

  onMouseEnterRowBorderBottom(idx) {
    this.setState({highlightedBorderBottomIdx: idx});
  }

  onMouseLeaveRowBorderBottom() {
    this.setState({highlightedBorderBottomIdx: undefined});
  }

  onRowHeightResizeStart(idx) {
    this.setState({rowIdxBeingResized: idx});
  }

  onRowHeightResizeEnd() {
    this.setState({rowIdxBeingResized: undefined});
  }

  componentDidMount() {
    this.refresh();
  }

  render() {
    const frozenColumnsWidth = this.getWidth(this.getAllRows()[0].slice(0, this.props.frozenColumns));
    const bodyWidth = this.getWidth(this.getAllRows()[0].slice(this.props.frozenColumns));
    const frozenRows = this.getFrozenRows();
    const liveRows = this.getLiveRows();
    const displayedRows = frozenRows.concat(liveRows);
    const rowHeights = this.getRowHeights(displayedRows);
    return (
      <Scroller 
        className={style('bt-container')} 
        containerRef={elt => this.container = elt}
        onVerticalScroll={this.onScroll}
        virtualHeight={this.state.virtualHeight}
        verticalOffset={this.getFrozenRowsHeight()}
        horizontalOffset={frozenColumnsWidth}
      >
        <div style={{height: '100%', position: 'fixed', width: frozenColumnsWidth, top: 0, left: 0, zIndex: 5}}>
          {this.getAllRows()[0].slice(0, this.props.frozenColumns).map((r, colIdx) => (
            <Column 
              frozen
              key={`frozen-column-${colIdx}`} 
              colIdx={colIdx}
              frozenCells={this.props.frozenRows}
              data={displayedRows.map(r => r[colIdx])}
              columnWidth={this.state.columnWidths[colIdx] || columnWidth}
              rowHeights={rowHeights}
              onColumnWidthChange={this.onColumnWidthChange}
              onRowHeightChange={this.onRowHeightChange}
              offsetTop={this.state.offsetTop}
              onMouseEnterBorderBottom={this.onMouseEnterRowBorderBottom}
              onMouseLeaveBorderBottom={this.onMouseLeaveRowBorderBottom}
              onResizeRowHeightStart={this.onRowHeightResizeStart}
              onResizeRowHeightEnd={this.onRowHeightResizeEnd}
              highlightColor={highlightColor}
              highlightedBorderBottomIdx={this.state.highlightedBorderBottomIdx}
              rowIdxBeingResized={this.state.rowIdxBeingResized}
            />
          ))}
        </div>
        <div style={{height: '100%', width: bodyWidth, position: 'absolute', left: frozenColumnsWidth}}>
          {this.getAllRows()[0].slice(this.props.frozenColumns).map((r, colIdx) => (
            <Column 
                key={`column-${colIdx + this.props.frozenColumns}`} 
                colIdx={colIdx + this.props.frozenColumns}
                frozenCells={this.props.frozenRows}
                data={displayedRows.map(r => r[colIdx + this.props.frozenColumns])}
                columnWidth={this.state.columnWidths[colIdx + this.props.frozenColumns] || columnWidth}
                rowHeights={rowHeights}
                onColumnWidthChange={this.onColumnWidthChange}
                onRowHeightChange={this.onRowHeightChange}
                offsetTop={this.state.offsetTop}
                onMouseEnterBorderBottom={this.onMouseEnterRowBorderBottom}
                onMouseLeaveBorderBottom={this.onMouseLeaveRowBorderBottom}
                onResizeRowHeightStart={this.onRowHeightResizeStart}
                onResizeRowHeightEnd={this.onRowHeightResizeEnd}
                highlightColor={highlightColor}
                highlightedBorderBottomIdx={this.state.highlightedBorderBottomIdx}
                rowIdxBeingResized={this.state.rowIdxBeingResized}
              />
          ))}
        </div>
      </Scroller>
    );
  }
}

export default Table;