import React from 'react';
import Scroller from 'bam-scroller';

import Column from './Column.js';
import style from './style.js';

const headerHeight = 30;
const rowHeight = 30;
const columnWidth = 130;

class Table extends React.Component {
  constructor(props) {
    super(props);
    // state.data is the sorted, filtered and virtually scrolled version of props.data
    this.state = {
      topIdx: 0,
      data: [],
      rowHeights: {},
      columnWidths: {},
      fullHeight: props.data.length * rowHeight,
      containerTop: 0,
      contentTop: 0
    };
    this.onScroll = this.onScroll.bind(this);
    this.onColumnWidthChange = this.onColumnWidthChange.bind(this);
    this.onRowHeightChange = this.onRowHeightChange.bind(this);
    this.getNumberOfRowsThatFit = this.getNumberOfRowsThatFit.bind(this);
    this.getContainerTop = this.getContainerTop.bind(this);
    this.getContentTop = this.getContentTop.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  // returns the height that is above the top idx
  getContentTop(topIdx) {
    const editedRowHeightsScrolledPast = Object.keys(this.state.rowHeights).filter(idx => idx < topIdx);
    const theirSum = editedRowHeightsScrolledPast.reduce((sum, idx) => sum + this.state.rowHeights[idx], 0);
    return rowHeight * (topIdx - editedRowHeightsScrolledPast.length) + theirSum;
  }

  // returns the columns top so that when fully scrolled, the last cell's bottom is right at the bottom of the viewport
  getContainerTop(scroll) {
    return scroll !== undefined ? scroll * (this.state.fullHeight - (this.container.offsetHeight - headerHeight)):  this.state.containerTop;
  }

  getNumberOfRowsThatFit(idxFrom, upward) {
    let currentIdx = idxFrom;
    let requiredHeight = 0;
    while(
      currentIdx >= 0 && 
      currentIdx < this.props.data.length &&
      requiredHeight < this.container.offsetHeight
    ) {
      upward ? currentIdx-- : currentIdx++;
      const editedRowHeight = this.state.rowHeights[currentIdx];
      requiredHeight += editedRowHeight !== undefined ? editedRowHeight : rowHeight; 
    }
    return (upward ? idxFrom - currentIdx : currentIdx - idxFrom) + 1;
  }

  onColumnWidthChange(colIdx, newWidth) {
    this.setState({columnWidths: Object.assign(this.state.columnWidths, {[colIdx]: newWidth})});
  }

  onRowHeightChange(rowIdx, newHeight) {
    const previousHeight = this.state.rowHeights[rowIdx];
    const deltaHeight = newHeight - (previousHeight !== undefined ? previousHeight : rowHeight);
    this.setState({
      rowHeights: Object.assign(this.state.rowHeights, {[this.state.topIdx + rowIdx]: newHeight}),
      fullHeight: this.state.fullHeight + deltaHeight
    }, this.refresh);
  }

  refresh() {
    this.setState({
      data: this.props.data.slice(this.state.topIdx, this.state.topIdx + this.getNumberOfRowsThatFit(this.state.topIdx)),
      contentTop: this.getContentTop(this.state.topIdx)
    });
  }

  onScroll(scroll) {
    if(this.state.fullHeight > this.container.offsetHeight) {
      this.setState({
        topIdx: scroll * (this.props.data.length + 1 - this.getNumberOfRowsThatFit(this.props.data.length - 1, true)),
        containerTop: this.getContainerTop(scroll),
      }, this.refresh);
    }
  }

  componentDidMount() {
    this.setState({
      data: this.props.data.slice(0, this.container.offsetHeight / rowHeight)
    });
  }

  render() {
    const fullWidth = this.props.headers.reduce((sum, h, idx) => {
      if(this.state.columnWidths[idx] !== undefined) {
        return sum + this.state.columnWidths[idx];
      }
      return sum + columnWidth;
    }, 0);
    return (
      <Scroller 
        className={style('bt-container')} 
        containerRef={elt => this.container = elt}
        onVerticalScroll={this.onScroll}
        virtualHeight={this.state.virtualHeight}
        verticalOffset={headerHeight}
        onResize={this.refresh}
      >
        <div style={{height: '100%', width: fullWidth}}>
          {this.props.headers.map((h, idx) => (
            <Column 
                key={`column-${idx}`} 
                colIdx={idx} header={h} 
                data={this.state.data.map(r => r[idx])}
                headerHeight={headerHeight}
                fullHeight={this.state.fullHeight}
                containerTop={this.state.containerTop}
                contentTop={this.state.contentTop}
                columnWidth={this.state.columnWidths[idx] || columnWidth}
                rowHeights={this.state.data.map((r, idx) => this.state.rowHeights[this.state.topIdx + idx] || rowHeight)}
                onColumnWidthChange={this.onColumnWidthChange}
                onRowHeightChange={this.onRowHeightChange}
              />
          ))}
        </div>
      </Scroller>
    );
  }
}

export default Table;