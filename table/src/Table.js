import React from 'react';
import Scroller from 'bam-scroller';
import FloatingBorder from './FloatingBorder.js';
import {clipboard, keyboard, range} from 'bam-utils';

import Column from './Column.js';
import Cell from './Cell.js';
import style from './style.js';

const headerHeight = 30;
const rowHeight = 30;
const columnWidth = 130;

const areas = {
  top: {
    left: 'top.left',
    right: 'top.right',
  },
  bottom: {
    left: 'bottom.left',
    right: 'bottom.right'
  }
};

const sides = {
  vertical: {
    up: 'up',
    down: 'down'
  },
  horizontal: {
    left: 'left',
    right: 'right'
  }
};

const defaultGetter = cell => cell;

class Table extends React.Component {
  constructor(props) {
    super(props);
    this.columns = {}; // (colIdx => dom elt) for the live columns
    this.rows = {}; // (rowIdx => first cell elt) for the live rows
    this.frozenColumns = {}; // (colIdx => dom elt) for the frozen columns
    this.frozenRows = {}; // (rowIdx => first cell elt) for the frozen rows
    this.verticalScroll = 0; // current vertical scroll value (used to update state.verticalScroll when a controlled scroll behavior is required)
    this.horizontalScroll = 0; // current horizontal scroll value (used to update state.horizontalScroll when a controlled scroll behavior is required)
    this.state = {
      verticalScroll: 0, // vertical scroll value (from 0 to 1). Only updated when the scroll should be controlled
      horizontalScroll: 0, // horizontal scroll value (from 0 to 1). Only updated when the scroll should be controlled
      rowHeights: {}, // (idx => height) for every row which height has been changed by user
      columnWidths: {}, // (idx => width) for every column which width has been changed by user
      virtualHeight: (this.props.data.length + 1 - this.getFrozenRowsCount(props)) * rowHeight, // virtual height of the table body - adding 1 for the header
      offsetTop: 0, // top of the table body (offsetting in order to precisely match the virtual scrolltop value)
      resizedRowIndexes: undefined, // row idx which is being resized
      resizedColIdx: undefined, // col idx which is being resized
      frozenColumnsWidth: this.getFrozenColumnsCount(props) * columnWidth, // width of the frozen columns area (in px)
      virtualWidth: (this.props.header.length - this.getFrozenColumnsCount(props)) * columnWidth, // offset width of the live columns area (in px)
      frozenRowsHeight: this.getFrozenRowsCount(props) * rowHeight, // offset height of the frozen rows area (in px),
      movingColumnIdx: undefined, // idx of the column that is being moved by the user
      targetColIdx: undefined, // target future idx of the column that is being moved by the user 
      colIdxMapping: props.data[0].reduce((acc, c, idx) => Object.assign(acc, {[idx]: idx}), {}), // (data colIdx => display colIdx) since columns can be moved
      isSelecting: false, // is the user in the process of drag and dropping in order to select cells
      cellsSelection: undefined, // min & max rowIdx & colIdx defining current cells selection
      editedCell: undefined, // {colIdx, rowIdx} of the currently edited cell
      userInput: undefined, // current caption entered by the user in the edited cell,
      hoveringHeader: false,
      hoveringFrozenColumns: false
    };
    // Scrolling
    this.onVerticalScroll = this.onVerticalScroll.bind(this);
    this.onHorizontalScroll = this.onHorizontalScroll.bind(this);
    this.getFirstFittingRow = this.getFirstFittingRow.bind(this);
    this.getFirstFittingColumn = this.getFirstFittingColumn.bind(this);
    this.getNumberOfRowsThatFit = this.getNumberOfRowsThatFit.bind(this);
    this.getNumberOfColumnsThatFit = this.getNumberOfColumnsThatFit.bind(this);
    this.scrollContinuously = this.scrollContinuously.bind(this);
    // Resizing rows and columns
    this.onResizeRowHeightStart = this.onResizeRowHeightStart.bind(this);
    this.onResizeRowHeight = this.onResizeRowHeight.bind(this);
    this.onResizeRowHeightEnd = this.onResizeRowHeightEnd.bind(this);
    this.onResizeColumnWidthStart = this.onResizeColumnWidthStart.bind(this);
    this.onResizeColumnWidth = this.onResizeColumnWidth.bind(this);
    this.onResizeColumnWidthEnd = this.onResizeColumnWidthEnd.bind(this);
    // Moving columns
    this.onColumnMoveStart = this.onColumnMoveStart.bind(this);
    this.onColumnMove = this.onColumnMove.bind(this);
    this.onColumnMoveEnd = this.onColumnMoveEnd.bind(this);
    // Selecting cells
    this.onSelectCellsStart = this.onSelectCellsStart.bind(this);
    this.onSelectCells = this.onSelectCells.bind(this);
    this.onSelectCellsEnd = this.onSelectCellsEnd.bind(this);
    this.isASingleCellSelected = this.isASingleCellSelected.bind(this);
    this.moveSelectionHorizontally = _.throttle(this.moveSelectionHorizontally.bind(this), 50);
    this.moveSelectionVertically = _.throttle(this.moveSelectionVertically.bind(this), 50);
    this.adjustVerticalScroll = this.adjustVerticalScroll.bind(this);
    this.adjustHorizontalScroll = this.adjustHorizontalScroll.bind(this);
    // Editing cells
    this.onEdit = this.onEdit.bind(this);
    this.enterEdition = this.enterEdition.bind(this);
    this.moveEditionHorizontally = this.moveEditionHorizontally.bind(this);
    this.moveEditionVertically = this.moveEditionVertically.bind(this);
    this.cleanEdition = this.cleanEdition.bind(this);
    this.copySelection = this.copySelection.bind(this);
    this.cutSelection = this.cutSelection.bind(this);
    this.paste = this.paste.bind(this);
    this.deleteSelection = this.deleteSelection.bind(this);
    this.onChange = this.onChange.bind(this);
    // Utils
    this.getFrozenColumnsCount = this.getFrozenColumnsCount.bind(this);
    this.getFrozenRowsCount = this.getFrozenRowsCount.bind(this);
    this.isColumnMerged = this.isColumnMerged.bind(this);
    // Dom event listeners
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseEnterHeader = this.onMouseEnterHeader.bind(this);
    this.onMouseLeaveHeader = this.onMouseLeaveHeader.bind(this);
    this.onMouseEnterFrozenColumns = this.onMouseEnterFrozenColumns.bind(this);
    this.onMouseLeaveFrozenColumns = this.onMouseLeaveFrozenColumns.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onKeyup = this.onKeyup.bind(this);
  }

