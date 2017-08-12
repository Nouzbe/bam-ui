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
    const liveRows = props.data.slice(this.props.frozenRowsCount);
    this.state = {
      topIdx: 0, // idx of the first displayed row
      frozenRows: props.data.slice(0, this.props.frozenRowsCount), // frozen rows data
      liveRows: liveRows, // rest of the data
      data: [], // slice of data that is displayed
      rowHeights: {}, // <idx to height> map for every row which height has been changed by user
      columnWidths: {}, // <idx to width> map for every column which width has been changed by user
      virtualHeight: liveRows.length * rowHeight, // virtual height of the table body
      offsetTop: 0, // top of the table body (offsetting to precisely match the virtual scrolltop value)
      highlightedBorderBottomIdx: undefined, // row idx which border bottom is highlighted (on hover to signify to the user that he can resize the row)
      rowIdxBeingResized: undefined, // row idx which is being resized (again, to keep its border bottom highlighted),
      frozenColumnsWidth: props.frozenColumnsCount * columnWidth, // width of the frozen columns area (in px)
      bodyWidth: (liveRows[0].length - props.frozenColumnsCount) * columnWidth, // offset width of the live columns area (in px)
      frozenRowsHeight: props.frozenRowsCount * rowHeight // offset height of the frozen rows area (in px)
    };
    this.onScroll = this.onScroll.bind(this);
    this.onColumnWidthChange = this.onColumnWidthChange.bind(this);
    this.onRowHeightChange = this.onRowHeightChange.bind(this);
    this.getNumberOfRowsThatFit = this.getNumberOfRowsThatFit.bind(this);
    this.getRowHeights = this.getRowHeights.bind(this);
    this.getWidth = this.getWidth.bind(this);
    this.onMouseEnterRowBorderBottom = this.onMouseEnterRowBorderBottom.bind(this);
    this.onMouseLeaveRowBorderBottom = this.onMouseLeaveRowBorderBottom.bind(this);
    this.onRowHeightResizeStart = this.onRowHeightResizeStart.bind(this);
    this.onRowHeightResizeEnd = this.onRowHeightResizeEnd.bind(this);
  }

  getFirstFittingRow(scroll) {
    const containerOffsetTop = scroll * (this.state.virtualHeight + this.props.frozenRowsCount * rowHeight - this.container.offsetHeight);
    let previousIdx = -1;
    let previousBottom = 0;
    for(let i = 0; i < Object.keys(this.state.rowHeights).length; i++) {
      const idx = parseInt(Object.keys(this.state.rowHeights)[i], 10) - this.props.frozenRowsCount;
      if(idx >= 0) {
        const height = this.state.rowHeights[this.props.frozenRowsCount + idx];
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
    }
    const topIdx = previousIdx + 1 + Math.floor((containerOffsetTop - previousBottom) / rowHeight);
    const offset = (previousBottom - containerOffsetTop) % rowHeight;
    return [topIdx, offset];
  }

  getNumberOfRowsThatFit(idxFrom) {
    let currentIdx = idxFrom + this.props.frozenRowsCount + 1;
    let requiredHeight = 0;
    while(currentIdx < this.state.liveRows.length && requiredHeight < this.container.offsetHeight) {
      currentIdx++;
      requiredHeight += this.state.rowHeights[currentIdx] !== undefined ? this.state.rowHeights[currentIdx] : rowHeight;
    }
    return currentIdx - idxFrom + 1;
  }

  onColumnWidthChange(colIdx, newWidth) {
    const previousWidth = this.state.columnWidths[colIdx] !== undefined ? this.state.columnWidths[colIdx] : columnWidth;
    const frozenColumnsWidth = this.state.frozenColumnsWidth + (colIdx < this.props.frozenColumnsCount ? newWidth - previousWidth : 0);
    const bodyWidth = this.state.bodyWidth + (colIdx >= this.props.frozenColumnsCount ? newWidth - previousWidth : 0);
    this.setState({
      columnWidths: Object.assign(this.state.columnWidths, {[colIdx]: newWidth}),
      frozenColumnsWidth,
      bodyWidth
    });
  }

  getRowHeights(rows) {
    return rows.map((r, idx) => this.state.rowHeights[idx < this.props.frozenRowsCount ? idx : idx + this.state.topIdx] || rowHeight);
  }

  onRowHeightChange(rowIdx, newHeight) {
    const offsetIdx = rowIdx < this.props.frozenRowsCount ? rowIdx : this.state.topIdx + rowIdx;
    const previousHeight = this.state.rowHeights[offsetIdx] || rowHeight;
    const virtualHeight = this.state.virtualHeight + newHeight - previousHeight;
    const frozenRowsHeight = this.state.frozenRowsHeight + (rowIdx < this.props.frozenRowsCount ? newHeight - previousHeight : 0);
    this.setState({
      virtualHeight,
      frozenRowsHeight,
      rowHeights: Object.assign(this.state.rowHeights, {[offsetIdx]: newHeight})
    });
  }

  onScroll(scroll) {
    if(this.state.virtualHeight > this.container.offsetHeight || scroll === 0) {
      const [topIdx, offsetTop] = this.getFirstFittingRow(scroll);
      this.setState({
        topIdx,
        offsetTop,
        data: this.state.liveRows.slice(topIdx, topIdx + this.getNumberOfRowsThatFit(topIdx))
      });
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

  renderRows(rows, frozen, colIdxOffset, colIdxRange, rowHeights) {
    return colIdxRange.map((r, colIdx) => (
      <Column 
        frozen={frozen}
        key={`${frozen ? 'frozen': ''}-column-${colIdx + colIdxOffset}`} 
        colIdx={colIdx + colIdxOffset}
        frozenCellsCount={this.props.frozenRowsCount}
        data={rows}
        columnWidth={this.state.columnWidths[colIdx + colIdxOffset] || columnWidth}
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
    ))
  }

  componentDidMount() {
    this.setState({
      data: this.state.liveRows.slice(0, this.getNumberOfRowsThatFit(0))
    });
  }

  render() {
    const rows = this.state.frozenRows.concat(this.state.data);
    const rowHeights = this.getRowHeights(rows);
    return (
      <Scroller 
        className={style('bt-container')} 
        containerRef={elt => this.container = elt}
        onVerticalScroll={this.onScroll}
        virtualHeight={this.state.virtualHeight}
        verticalOffset={this.state.frozenRowsHeight}
        horizontalOffset={this.state.frozenColumnsWidth}
      >
        <div style={{height: '100%', position: 'fixed', width: this.state.frozenColumnsWidth, top: 0, left: 0, zIndex: 5}}>
          {this.renderRows(rows, true, 0, this.state.liveRows[0].slice(0, this.props.frozenColumnsCount), rowHeights)}
        </div>
        <div style={{height: '100%', width: this.state.bodyWidth, position: 'absolute', left: this.state.frozenColumnsWidth}}>
          {this.renderRows(rows, false, this.props.frozenColumnsCount, this.state.liveRows[0].slice(this.props.frozenColumnsCount), rowHeights)}
        </div>
      </Scroller>
    );
  }
}

export default Table;