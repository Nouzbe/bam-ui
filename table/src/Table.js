import React from 'react';
import Scroller from 'bam-scroller';
import FloatingBorder from './FloatingBorder.js';

import Column from './Column.js';
import style from './style.js';

const headerHeight = 30;
const rowHeight = 30;
const columnWidth = 130;
const resizeHintColor = '#c3c3c3';
const moveHintColor = 'rgb(66, 134, 244)';

class Table extends React.Component {
  constructor(props) {
    super(props);
    const liveRows = props.data.slice(this.props.frozenRowsCount);
    this.columns = {}; // (colIdx => dom elt) for the columns
    this.state = {
      topIdx: 0, // idx of the first displayed row
      frozenRows: props.data.slice(0, this.props.frozenRowsCount), // frozen rows data
      liveRows: liveRows, // rest of the data
      data: [], // slice of liveRows that is displayed
      rowHeights: {}, // (idx => height) for every row which height has been changed by user
      columnWidths: {}, // (idx => width) for every column which width has been changed by user
      virtualHeight: liveRows.length * rowHeight, // virtual height of the table body
      offsetTop: 0, // top of the table body (offsetting in order to precisely match the virtual scrolltop value)
      highlightedBorderBottomIdx: undefined, // row idx which border bottom is highlighted (on hover to signify to the user that he can resize the row)
      rowIdxBeingResized: undefined, // row idx which is being resized (again, to keep its border bottom highlighted),
      frozenColumnsWidth: props.frozenColumnsCount * columnWidth, // width of the frozen columns area (in px)
      bodyWidth: (liveRows[0].length - props.frozenColumnsCount) * columnWidth, // offset width of the live columns area (in px)
      frozenRowsHeight: props.frozenRowsCount * rowHeight, // offset height of the frozen rows area (in px),
      movingColumnIdx: undefined, // idx of the column that is being moved by the user
      targetColIdx: undefined, // target future idx of the column that is being moved by the user 
      colIdxMapping: props.data[0].reduce((acc, c, idx) => Object.assign(acc, {[idx]: idx}), {}) // (data colIdx => display colIdx) since columns can be moved
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
    this.onColumnMoveStart = this.onColumnMoveStart.bind(this);
    this.onColumnMove = this.onColumnMove.bind(this);
    this.onColumnMoveEnd = this.onColumnMoveEnd.bind(this);
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

  onColumnMoveStart(colIdx) {
    const currentColIdx = parseInt(_.find(Object.keys(this.state.colIdxMapping), i => this.state.colIdxMapping[i] === colIdx), 10);
    // Frozen columns can only be moved among frozen columns and live columns among live columns. Thus this filtering.
    const columnsIdx = Object.values(this.state.colIdxMapping).filter(idx => {
      return (currentColIdx >= this.props.frozenColumnsCount && idx >= this.props.frozenColumnsCount) || (idx < this.props.frozenColumnsCount && currentColIdx < this.props.frozenColumnsCount);
    });
    this.columnOffsets = columnsIdx.map(idx => this.columns[idx].getBoundingClientRect().left).concat([this.columns[columnsIdx[columnsIdx.length - 1]].getBoundingClientRect().right]);
    this.setState({movingColumnIdx: currentColIdx, targetColIdx: currentColIdx});
  }

  onColumnMove(colIdx, clientX) {
    const firstColIdxRightFromMouse = this.columnOffsets.findIndex(o => o > clientX);
    const targetColIdx = firstColIdxRightFromMouse !== -1 ? Math.max(0, firstColIdxRightFromMouse - 1) : this.columnOffsets.length - 1;
    this.setState({
      targetColIdx: this.state.movingColumnIdx < this.props.frozenColumnsCount ? targetColIdx : targetColIdx + this.props.frozenColumnsCount
    });
  }

  onColumnMoveEnd(colIdx) {
    if(this.state.movingColumnIdx !== this.state.targetColIdx && this.state.movingColumnIdx !== this.state.targetColIdx - 1) {
      const nextColIdxMapping = Object.assign({}, this.state.colIdxMapping);
      const reverse = this.state.targetColIdx < this.state.movingColumnIdx;
      for(let i = this.state.movingColumnIdx; reverse ? i > this.state.targetColIdx : i < this.state.targetColIdx - 1; reverse ? i-- : i++) {
        nextColIdxMapping[i] = this.getCurrentColIdx(i + (reverse ? -1 : 1));
      }
      nextColIdxMapping[reverse ? this.state.targetColIdx : this.state.targetColIdx - 1] = colIdx;
      this.setState({
        colIdxMapping: nextColIdxMapping
      });
    }
    this.setState({
      movingColumnIdx: undefined,
      targetColIdx: undefined
    })
  }

  getCurrentColIdx(colIdx) {
    return this.state.colIdxMapping[colIdx];
  }

  renderColumn(rows, frozen, colIdx, headers, rowHeights) {
    return <Column 
        frozen={frozen}
        key={`${frozen ? 'frozen': ''}-column-${colIdx}`}
        columnRef={elt => this.columns[colIdx] = elt}
        colIdx={colIdx}
        frozenCellsCount={this.props.frozenRowsCount}
        data={rows}
        columnWidth={this.state.columnWidths[colIdx] || columnWidth}
        rowHeights={rowHeights}
        onColumnWidthChange={this.onColumnWidthChange}
        onRowHeightChange={this.onRowHeightChange}
        offsetTop={this.state.offsetTop}
        onMouseEnterBorderBottom={this.onMouseEnterRowBorderBottom}
        onMouseLeaveBorderBottom={this.onMouseLeaveRowBorderBottom}
        onResizeRowHeightStart={this.onRowHeightResizeStart}
        onResizeRowHeightEnd={this.onRowHeightResizeEnd}
        highlightedBorderBottomIdx={this.state.highlightedBorderBottomIdx}
        rowIdxBeingResized={this.state.rowIdxBeingResized}
        onColumnMoveStart={this.onColumnMoveStart}
        onColumnMove={this.onColumnMove}
        onColumnMoveEnd={this.onColumnMoveEnd}
        moveHintColor={moveHintColor}
        resizeHintColor={resizeHintColor}
      />
  }

  renderColumns(rows, frozen, colIdxOffset, headers, rowHeights) {
    return headers.map((r, colIdx) => this.renderColumn(rows, frozen, this.getCurrentColIdx(colIdx + colIdxOffset), headers, rowHeights))
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
          {this.renderColumns(rows, true, 0, this.state.liveRows[0].slice(0, this.props.frozenColumnsCount), rowHeights)}
        </div>
        <div style={{height: '100%', width: this.state.bodyWidth, position: 'absolute', left: this.state.frozenColumnsWidth}}>
          {this.renderColumns(rows, false, this.props.frozenColumnsCount, this.state.liveRows[0].slice(this.props.frozenColumnsCount), rowHeights)}
        </div>
        <FloatingBorder 
          visible={this.state.movingColumnIdx !== undefined}
          left={(this.columnOffsets !== undefined && this.state.targetColIdx !== undefined) ? this.columnOffsets[this.state.movingColumnIdx < this.props.frozenColumnsCount ? this.state.targetColIdx: this.state.targetColIdx - this.props.frozenColumnsCount] : undefined}
          color={moveHintColor}/>
      </Scroller>
    );
  }
}

export default Table;