  // Scrolling

  onVerticalScroll(scroll) {
    this.verticalScroll = scroll; // storing the value on this for later use
    if(this.state.virtualHeight > this.container.offsetHeight || scroll === 0) {
      const [topRowIdx, offsetTop] = this.getFirstFittingRow(scroll);
      this.setState({
        topRowIdx,
        offsetTop,
        bottomRowIdx: topRowIdx + this.getNumberOfRowsThatFit(topRowIdx),
      });
    }
  }

  onHorizontalScroll(scroll) {
    this.horizontalScroll = scroll;
    const [leftColIdx, offsetLeft] = this.getFirstFittingColumn(scroll);
    this.setState({
      leftColIdx,
      offsetLeft,
      rightColIdx: leftColIdx + this.getNumberOfColumnsThatFit(leftColIdx)
    });
  }

  getFirstFittingRow(scroll) {
    const containerOffsetTop = scroll * Math.max(0, this.state.virtualHeight - this.container.offsetHeight);
    let previousIdx = this.getFrozenRowsCount() - 2;
    let previousBottom = 0;
    const rowIndexes = Object.keys(this.state.rowHeights).map(i => parseInt(i, 10)).sort();
    for(let i = 0; i < rowIndexes.length; i++) {
      const idx = rowIndexes[i];
      if(idx >= this.getFrozenRowsCount() - 1) {
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
    }
    const topIdx = previousIdx + 1 + Math.floor((containerOffsetTop - previousBottom) / rowHeight);
    const offset = (previousBottom - containerOffsetTop) % rowHeight;
    return [topIdx, offset];
  }

  getFirstFittingColumn(scroll) {
    const containerOffsetLeft = scroll * Math.max(0, this.state.virtualWidth - this.container.offsetWidth);
    let previousIdx = this.getFrozenColumnsCount() - 1;
    let previousRight = 0;
    const displayColumnWidths = Object.keys(this.state.columnWidths).reduce((acc, dataIdx) => {
      const displayIdx = _.find(Object.keys(this.state.colIdxMapping), dIdx => '' + this.state.colIdxMapping[dIdx] === dataIdx);
      return Object.assign(acc, {[displayIdx]: this.state.columnWidths[dataIdx]});
    }, {})
    for(let i = 0; i < Object.keys(displayColumnWidths).length; i++) {
      const idx = parseInt(Object.keys(displayColumnWidths)[i], 10);
      if(idx >= this.getFrozenColumnsCount()) {
        const width = this.state.columnWidths[this.state.colIdxMapping[idx]];
        const left = previousRight + (idx - previousIdx - 1) * columnWidth;
        if(left > containerOffsetLeft) {
          break;
        }
        const right = left + width;
        if(right < containerOffsetLeft) {
          previousIdx = idx;
          previousRight = right;
        }
        else {
          return [idx, left - containerOffsetLeft];
        }
      }
    }
    const leftIdx = previousIdx + 1 + Math.floor((containerOffsetLeft - previousRight) / columnWidth);
    const offset = (previousRight - containerOffsetLeft) % columnWidth;
    return [leftIdx, offset];
  }

  getNumberOfRowsThatFit(idxFrom) {
    let currentIdx = idxFrom + 1;
    let requiredHeight = 0;
    while(currentIdx < this.props.data.length - 1 && requiredHeight < this.container.offsetHeight) {
      currentIdx++;
      requiredHeight += this.state.rowHeights[currentIdx] || rowHeight;
    }
    return currentIdx - idxFrom + 1;
  }

  getNumberOfColumnsThatFit(idxFrom) {
    let currentIdx = idxFrom + 1;
    let requiredWidth = 0;
    while(currentIdx < this.props.header.length - 1 && requiredWidth < this.container.offsetWidth) {
      currentIdx++;
      requiredWidth += this.state.columnWidths[currentIdx] || columnWidth;
    }
    return currentIdx - idxFrom + 1;
  }

  scrollContinuously(horizontal, vertical) {
    if((this.state.isSelecting || this.state.movingColumnIdx !== undefined) && this.shouldScrollContinuously) {
      if(horizontal === sides.horizontal.left) {
        this.setState({horizontalScroll: this.horizontalScroll - columnWidth / this.state.virtualWidth});
      }
      else if(horizontal === sides.horizontal.right) {
        this.setState({horizontalScroll: this.horizontalScroll + columnWidth / this.state.virtualWidth});
      }
      if(vertical === sides.vertical.up) {
        this.setState({verticalScroll: this.verticalScroll - rowHeight / this.state.virtualHeight});
      }
      else if(vertical === sides.vertical.down) {
        this.setState({verticalScroll: this.verticalScroll + rowHeight / this.state.virtualHeight});
      }
      setTimeout(() => this.scrollContinuously(vertical, horizontal), 50);
    }
  }

  // Resizing rows and columns

  onResizeRowHeightStart(rowIndexes) {
    this.setState({resizedRowIndexes: rowIndexes});
  }

  onResizeRowHeight(clientY) {
    const relevantRows = this.state.resizedRowIndexes[0] < this.getFrozenRowsCount() - 1 ? this.frozenRows : this.rows;
    const newHeight = Math.max(1, clientY - relevantRows[this.state.resizedRowIndexes[0]].getBoundingClientRect().top);
    const newRowHeights = Object.assign({}, this.state.rowHeights);
    let previousHeight = 0;
    this.state.resizedRowIndexes.map(idx => {
      previousHeight += this.state.rowHeights[idx] || rowHeight;
      newRowHeights[idx] = newHeight / this.state.resizedRowIndexes.length
    });
    const frozenRowsHeight = this.state.frozenRowsHeight + (this.state.resizedRowIndexes[this.state.resizedRowIndexes.length - 1] < this.getFrozenRowsCount() - 1 ? newHeight - previousHeight: 0);
    const virtualHeight = this.state.virtualHeight + (this.state.resizedRowIndexes[0] >= this.getFrozenRowsCount() - 1 ? newHeight - previousHeight : 0);
    this.setState({
      virtualHeight,
      frozenRowsHeight,
      rowHeights: newRowHeights
    });
  }

  onResizeRowHeightEnd() {
    this.setState({resizedRowIndexes: undefined});
  }

  onResizeColumnWidthStart(colIdx) {
    this.setState({resizedColIdx: colIdx});
  }

  onResizeColumnWidth(clientX) {
    const dataColIdx = this.state.colIdxMapping[this.state.resizedColIdx];
    const relevantColumns = this.state.resizedColIdx < this.getFrozenColumnsCount() ? this.frozenColumns : this.columns;
    const newWidth = Math.max(1, clientX - relevantColumns[this.state.resizedColIdx].getBoundingClientRect().left);
    const previousWidth = this.state.columnWidths[dataColIdx] !== undefined ? this.state.columnWidths[dataColIdx] : columnWidth;
    const frozenColumnsWidth = this.state.frozenColumnsWidth + (this.state.resizedColIdx < this.getFrozenColumnsCount() ? newWidth - previousWidth : 0);
    const virtualWidth = this.state.virtualWidth + (this.state.resizedColIdx >= this.getFrozenColumnsCount() ? newWidth - previousWidth : 0);
    this.setState({
      columnWidths: Object.assign({}, this.state.columnWidths, {[dataColIdx]: newWidth}),
      frozenColumnsWidth,
      virtualWidth
    });
  }

  onResizeColumnWidthEnd() {
    this.setState({resizedColIdx: undefined});
  }

  // Moving columns

  onColumnMoveStart(displayColIdx) {
    this.setState({movingColumnIdx: displayColIdx, targetColIdx: displayColIdx});
  }

  onColumnMove(clientX) {
    const frozenMove = this.state.movingColumnIdx < this.getFrozenColumnsCount();
    const relevantColumns = frozenMove ? Object.values(this.frozenColumns) : Object.values(this.columns);
    const firstColIdxRightFromMouse =  relevantColumns.findIndex(o => o && o.getBoundingClientRect().right > clientX);
    const targetColIdx = (firstColIdxRightFromMouse !== -1 ? Math.max(0, firstColIdxRightFromMouse) : relevantColumns.length) + (frozenMove ? 0 : this.state.leftColIdx);
    this.setState({targetColIdx});
  }

  onColumnMoveEnd() {
    if(this.state.movingColumnIdx !== this.state.targetColIdx && this.state.movingColumnIdx !== this.state.targetColIdx - 1) {
      const nextColIdxMapping = Object.assign({}, this.state.colIdxMapping);
      const reverse = this.state.targetColIdx < this.state.movingColumnIdx;
      for(let i = this.state.movingColumnIdx; reverse ? i > this.state.targetColIdx : i < this.state.targetColIdx - 1; reverse ? i-- : i++) {
        nextColIdxMapping[i] = this.state.colIdxMapping[i + (reverse ? -1 : 1)];
      }
      nextColIdxMapping[reverse ? this.state.targetColIdx : this.state.targetColIdx - 1] = this.state.colIdxMapping[this.state.movingColumnIdx];
      this.setState({colIdxMapping: nextColIdxMapping});
    }
    this.setState({
      movingColumnIdx: undefined,
      targetColIdx: undefined
    });
  }

  // Selecting cells

  onSelectCellsStart(rowIdx, displayColIdx) {
    this.cleanEdition();
    this.setState({
      isSelecting: true,
      cellsSelection: {
        rowIdx: {min: rowIdx, max: rowIdx, from: rowIdx},
        colIdx: {min: displayColIdx, max: displayColIdx, from: displayColIdx}
      }
    });
    this.initialOffsetTop = this.state.offsetTop;
  }

  onSelectCells(clientX, clientY) {
    const relevantColumns = Object.values(this.columns);
    const relevantRows = Object.keys(this.rows).map(k => parseInt(k, 10)).sort((a, b) => a - b).map(k => this.rows[k]);
    const firstColIdxRightFromMouse = relevantColumns.findIndex(o => o && o.getBoundingClientRect().right > clientX);
    const firstRowIdxUnderneathMouse = relevantRows.findIndex(o => o && o.getBoundingClientRect().bottom > clientY);
    const colIdxTo = this.state.leftColIdx + (firstColIdxRightFromMouse !== -1 ? Math.max(0, firstColIdxRightFromMouse) : relevantColumns.length);
    const rowIdxTo = this.state.topRowIdx + (firstRowIdxUnderneathMouse !== -1 ? Math.max(0, firstRowIdxUnderneathMouse) : relevantRows.length);
    this.setState({
      cellsSelection: {
        colIdx: {
          min: Math.min(this.state.cellsSelection.colIdx.from, colIdxTo),
          max: Math.max(this.state.cellsSelection.colIdx.from, colIdxTo),
          from: this.state.cellsSelection.colIdx.from
        },
        rowIdx: {
          min: Math.min(this.state.cellsSelection.rowIdx.from, rowIdxTo),
          max: Math.max(this.state.cellsSelection.rowIdx.from, rowIdxTo),
          from: this.state.cellsSelection.rowIdx.from
        }
      }
    });
  }

  onSelectCellsEnd() {
    this.setState({isSelecting: false});
    if(this.previousCellsSelection !== undefined && 
      this.previousCellsSelection.rowIdx === this.state.cellsSelection.rowIdx.min &&
      this.previousCellsSelection.rowIdx === this.state.cellsSelection.rowIdx.max &&
      this.previousCellsSelection.colIdx === this.state.cellsSelection.colIdx.min &&
      this.previousCellsSelection.colIdx === this.state.cellsSelection.colIdx.max) {
        this.setState({cellsSelection: undefined});
        this.previousCellsSelection = undefined;
    }
    else if(this.state.cellsSelection.rowIdx.min === this.state.cellsSelection.rowIdx.max &&
            this.state.cellsSelection.colIdx.min === this.state.cellsSelection.colIdx.max) {
        this.previousCellsSelection = {rowIdx: this.state.cellsSelection.rowIdx.min, colIdx: this.state.cellsSelection.colIdx.min};
    }
  }

  isASingleCellSelected() {
    return this.state.cellsSelection !== undefined &&
           this.state.cellsSelection.rowIdx.min === this.state.cellsSelection.rowIdx.max && 
           this.state.cellsSelection.colIdx.min === this.state.cellsSelection.colIdx.max;
  }

  moveSelectionHorizontally(toTheRight) {
    const newColIdx = Math.max(this.getFrozenColumnsCount(), Math.min(this.state.cellsSelection.colIdx.min + (toTheRight ? 1 : -1), this.props.header.length - 1));
    this.setState({
      cellsSelection: {
        rowIdx: {min: this.state.cellsSelection.rowIdx.min, max: this.state.cellsSelection.rowIdx.min, from: this.state.cellsSelection.rowIdx.min},
        colIdx: {min: newColIdx, max: newColIdx, from: newColIdx}
      }
    });
    this.adjustHorizontalScroll(newColIdx);
  }

  moveSelectionVertically(down) {
    const newRowIdx = Math.min(Math.max(this.getFrozenRowsCount() - 1, this.state.cellsSelection.rowIdx.min + (down ? 1 : -1)), this.props.data.length - 1);
    this.setState({
      cellsSelection: {
        rowIdx: {min: newRowIdx, max: newRowIdx, from: newRowIdx},
        colIdx: {min: this.state.cellsSelection.colIdx.min, max: this.state.cellsSelection.colIdx.min, from: this.state.cellsSelection.colIdx.min}
      }
    });
    this.adjustVerticalScroll(newRowIdx);
  }

  adjustVerticalScroll(newRowIdx) {
    const newRow = this.rows[newRowIdx];
    if(newRow && newRow.getBoundingClientRect().top <= this.container.getBoundingClientRect().top) {
      this.setState({verticalScroll: this.verticalScroll - 0.5 * this.container.clientHeight / this.state.virtualHeight}); // up
    }
    else if(newRow && newRow.getBoundingClientRect().bottom >= this.container.getBoundingClientRect().bottom) {
      this.setState({verticalScroll: this.verticalScroll + 0.5 * this.container.clientHeight / this.state.virtualHeight}); // down
    }
  }

  adjustHorizontalScroll(newColIdx) {
    const newColumn = this.columns[newColIdx];
    if(newColumn && newColumn.getBoundingClientRect().left <= this.container.parentElement.getBoundingClientRect().left + this.state.frozenColumnsWidth) {
      this.setState({horizontalScroll: this.horizontalScroll - 0.5 * this.container.offsetWidth / this.state.virtualWidth}); // left
    }
    else if(newColumn && newColumn.getBoundingClientRect().right >= this.container.parentElement.getBoundingClientRect().right) {
      this.setState({horizontalScroll: this.horizontalScroll + 0.5 * this.container.offsetWidth / this.state.virtualWidth}); // right
    }
  }

  // Editing cells

  onEdit(dataRowIdx, displayColIdx) {
    if(this.props.onChange !== undefined) {
      this.setState({
        cellsSelection: {
          rowIdx: {min: dataRowIdx, max: dataRowIdx, from: dataRowIdx},
          colIdx: {min: displayColIdx, max: displayColIdx, from: displayColIdx}
        },
        editedCell: {rowIdx: dataRowIdx, colIdx: displayColIdx},
        userInput: (this.props.getter || defaultGetter)(this.props.data[dataRowIdx][this.state.colIdxMapping[displayColIdx]])
      });
      this.initialOffsetTop = this.state.offsetTop;
    }
  }

  enterEdition(e) {
    this.setState({
      editedCell: {
        colIdx: this.state.cellsSelection.colIdx.min, 
        rowIdx: this.state.cellsSelection.rowIdx.min
      },
      userInput: (this.props.getter || defaultGetter)(this.props.data[this.state.cellsSelection.rowIdx.min][this.state.colIdxMapping[this.state.cellsSelection.colIdx.min]])
    });
  
  }
  copySelection() {
    const selectedRows = this.props.data.slice(this.state.cellsSelection.rowIdx.min, this.state.cellsSelection.rowIdx.max + 1);
    const selectedColumnIndexes = [];
    for(let i = this.state.cellsSelection.colIdx.min; i <= this.state.cellsSelection.colIdx.max; i++) {
      selectedColumnIndexes.push(this.state.colIdxMapping[i]);
    }
    clipboard.copy(selectedRows.map(r => selectedColumnIndexes.map(i => (this.props.getter || defaultGetter)(r[i])).join('\t')).join('\n'));
  }

  cutSelection() {
    this.copySelection();
    this.deleteSelection();
  }

  paste(evt) {
    if(this.props.onChange !== undefined && this.isASingleCellSelected()) {
      const copiedRows = evt.clipboardData.getData('Text').split('\n');
      const newCells = [];
      copiedRows.map((r, i) => {
        const rowIdx = this.state.cellsSelection.rowIdx.min + i;
        if(rowIdx < this.props.data.length) {
          r.split('\t').map((value, j) => {
            const displayColIdx = this.state.cellsSelection.colIdx.min + j;
            if(displayColIdx < this.props.header.length) {
              newCells.push({
                rowIdx,
                colIdx: this.state.colIdxMapping[displayColIdx],
                value
              });
            }
          });
        }
      });
      this.props.onChange(newCells);
    }
  }

  deleteSelection() {
    const newCells = [];
    for(let i = this.state.cellsSelection.rowIdx.min; i <= this.state.cellsSelection.rowIdx.max; i++) {
      for(let j = this.state.cellsSelection.colIdx.min; j <= this.state.cellsSelection.colIdx.max; j++) {
        newCells.push({
          rowIdx: i,
          colIdx: this.state.colIdxMapping[j],
          value: ''
        });
      }
    }
    this.props.onChange(newCells);
  }

  moveEditionHorizontally(toTheRight) {
    this.cleanEdition();
    const newColIdx = Math.max(this.getFrozenColumnsCount(), Math.min(this.state.editedCell.colIdx + (toTheRight ? 1 : -1), this.props.header.length - 1));
    this.setState({
      editedCell: {
        rowIdx: this.state.editedCell.rowIdx,
        colIdx: newColIdx
      },
      userInput: (this.props.getter || defaultGetter)(this.props.data[this.state.editedCell.rowIdx][this.state.colIdxMapping[newColIdx]])
    });
    this.moveSelectionHorizontally(toTheRight);
  }

  moveEditionVertically(down) {
    this.cleanEdition();
    const newRowIdx = Math.max(this.getFrozenRowsCount(), Math.min(this.state.editedCell.rowIdx + (down ? 1 : -1), this.props.data.length - 1));
    this.setState({
      editedCell: {
        rowIdx: newRowIdx,
        colIdx: this.state.editedCell.colIdx
      },
     userInput: (this.props.getter || defaultGetter)(this.props.data[newRowIdx][this.state.colIdxMapping[this.state.editedCell.colIdx]])
    });
    this.moveSelectionVertically(down);
  }

  cleanEdition() {
    if(this.props.onChange !== undefined && this.state.editedCell !== undefined) {
      this.props.onChange([{rowIdx: this.state.editedCell.rowIdx, colIdx: this.state.colIdxMapping[this.state.editedCell.colIdx], value: this.state.userInput}]);
      this.setState({
        editedCell: undefined,
        userInput: undefined
      });
    }
  }

  onChange(e) {
    this.setState({userInput: e.target.value});
  }

  // Utils

  getFrozenColumnsCount(props) {
    if(props === undefined) return (this.props.configuration !== undefined && this.props.configuration.frozenColumnsCount !== undefined) ? this.props.configuration.frozenColumnsCount : 0;
    return (props.configuration !== undefined && props.configuration.frozenColumnsCount !== undefined) ? props.configuration.frozenColumnsCount : 0;
  }

  getFrozenRowsCount(props) {
    if(props === undefined) return (this.props.configuration !== undefined && this.props.configuration.frozenRowsCount !== undefined) ? this.props.configuration.frozenRowsCount : 0;
    return (props.configuration !== undefined && props.configuration.frozenRowsCount !== undefined) ? props.configuration.frozenRowsCount : 0;
  }

  isColumnMerged(idx) {
    return (this.props.configuration !== undefined && this.props.configuration.columns !== undefined && this.props.configuration.columns[idx] !== undefined && this.props.configuration.columns[idx].merged !== undefined) ? this.props.configuration.columns[idx].merged : false;
  }

  // Dom event listeners

  onMouseMove(e) {
    if(this.state.movingColumnIdx !== undefined) {
      this.onColumnMove(e.clientX);
    }
    if(this.state.resizedColIdx !== undefined) {
      this.onResizeColumnWidth(e.clientX);
    }
    if(this.state.resizedRowIndexes !== undefined) {
      this.onResizeRowHeight(e.clientY);
    }
    if(this.state.isSelecting) {
      this.onSelectCells(e.clientX, e.clientY);
    }
  }

  onMouseUp() {
    if(this.state.movingColumnIdx !== undefined) {
      this.onColumnMoveEnd();
    }
    if(this.state.resizedColIdx !== undefined) {
      this.onResizeColumnWidthEnd();
    }
    if(this.state.resizedRowIndexes !== undefined) {
      this.onResizeRowHeightEnd();
    }
    if(this.state.isSelecting) {
      this.onSelectCellsEnd();
    }
  }

  onMouseEnter() {
    this.shouldScrollContinuously = false;
  }

  onMouseLeave(e) {
    this.shouldScrollContinuously = this.state.isSelecting || this.state.movingColumnIdx !== undefined;
    const rect = this.container.getBoundingClientRect();
    this.scrollContinuously(
      e.clientX >= rect.right ? sides.horizontal.right : e.clientX <= rect.left ? sides.horizontal.left : undefined,
      e.clientY >= rect.bottom ? sides.vertical.down : e.clientY <= rect.top ? sides.vertical.up : undefined
    );
  }

  onMouseEnterHeader() {
    this.setState({hoveringHeader: true});
    this.shouldScrollContinuously = false;
  }

  onMouseLeaveHeader(e) {
    this.setState({hoveringHeader: false});
    this.shouldScrollContinuously = this.state.isSelecting || this.state.movingColumnIdx !== undefined;
    const rect = this.container.getBoundingClientRect();
    this.scrollContinuously(
      e.clientX >= rect.right ? sides.horizontal.right : e.clientX <= rect.left ? sides.horizontal.left : undefined,
      undefined
    );
  }

  onMouseEnterFrozenColumns() {
    this.setState({hoveringFrozenColumns: true});
  }

  onMouseLeaveFrozenColumns(e) {
    this.setState({hoveringFrozenColumns: false});
  }

  onKeydown(e) {
    if(this.isASingleCellSelected()) {
      if(!e.ctrlKey && this.props.onChange !== undefined && this.state.editedCell === undefined && keyboard.isAlphaNumeric(e.keyCode)) {
        this.enterEdition(e);
      }
      else if(this.state.editedCell !== undefined) {
        if(keyboard.isTab(e)) {
          e.preventDefault();
        }
      }
      else if(keyboard.isLeftArrow(e)) {
        e.persist();
        this.moveSelectionHorizontally(false);
      }
      else if(keyboard.isRightArrow(e)) {
        e.persist();
        this.moveSelectionHorizontally(true);
      }
      else if(keyboard.isUpArrow(e)) {
        e.persist();
        this.moveSelectionVertically(false);
      }
      else if(keyboard.isDownArrow(e)) {
        e.persist();
        this.moveSelectionVertically(true);
      }
    }
  }

  onKeyup(e) {
    if(keyboard.isEscape(e)) {
      if(this.state.editedCell !== undefined) {
        this.cleanEdition();
        this.container.parentElement.focus();
      }
      else if(this.state.cellsSelection !== undefined) {
        this.setState({cellsSelection: undefined})
      }
    }
    else if(this.state.cellsSelection !== undefined) {
      if(keyboard.isCopy(e)) {
        this.copySelection();
      }
      else if(keyboard.isCut(e)) {
        this.cutSelection();
      }
      else if(keyboard.isDelete(e)) {
        this.deleteSelection();
      }
      else if(keyboard.isHome(e)) {
        this.setState({verticalScroll: 0});
      }
      else if(keyboard.isEnd(e)) {
        this.setState({verticalScroll: 1});
      }
      else if(keyboard.isPageUp(e)) {
        this.setState({verticalScroll: this.verticalScroll - this.container.offsetHeight / this.state.virtualHeight});
      }
      else if(keyboard.isPageDown(e)) {
        this.setState({verticalScroll: this.verticalScroll + this.container.offsetHeight / this.state.virtualHeight});
      }
      else if(this.state.editedCell !== undefined) {
        if(keyboard.isTab(e)) {
          this.moveEditionHorizontally(!e.shiftKey);
        }
        else if(keyboard.isEnter(e)) {
          this.moveEditionVertically(!e.shiftKey);
        }
      }
    }
  }

  // Lifecycle and rendering
  
  componentWillReceiveProps(nextProps) {
    if(nextProps.data !== this.props.data) {
      const liveRows = nextProps.data.slice(this.getFrozenRowsCount(nextProps));
      const frozenRows = nextProps.data.slice(0, this.getFrozenRowsCount(nextProps));
      this.setState({
        frozenRows,
        liveHeaders: liveRows[0].slice(this.getFrozenColumnsCount(nextProps)),
        frozenHeaders: liveRows[0].slice(0, this.getFrozenColumnsCount(nextProps)),
        liveRows,
        data: frozenRows.concat(liveRows.slice(this.state.topIdx, this.state.topIdx + this.getNumberOfRowsThatFit(this.state.topIdx || 0)))
      });
    }
  }

  componentDidMount() {
    document.addEventListener('paste', this.paste);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);
    this.setState({
      topRowIdx: this.getFrozenRowsCount() - 1,
      bottomRowIdx: this.getFrozenRowsCount() - 1 + this.getNumberOfRowsThatFit(this.getFrozenRowsCount() - 1),
      leftColIdx: this.getFrozenColumnsCount(),
      rightColIdx: this.getFrozenColumnsCount() + this.getNumberOfColumnsThatFit(this.getFrozenColumnsCount())
    });
  }

