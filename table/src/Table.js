import React from 'react';
import Scroller from 'bam-scroller';
import FloatingBorder from './FloatingBorder.js';
import {clipboard, keyboard} from 'bam-utils';

import Column from './Column.js';
import Cell from './Cell.js';
import style from './style.js';

const headerHeight = 30;
const rowHeight = 30;
const columnWidth = 130;

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
      virtualHeight: (this.props.data.length - this.props.frozenRowsCount) * rowHeight, // virtual height of the table body
      offsetTop: 0, // top of the table body (offsetting in order to precisely match the virtual scrolltop value)
      resizedRowIdx: undefined, // row idx which is being resized
      resizedColIdx: undefined, // col idx which is being resized
      frozenColumnsWidth: props.frozenColumnsCount * columnWidth, // width of the frozen columns area (in px)
      virtualWidth: (this.props.data[0].length - props.frozenColumnsCount) * columnWidth, // offset width of the live columns area (in px)
      frozenRowsHeight: props.frozenRowsCount * rowHeight, // offset height of the frozen rows area (in px),
      movingColumnIdx: undefined, // idx of the column that is being moved by the user
      targetColIdx: undefined, // target future idx of the column that is being moved by the user 
      colIdxMapping: props.data[0].reduce((acc, c, idx) => Object.assign(acc, {[idx]: idx}), {}), // (data colIdx => display colIdx) since columns can be moved
      isSelecting: false, // is the user in the process of drag and dropping in order to select cells
      cellsSelection: undefined, // min & max rowIdx & colIdx defining current cells selection
      editedCell: undefined, // {colIdx, rowIdx} of the currently edited cell
      userInput: undefined // current caption entered by the user in the edited cell
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
    // Dom event listeners
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onKeyup = this.onKeyup.bind(this);
    // Refs
    this.columnRef = this.columnRef.bind(this);
    this.rowRef = this.rowRef.bind(this);
    this.frozenColumnRef = this.frozenColumnRef.bind(this);
    this.frozenRowRef = this.frozenRowRef.bind(this);
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
    const containerOffsetTop = scroll * (this.state.virtualHeight - this.container.offsetHeight);
    let previousIdx = this.props.frozenRowsCount - 1;
    let previousBottom = 0;
    for(let i = 0; i < Object.keys(this.state.rowHeights).length; i++) {
      const idx = parseInt(Object.keys(this.state.rowHeights)[i], 10);
      if(idx >= this.props.frozenRowsCount) {
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
    const containerOffsetLeft = scroll * (this.state.virtualWidth - this.container.offsetWidth);
    let previousIdx = this.props.frozenColumnsCount - 1;
    let previousRight = 0;
    for(let i = 0; i < Object.keys(this.state.columnWidths).length; i++) {
      const idx = parseInt(Object.keys(this.state.columnWidths)[i], 10);
      if(idx >= this.props.frozenColumnsCount) {
        const width = this.state.columnWidths[idx];
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
    while(currentIdx < this.props.data[0].length - 1 && requiredWidth < this.container.offsetWidth) {
      currentIdx++;
      requiredWidth += this.state.columnWidths[currentIdx] || columnWidth;
    }
    return currentIdx - idxFrom + 1;
  }

  scrollContinuously(horizontal, vertical) {
    if(this.state.isSelecting || this.state.isMoving) {
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

  onResizeRowHeightStart(rowIdx, initialOffset) {
    this.initialOffsetY = initialOffset;
    this.setState({resizedRowIdx: rowIdx});
  }

  onResizeRowHeight(clientY) {
    const newHeight = Math.max(1, clientY + this.initialOffsetY);
    const previousHeight = this.state.rowHeights[this.state.resizedRowIdx] || rowHeight;
    const frozenRowsHeight = this.state.frozenRowsHeight + (this.state.resizedRowIdx < this.props.frozenRowsCount ? newHeight - previousHeight: 0);
    const virtualHeight = this.state.virtualHeight + (this.state.resizedRowIdx >= this.props.frozenRowsCount ? newHeight - previousHeight : 0);
    this.setState({
      virtualHeight,
      frozenRowsHeight,
      rowHeights: Object.assign({}, this.state.rowHeights, {[this.state.resizedRowIdx]: newHeight})
    });
  }

  onResizeRowHeightEnd() {
    this.setState({resizedRowIdx: undefined});
  }

  onResizeColumnWidthStart(colIdx, initialOffset) {
    this.initialOffsetX = initialOffset;
    this.setState({resizedColIdx: colIdx});
  }

  onResizeColumnWidth(clientX) {
    const newWidth = Math.max(1, clientX + this.initialOffsetX);
    const previousWidth = this.state.columnWidths[this.state.resizedColIdx] !== undefined ? this.state.columnWidths[this.state.resizedColIdx] : columnWidth;
    const frozenColumnsWidth = this.state.frozenColumnsWidth + (this.state.resizedColIdx < this.props.frozenColumnsCount ? newWidth - previousWidth : 0);
    const virtualWidth = this.state.virtualWidth + (this.state.resizedColIdx >= this.props.frozenColumnsCount ? newWidth - previousWidth : 0);
    this.setState({
      columnWidths: Object.assign({}, this.state.columnWidths, {[this.state.resizedColIdx]: newWidth}),
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
    const frozenMove = this.state.movingColumnIdx < this.props.frozenColumnsCount;
    const relevantColumns = frozenMove ? Object.values(this.frozenColumns) : Object.values(this.columns);
    const firstColIdxRightFromMouse = relevantColumns.findIndex(o => o && o.getBoundingClientRect().right > clientX);
    const targetColIdx = (firstColIdxRightFromMouse !== -1 ? Math.max(0, firstColIdxRightFromMouse) : relevantColumns.length) + (frozenMove ? 0 : this.props.frozenColumnsCount);
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
    const relevantRows = Object.values(this.rows);
    const firstColIdxRightFromMouse = relevantColumns.findIndex(o => o && o.getBoundingClientRect().right > clientX);
    const firstRowIdxUnderneathMouse = relevantRows.findIndex(o => o && o.getBoundingClientRect().bottom > clientY);
    const colIdxTo = this.props.frozenColumnsCount + (firstColIdxRightFromMouse !== -1 ? Math.max(0, firstColIdxRightFromMouse) : relevantColumns.length);
    const rowIdxTo = this.props.frozenRowsCount + (firstRowIdxUnderneathMouse !== -1 ? Math.max(0, firstRowIdxUnderneathMouse) : relevantRows.length);
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
    const newColIdx = Math.max(this.props.frozenColumnsCount, Math.min(this.state.cellsSelection.colIdx.min + (toTheRight ? 1 : -1), this.props.data[0].length - 1));
    this.setState({
      cellsSelection: {
        rowIdx: {min: this.state.cellsSelection.rowIdx.min, max: this.state.cellsSelection.rowIdx.min, from: this.state.cellsSelection.rowIdx.min},
        colIdx: {min: newColIdx, max: newColIdx, from: newColIdx}
      }
    });
    this.adjustHorizontalScroll(newColIdx);
  }

  moveSelectionVertically(down) {
    const newRowIdx = Math.min(Math.max(this.props.frozenRowsCount, this.state.cellsSelection.rowIdx.min + (down ? 1 : -1)), this.props.data.length - 1);
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
      this.setState({horizontalScroll: this.horizontalScroll - 0.5 * this.container.parentElement.offsetWidth / this.container.offsetWidth}); // left
    }
    else if(newColumn && newColumn.getBoundingClientRect().right >= this.container.parentElement.getBoundingClientRect().right) {
      this.setState({horizontalScroll: this.horizontalScroll + 0.5 * this.container.parentElement.offsetWidth / this.container.offsetWidth}); // right
    }
  }

  // Editing cells

  onEdit(dataRowIdx, displayColIdx) {
    this.setState({
      cellsSelection: {
        rowIdx: {min: dataRowIdx, max: dataRowIdx, from: dataRowIdx},
        colIdx: {min: displayColIdx, max: displayColIdx, from: displayColIdx}
      },
      editedCell: {rowIdx: dataRowIdx, colIdx: displayColIdx},
      userInput: this.props.data[dataRowIdx][this.state.colIdxMapping[displayColIdx]].caption
    });
    this.initialOffsetTop = this.state.offsetTop;
  }

  enterEdition(e) {
    this.setState({
      editedCell: {
        colIdx: this.state.cellsSelection.colIdx.min, 
        rowIdx: this.state.cellsSelection.rowIdx.min
      },
      userInput: this.props.data[this.state.cellsSelection.rowIdx.min][this.state.colIdxMapping[this.state.cellsSelection.colIdx.min]].caption
    });
  
  }
  copySelection() {
    const selectedRows = this.props.data.slice(this.state.cellsSelection.rowIdx.min, this.state.cellsSelection.rowIdx.max + 1);
    const selectedColumnIndexes = [];
    for(let i = this.state.cellsSelection.colIdx.min; i <= this.state.cellsSelection.colIdx.max; i++) {
      selectedColumnIndexes.push(this.state.colIdxMapping[i]);
    }
    clipboard.copy(selectedRows.map(r => selectedColumnIndexes.map(i => r[i].caption).join('\t')).join('\n'));
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
            if(displayColIdx < this.props.data[0].length) {
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
    const newColIdx = Math.max(this.props.frozenColumnsCount, Math.min(this.state.editedCell.colIdx + (toTheRight ? 1 : -1), this.props.data[0].length - 1));
    this.setState({
      editedCell: {
        rowIdx: this.state.editedCell.rowIdx,
        colIdx: newColIdx
      },
      userInput: this.props.data[this.state.editedCell.rowIdx][this.state.colIdxMapping[newColIdx]].caption
    });
    this.moveSelectionHorizontally(toTheRight);
  }

  moveEditionVertically(down) {
    this.cleanEdition();
    const newRowIdx = Math.max(this.props.frozenRowsCount, Math.min(this.state.editedCell.rowIdx + (down ? 1 : -1), this.props.data.length - 1));
    this.setState({
      editedCell: {
        rowIdx: newRowIdx,
        colIdx: this.state.editedCell.colIdx
      },
     userInput: this.props.data[newRowIdx][this.state.colIdxMapping[this.state.editedCell.colIdx]].caption
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

  // Dom event listeners

  onMouseMove(e) {
    if(this.state.movingColumnIdx !== undefined) {
      this.onColumnMove(e.clientX);
    }
    if(this.state.resizedColIdx !== undefined) {
      this.onResizeColumnWidth(e.clientX);
    }
    if(this.state.resizedRowIdx !== undefined) {
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
    if(this.state.resizedRowIdx !== undefined) {
      this.onResizeRowHeightEnd();
    }
    if(this.state.isSelecting) {
      this.onSelectCellsEnd();
    }
  }

  onMouseLeave(e) {
    const rect = this.container.getBoundingClientRect();
    this.scrollContinuously(
      e.clientX > rect.right ? sides.horizontal.right : e.clientX < rect.left ? sides.horizontal.left : undefined,
      e.clientY > rect.bottom ? sides.vertical.down : e.clientY < rect.top ? sides.vertical.up : undefined
    );
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

  // Refs

  columnRef(colIdx, elt) {
    this.columns[colIdx] = elt;
  }

  rowRef(rowIdx, elt) {
    this.rows[rowIdx] = elt;
  }

  frozenColumnRef(colIdx, elt) {
    this.frozenColumns[colIdx] = elt; 
  }

  frozenRowRef(rowIdx, elt) {
    this.frozenRows[rowIdx] = elt;
  }

  // Lifecycle and rendering
  
  componentWillReceiveProps(nextProps) {
    if(nextProps.data !== this.props.data) {
      const liveRows = nextProps.data.slice(nextProps.frozenRowsCount);
      const frozenRows = nextProps.data.slice(0, nextProps.frozenRowsCount);
      this.setState({
        frozenRows,
        liveHeaders: liveRows[0].slice(nextProps.frozenColumnsCount),
        frozenHeaders: liveRows[0].slice(0, nextProps.frozenColumnsCount),
        liveRows,
        data: frozenRows.concat(liveRows.slice(this.state.topIdx, this.state.topIdx + this.getNumberOfRowsThatFit(this.state.topIdx || 0)))
      });
    }
  }

  componentDidMount() {
    document.addEventListener('paste', this.paste);
    document.addEventListener('mouseup', this.onMouseUp);
    this.setState({
      topRowIdx: this.props.frozenRowsCount,
      bottomRowIdx: this.props.frozenRowsCount + this.getNumberOfRowsThatFit(this.props.frozenRowsCount),
      leftColIdx: this.props.frozenColumnsCount,
      rightColIdx: this.props.frozenColumnsCount + this.getNumberOfColumnsThatFit(this.props.frozenColumnsCount)
    });
  }

  componentWillUnmount() {
    document.removeEventListener('paste', this.paste);
    document.removeEventListener('mouseup', this.onMouseup);
  }

  renderArea(leftColIdx, rightColIdx, topRowIdx, bottomRowIdx, isFrozen, isMovable) {
    if(!this.container) return null;
    const colRange = Array.apply(null, {length: rightColIdx - leftColIdx}).map(Function.call, i => leftColIdx + i);
    return colRange.map(colIdx => (
      <Column
        key={`column-${colIdx}-${topRowIdx}`}
        frozen={isFrozen}
        displayColIdx={colIdx}
        dataColIdx={this.state.colIdxMapping[colIdx]}
        data={this.props.data}
        topRowIdx={topRowIdx}
        bottomRowIdx={bottomRowIdx}
        rowHeights={this.state.rowHeights}
        defaultRowHeight={rowHeight}
        columnWidths={this.state.columnWidths}
        defaultWidth={columnWidth}
        onResizeHeightStart={this.onResizeRowHeightStart}
        onResizeWidthStart={this.onResizeColumnWidthStart}
        onMoveStart={isMovable ? this.onColumnMoveStart : undefined}
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

        columnRef={topRowIdx === 0 ? leftColIdx === 0 ? this.frozenColumnRef : this.columnRef : undefined}
        rowRef={leftColIdx === 0 ? topRowIdx === 0 ? this.frozenRowRef : this.rowRef : undefined}
      />
    ));
  }

  render() {
    return (
      <div 
        className={style('bt-container')} 
        tabIndex={0}
        onKeyDown={this.onKeydown}
        onMouseMove={this.onMouseMove}
        onKeyUp={this.onKeyup}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: this.state.frozenRowsHeight,
          width: this.state.frozenColumnsWidth,
          zIndex: 3
        }}>
          {this.renderArea(0, this.props.frozenColumnsCount, 0, this.props.frozenRowsCount, 'frozen', 'movable') /* top left : frozen rows and frozen columns */}
        </div>
        <div style={{
          position: 'absolute',
          top: this.state.frozenRowsHeight,
          left: 0,
          height: `calc(100% - ${this.state.frozenRowsHeight}px)`,
          width: this.state.frozenColumnsWidth,
          overflow: 'hidden'
        }}>
          <div style={{position: 'relative', top: this.state.offsetTop}}>
            {this.renderArea(0, this.props.frozenColumnsCount, this.state.topRowIdx, this.state.bottomRowIdx, 'frozen') /* bottom left : normal rows but frozen columns */}
          </div>
        </div>
        <div style={{
          position: 'absolute',
          top: 0,
          left: this.state.frozenColumnsWidth,
          height: this.state.frozenRowsHeight,
          width: `calc(100% - ${this.state.frozenColumnsWidth}px)`,
          overflow: 'hidden',
          zIndex: 2
        }}>
          <div style={{height: '100%', width: this.state.virtualWidth, position: 'relative', left: this.state.offsetLeft}}>
            {this.renderArea(this.state.leftColIdx, this.state.rightColIdx, 0, this.props.frozenRowsCount, 'frozen', 'movable') /* top right : frozen rows but normal columns */}
          </div>
        </div>
        <div 
          ref={elt => this.container = elt}
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
          >
            <div style={{height: '100%', width: this.state.virtualWidth, position: 'relative', top: this.state.offsetTop, left: this.state.offsetLeft}}>
              {this.renderArea(this.state.leftColIdx, this.state.rightColIdx, this.state.topRowIdx, this.state.bottomRowIdx) /* bottom right : normal rows and normal columns */}
            </div>
          </Scroller>
        </div>
      </div>
    );
  }
}

export default Table;
