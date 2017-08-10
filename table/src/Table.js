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
      virtualHeight: props.data.length * rowHeight,
      offsetTop: 0
    };
    this.onScroll = this.onScroll.bind(this);
    this.onColumnWidthChange = this.onColumnWidthChange.bind(this);
    this.onRowHeightChange = this.onRowHeightChange.bind(this);
    this.getNumberOfRowsThatFit = this.getNumberOfRowsThatFit.bind(this);
    this.getTotalHeight = this.getTotalHeight.bind(this);
    this.refresh = this.refresh.bind(this);
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
    while(currentIdx < this.props.data.length && requiredHeight < this.container.offsetHeight) {
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
    }, this.props.data.length * rowHeight);
  }

  onRowHeightChange(rowIdx, newHeight) {
    this.setState({
      rowHeights: Object.assign(this.state.rowHeights, {[this.state.topIdx + rowIdx]: newHeight})
    }, () => {
      this.setState({
        virtualHeight: this.getTotalHeight()
      }, this.refresh);
    });
  }

  refresh() {
    this.setState({
      data: this.props.data.slice(this.state.topIdx, this.state.topIdx + this.getNumberOfRowsThatFit(this.state.topIdx))
    });
  }

  onScroll(scroll) {
    if(this.state.virtualHeight > this.container.offsetHeight || scroll === 0) {
      const containerOffsetTop = scroll * (this.state.virtualHeight * (1 + 1 / this.props.data.length) - this.container.offsetHeight);
      const [topIdx, offsetTop] = this.getFirstFittingRow(containerOffsetTop);
      console.log('containerTop : ' + containerOffsetTop + ', top idx : ' + topIdx + ', offsetTop : ' + offsetTop + ', virtual height : ' + this.state.virtualHeight);
      this.setState({
        topIdx,
        offsetTop
      }, this.refresh);
    }
  }

  componentDidMount() {
    this.refresh();
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
      >
        <div style={{height: '100%', width: fullWidth}}>
          {this.props.headers.map((h, idx) => (
            <Column 
                key={`column-${idx}`} 
                colIdx={idx} header={h} 
                data={this.state.data.map(r => r[idx])}
                headerHeight={headerHeight}
                columnWidth={this.state.columnWidths[idx] || columnWidth}
                rowHeights={this.state.data.map((r, idx) => this.state.rowHeights[this.state.topIdx + idx] || rowHeight)}
                onColumnWidthChange={this.onColumnWidthChange}
                onRowHeightChange={this.onRowHeightChange}
                offsetTop = {this.state.offsetTop}
              />
          ))}
        </div>
      </Scroller>
    );
  }
}

export default Table;