  componentWillUnmount() {
    document.removeEventListener('paste', this.paste);
    document.removeEventListener('mouseup', this.onMouseup);
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  renderArea(leftColIdx, rightColIdx, topRowIdx, bottomRowIdx, area) {
    if(!this.container) return null;
    return range(leftColIdx, rightColIdx).map(colIdx => (
      <Column
        key={`column-${colIdx}-${area}`}
        frozen={area !== areas.bottom.right}
        displayColIdx={colIdx}
        dataColIdx={this.state.colIdxMapping[colIdx]}
        header={this.props.header}
        data={this.props.data}
        topRowIdx={topRowIdx}
        bottomRowIdx={bottomRowIdx}
        rowHeights={this.state.rowHeights}
        defaultRowHeight={rowHeight}
        columnWidths={this.state.columnWidths}
        defaultWidth={columnWidth}
        onResizeHeightStart={this.onResizeRowHeightStart}
        onResizeWidthStart={this.onResizeColumnWidthStart}
        onMoveStart={(area === areas.top.left || area === areas.top.right) ? this.onColumnMoveStart : undefined}
        isMoving={this.state.movingColumnIdx === colIdx}
        isMoveTarget={this.state.targetColIdx === colIdx}
        onSelectCellsStart={this.onSelectCellsStart}
        selectedRowsIdx={this.state.cellsSelection === undefined ?
                          undefined :
                          (this.state.cellsSelection.colIdx.min <= colIdx && colIdx <= this.state.cellsSelection.colIdx.max) ?
                            this.state.cellsSelection.rowIdx :
                            undefined}
        isLeftOfSelection={this.state.cellsSelection === undefined ? false : this.state.cellsSelection.colIdx.min === colIdx}
        isRightOfSelection={this.state.cellsSelection === undefined ? false : this.state.cellsSelection.colIdx.max === colIdx}
        onEdit={this.onEdit}
        editedRowIdx={(this.state.editedCell !== undefined && this.state.editedCell.colIdx === colIdx) ? this.state.editedCell.rowIdx : undefined}
        userInput={this.state.userInput}
        onChange={this.onChange}
        isMerged={this.isColumnMerged(colIdx)}

        cellRenderer={this.props.cellRenderer}
        getter={this.props.getter || defaultGetter}

        columns={area === areas.bottom.left ? this.frozenColumns : area === areas.bottom.right ? this.columns : undefined}
        rows={colIdx === leftColIdx ? area === areas.top.right ? this.frozenRows : area === areas.bottom.right ? this.rows : undefined : undefined}
      />
    ));
  }

  render() {
    return (
      <div 
        className={style('bt-container')} 
        tabIndex={0}
        onKeyDown={this.onKeydown}
        onKeyUp={this.onKeyup}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: this.state.frozenRowsHeight,
          width: this.state.frozenColumnsWidth,
          zIndex: 3,
        }}>
          {this.renderArea(0, this.getFrozenColumnsCount(), - 1, this.getFrozenRowsCount() - 1, areas.top.left) /* top left : frozen rows and frozen columns */}
        </div>
        <div 
          ref={elt => this.frozenColumnsContainer = elt}
          onMouseEnter={this.onMouseEnterFrozenColumns}
          onMouseLeave={this.onMouseLeaveFrozenColumns}
          style={{
            position: 'absolute',
            top: this.state.frozenRowsHeight,
            left: 0,
            height: `calc(100% - ${this.state.frozenRowsHeight}px)`,
            width: this.state.frozenColumnsWidth,
            overflow: 'hidden',
            zIndex: 2
          }}
        >
          <div style={{position: 'relative', top: this.state.offsetTop}}>
            {this.renderArea(0, this.getFrozenColumnsCount(), this.state.topRowIdx, this.state.bottomRowIdx, areas.bottom.left) /* bottom left : normal rows but frozen columns */}
          </div>
        </div>
        <div 
          ref={elt => this.frozenRowsContainer = elt}
          onMouseEnter={this.onMouseEnterHeader}
          onMouseLeave={this.onMouseLeaveHeader}
          onWheel={this.onMouseWheel}
          style={{
            position: 'absolute',
            top: 0,
            left: this.state.frozenColumnsWidth,
            height: this.state.frozenRowsHeight,
            width: `calc(100% - ${this.state.frozenColumnsWidth}px)`,
            overflow: 'hidden',
            zIndex: 3
          }}
        >
          <div style={{height: '100%', width: this.state.virtualWidth, position: 'relative', left: this.state.offsetLeft}}>
            {this.renderArea(this.state.leftColIdx, this.state.rightColIdx, - 1, this.getFrozenRowsCount() - 1, areas.top.right) /* top right : frozen rows but normal columns */}
          </div>
        </div>
        <div 
          ref={elt => elt ? this.container = elt : null}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          style={{
            position: 'absolute',
            top: this.state.frozenRowsHeight,
            left: this.state.frozenColumnsWidth,
            height: `calc(100% - ${this.state.frozenRowsHeight}px)`,
            width: `calc(100% - ${this.state.frozenColumnsWidth}px)`
          }}
        >
          <Scroller 
            floating
            onVerticalScroll={this.onVerticalScroll}
            verticalScroll={this.state.verticalScroll}
            virtualHeight={this.state.virtualHeight}
            onHorizontalScroll={this.onHorizontalScroll}
            horizontalScroll={this.state.horizontalScroll}
            virtualWidth={this.state.virtualWidth}
            forceVisible={this.state.isSelecting ||this.state.hoveringHeader || this.state.hoveringFrozenColumns || this.state.resizedColIdx !== undefined || this.state.resizedRowIndexes !== undefined}
            extraWheelElements={[this.frozenColumnsContainer, this.frozenRowsContainer]}
            guideStyle={this.props.guideStyle}
            handleStyle={this.props.handleStyle}
          >
            <div style={{height: '100%', width: this.state.virtualWidth, position: 'relative', top: this.state.offsetTop, left: this.state.offsetLeft, borderBottom: '1px solid #b3b3b3'}}>
              {this.renderArea(this.state.leftColIdx, this.state.rightColIdx, this.state.topRowIdx, this.state.bottomRowIdx, areas.bottom.right) /* bottom right : normal rows and normal columns */}
            </div>
          </Scroller>
        </div>
        {this.container ? 
          <div className={style('bt-horizontal-border')} style={{top: this.state.frozenRowsHeight + Math.min(this.container.offsetHeight, this.state.virtualHeight) - 1, width: this.state.frozenColumnsWidth + Math.min(this.container.offsetWidth, this.state.virtualWidth)}} /> : null}
        {this.container ?
          <div className={style('bt-horizontal-border')} style={{width: this.state.frozenColumnsWidth + Math.min(this.container.offsetWidth, this.state.virtualWidth)}} />  : null}
        {this.container ?
          <div className={style('bt-vertical-border')} style={{height: this.state.frozenRowsHeight + Math.min(this.container.offsetHeight, this.state.virtualHeight)}}/>  : null}
          {this.container ?
          <div className={style('bt-vertical-border')} style={{left: this.state.frozenColumnsWidth + Math.min(this.container.offsetWidth, this.state.virtualWidth) - 1, height: this.state.frozenRowsHeight + Math.min(this.container.offsetHeight, this.state.virtualHeight)}}/>  : null}
      </div>
    );
  }
}

export default Table;
