import React from 'react';
import Scroller from 'bam-scroller';
import FloatingBorder from './FloatingBorder.js';
import {clipboard, keyboard} from 'bam-utils';

import Column from './Column.js';
import style from './style.js';

const headerHeight = 30;
const rowHeight = 30;
const columnWidth = 130;
const resizeHintColor = '#c3c3c3';
const moveHintColor = 'rgba(66, 134, 244, 0.1)';
const moveHintBorderColor = 'rgb(66, 134, 244)';
const selectHintColor = 'rgba(66, 134, 244, 0.1)';
const selectHintBorderColor = 'rgb(66, 134, 244)';

class Table extends React.Component {
  constructor(props) {
    super(props);
    const liveRows = props.data.slice(this.props.frozenRowsCount);
    this.columns = {}; // (colIdx => dom elt) for the columns
    this.rows = {}; // (rowIdx => first cell elt) for the rows
    this.state = {
      topIdx: 0, // idx of the first displayed row
      frozenRows: props.data.slice(0, props.frozenRowsCount), // frozen rows data
      liveHeaders: liveRows[0].slice(props.frozenColumnsCount), // part of frozenRows that is also within frozen columns
      frozenHeaders: liveRows[0].slice(0, props.frozenColumnsCount), // part of frozenRows that is within live columns
      liveRows: liveRows, // rest of the data
      data: [], // slice of liveRows that is displayed
      rowHeights: {}, // (idx => height) for every row which height has been changed by user
      columnWidths: {}, // (idx => width) for every column which width has been changed by user
      virtualHeight: liveRows.length * rowHeight, // virtual height of the table body
      offsetTop: 0, // top of the table body (offsetting in order to precisely match the virtual scrolltop value)
      highlightedBorderBottomIdx: undefined, // row idx which border bottom is highlighted (on hover to let the user know that row resizing is possible)
      highlightedBorderRightIdx: undefined, // col idx which border right is highlighted (on hover to let the user know that col resizing is possible)
      resizedRowIdx: undefined, // row idx which is being resized
      resizedColIdx: undefined, // col idx which is being resized
      frozenColumnsWidth: props.frozenColumnsCount * columnWidth, // width of the frozen columns area (in px)
      bodyWidth: (liveRows[0].length - props.frozenColumnsCount) * columnWidth, // offset width of the live columns area (in px)
      frozenRowsHeight: props.frozenRowsCount * rowHeight, // offset height of the frozen rows area (in px),
      movingColumnIdx: undefined, // idx of the column that is being moved by the user
      targetColIdx: undefined, // target future idx of the column that is being moved by the user 
      colIdxMapping: props.data[0].reduce((acc, c, idx) => Object.assign(acc, {[idx]: idx}), {}), // (data colIdx => display colIdx) since columns can be moved
      isSelecting: false, // is the user in the process of drag and dropping in order to select cells
      cellsSelection: undefined, // min & max rowIdx & colIdx defining current cells selection
      editedCell: undefined, // {colIdx, rowIdx} of the currently edited cell
      userInput: undefined
    };
    this.onScroll = this.onScroll.bind(this);
    this.getNumberOfRowsThatFit = this.getNumberOfRowsThatFit.bind(this);
    this.getWidth = this.getWidth.bind(this);
    this.onMouseEnterRowBorderBottom = this.onMouseEnterRowBorderBottom.bind(this);
    this.onMouseLeaveRowBorderBottom = this.onMouseLeaveRowBorderBottom.bind(this);
    this.onMouseEnterColBorderRight = this.onMouseEnterColBorderRight.bind(this);
    this.onMouseLeaveColBorderRight = this.onMouseLeaveColBorderRight.bind(this);
    this.onResizeRowHeightStart = this.onResizeRowHeightStart.bind(this);
    this.onResizeRowHeight = this.onResizeRowHeight.bind(this);
    this.onResizeRowHeightEnd = this.onResizeRowHeightEnd.bind(this);
    this.onResizeColumnWidthStart = this.onResizeColumnWidthStart.bind(this);
    this.onResizeColumnWidth = this.onResizeColumnWidth.bind(this);
    this.onResizeColumnWidthEnd = this.onResizeColumnWidthEnd.bind(this);
    this.onSelectCellsStart = this.onSelectCellsStart.bind(this);
    this.onSelectCells = this.onSelectCells.bind(this);
    this.onSelectCellsEnd = this.onSelectCellsEnd.bind(this);
    this.isASingleCellSelected = this.isASingleCellSelected.bind(this);
    this.onColumnMoveStart = this.onColumnMoveStart.bind(this);
    this.onColumnMove = this.onColumnMove.bind(this);
    this.onColumnMoveEnd = this.onColumnMoveEnd.bind(this);
    this.getDataColIdx = this.getDataColIdx.bind(this);
    this.getDisplayColIdx = this.getDisplayColIdx.bind(this);
    this.getDataRowIdx = this.getDataRowIdx.bind(this);
    this.getDisplayRowIdx = this.getDisplayRowIdx.bind(this);
    this.getFrozenColumns = this.getFrozenColumns.bind(this);
    this.getLiveColumns = this.getLiveColumns.bind(this);
    this.getLiveRows = this.getLiveRows.bind(this);
    this.getColumns = this.getColumns.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onKeydown = this.onKeydown.bind(this);
    this.onKeyup = this.onKeyup.bind(this);
    this.onEdit = this.onEdit.bind(this);
    this.enterEdition = this.enterEdition.bind(this);
    this.moveEditionHorizontally = _.throttle(this.moveEditionHorizontally, 60).bind(this);
    this.moveEditionVertically = _.throttle(this.moveEditionVertically, 60).bind(this);
    this.moveSelectionHorizontally = _.throttle(this.moveSelectionHorizontally, 60).bind(this);
    this.moveSelectionVertically = _.throttle(this.moveSelectionVertically, 60).bind(this);
    this.cleanEdition = this.cleanEdition.bind(this);
    this.onChange = this.onChange.bind(this);
    this.copySelection = this.copySelection.bind(this);
    this.cutSelection = this.cutSelection.bind(this);
    this.paste = this.paste.bind(this);
    this.deleteSelection = this.deleteSelection.bind(this);
    this.columnRef = this.columnRef.bind(this);
    this.rowRef = this.rowRef.bind(this);
  }

  // Virtual Scrolling

  onScroll(scroll) {
    if(this.state.virtualHeight > this.container.offsetHeight || scroll === 0) {
      const [topIdx, offsetTop] = this.getFirstFittingRow(scroll);
      this.setState({
        topIdx,
        offsetTop,
        data: this.state.frozenRows.concat(this.state.liveRows.slice(topIdx, topIdx + this.getNumberOfRowsThatFit(topIdx)))
      });
    }
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

  // Resizing

  onResizeRowHeightStart(rowIdx, initialOffset) {
    this.initialOffsetY = initialOffset;
    this.setState({resizedRowIdx: rowIdx});
  }

  onResizeRowHeight(clientY) {
    const newHeight = Math.max(1, clientY + this.initialOffsetY);
    const offsetIdx = this.state.resizedRowIdx < this.props.frozenRowsCount ? this.state.resizedRowIdx : this.state.topIdx + this.state.resizedRowIdx;
    const previousHeight = this.state.rowHeights[offsetIdx] || rowHeight;
    const virtualHeight = this.state.virtualHeight + newHeight - previousHeight;
    const frozenRowsHeight = this.state.frozenRowsHeight + (this.state.resizedRowIdx < this.props.frozenRowsCount ? newHeight - previousHeight : 0);
    this.setState({
      virtualHeight,
      frozenRowsHeight,
      rowHeights: Object.assign({}, this.state.rowHeights, {[offsetIdx]: newHeight})
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
    const bodyWidth = this.state.bodyWidth + (this.state.resizedColIdx >= this.props.frozenColumnsCount ? newWidth - previousWidth : 0);
    this.setState({
      columnWidths: Object.assign({}, this.state.columnWidths, {[this.state.resizedColIdx]: newWidth}),
      frozenColumnsWidth,
      bodyWidth
    });
  }

  onResizeColumnWidthEnd() {
    this.setState({resizedColIdx: undefined});
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

  onMouseEnterColBorderRight(idx) {
    this.setState({highlightedBorderRightIdx: idx});
  }

  onMouseLeaveColBorderRight() {
    this.setState({highlightedBorderRightIdx: undefined});
  }

  // Selecting

  onSelectCellsStart(rowIdx, colIdx) {
    this.cleanEdition();
    const displayColIdx = this.getDisplayColIdx(colIdx);
    const dataRowIdx = this.getDataRowIdx(rowIdx);
    this.setState({
      isSelecting: true,
      cellsSelection: {
        rowIdx: {min: dataRowIdx, max: dataRowIdx, from: dataRowIdx},
        colIdx: {min: displayColIdx, max: displayColIdx, from: displayColIdx}
      }
    });
    this.initialOffsetTop = this.state.offsetTop;
  }

  onSelectCells(clientX, clientY) {
    const relevantColumns = this.getLiveColumns();
    const relevantRows = this.getLiveRows();
    const firstColIdxRightFromMouse = relevantColumns.findIndex(o => o.getBoundingClientRect().right > clientX);
    const firstRowIdxUnderneathMouse = relevantRows.findIndex(o => o.getBoundingClientRect().bottom > clientY);
    const colIdxTo = this.props.frozenColumnsCount + (firstColIdxRightFromMouse !== -1 ? Math.max(0, firstColIdxRightFromMouse) : relevantColumns.length);
    const rowIdxTo = this.getDataRowIdx(this.props.frozenRowsCount + (firstRowIdxUnderneathMouse !== -1 ? Math.max(0, firstRowIdxUnderneathMouse) : relevantRows.length));
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

  moveSelectionHorizontally(toTheRight) {
    const colIdxDirectlyToTheRight = Math.max(this.props.frozenColumnsCount, Math.min(this.state.cellsSelection.colIdx.min + (toTheRight ? 1 : -1), this.props.data[0].length - 1));
    this.setState({
      cellsSelection: {
        rowIdx: {min: this.state.cellsSelection.rowIdx.min, max: this.state.cellsSelection.rowIdx.min, from: this.state.cellsSelection.rowIdx.min},
        colIdx: {min: colIdxDirectlyToTheRight, max: colIdxDirectlyToTheRight, from: colIdxDirectlyToTheRight}
      }
    });
  }

  moveSelectionVertically(down) {
    const rowIdxDirectlyToTheBottom = this.getDisplayRowIdx(Math.max(this.props.frozenRowsCount, Math.min(this.getDataRowIdx(this.state.cellsSelection.rowIdx.min) + (down ? 1 : -1), this.props.data.length - 1)));
    this.setState({
      cellsSelection: {
        rowIdx: {min: rowIdxDirectlyToTheBottom, max: rowIdxDirectlyToTheBottom, from: rowIdxDirectlyToTheBottom},
        colIdx: {min: this.state.cellsSelection.colIdx.min, max: this.state.cellsSelection.colIdx.min, from: this.state.cellsSelection.colIdx.min}
      }
    });
  }

  isASingleCellSelected() {
    return this.state.cellsSelection !== undefined &&
           this.state.cellsSelection.rowIdx.min === this.state.cellsSelection.rowIdx.max && 
           this.state.cellsSelection.colIdx.min === this.state.cellsSelection.colIdx.max;
  }

  // Moving columns

  onColumnMoveStart(colIdx) {
    const displayColIdx = this.getDisplayColIdx(colIdx);
    this.setState({movingColumnIdx: displayColIdx, targetColIdx: displayColIdx});
  }

  onColumnMove(clientX) {
    const frozenMove = this.state.movingColumnIdx < this.props.frozenColumnsCount;
    const relevantColumns = frozenMove ? this.getFrozenColumns() : this.getLiveColumns();
    const firstColIdxRightFromMouse = relevantColumns.findIndex(o => o.getBoundingClientRect().right > clientX);
    const targetColIdx = firstColIdxRightFromMouse !== -1 ? Math.max(0, firstColIdxRightFromMouse) : relevantColumns.length;
    this.setState({targetColIdx: frozenMove ? targetColIdx : targetColIdx + this.props.frozenColumnsCount});
  }

  onColumnMoveEnd() {
    if(this.state.movingColumnIdx !== this.state.targetColIdx && this.state.movingColumnIdx !== this.state.targetColIdx - 1) {
      const nextColIdxMapping = Object.assign({}, this.state.colIdxMapping);
      const reverse = this.state.targetColIdx < this.state.movingColumnIdx;
      for(let i = this.state.movingColumnIdx; reverse ? i > this.state.targetColIdx : i < this.state.targetColIdx - 1; reverse ? i-- : i++) {
        nextColIdxMapping[i] = this.getDataColIdx(i + (reverse ? -1 : 1));
      }
      nextColIdxMapping[reverse ? this.state.targetColIdx : this.state.targetColIdx - 1] = this.getDataColIdx(this.state.movingColumnIdx);
      this.setState({
        colIdxMapping: nextColIdxMapping
      });
    }
    this.setState({
      movingColumnIdx: undefined,
      targetColIdx: undefined
    });
  }

  // Editing

  onEdit(rowIdx, colIdx) {
    const displayColIdx = this.getDisplayColIdx(colIdx);
    const dataRowIdx = this.getDataRowIdx(rowIdx);
    this.setState({
      cellsSelection: {
        rowIdx: {min: dataRowIdx, max: dataRowIdx, from: dataRowIdx},
        colIdx: {min: displayColIdx, max: displayColIdx, from: displayColIdx}
      },
      editedCell: {rowIdx, colIdx},
      userInput: this.props.data[dataRowIdx][colIdx].caption
    });
    this.initialOffsetTop = this.state.offsetTop;
  }

  enterEdition(e) {
    this.gotFirstOnChange = false; // this lets us keep track of all input, even if the next keyup is fired before the input is mounted and focused
    const colIdx = this.getDataColIdx(this.state.cellsSelection.colIdx.min);
    this.setState({
      editedCell: {
        colIdx, 
        rowIdx: this.getDisplayRowIdx(this.state.cellsSelection.rowIdx.min)
      },
      userInput: this.props.data[this.state.cellsSelection.rowIdx.min][colIdx].caption
    });
  
  }
  copySelection() {
    const selectedRows = this.props.data.slice(this.state.cellsSelection.rowIdx.min, this.state.cellsSelection.rowIdx.max + 1);
    const selectedColumnIndexes = [];
    for(let i = this.state.cellsSelection.colIdx.min; i <= this.state.cellsSelection.colIdx.max; i++) {
      selectedColumnIndexes.push(this.getDataColIdx(i));
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
                colIdx: this.getDataColIdx(displayColIdx),
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
          colIdx: this.getDataColIdx(j),
          value: ''
        });
      }
    }
    this.props.onChange(newCells);
  }

  moveEditionHorizontally(toTheRight) {
    const dataRowIdx = this.getDataRowIdx(this.state.editedCell.rowIdx);
    this.props.onChange([{rowIdx: dataRowIdx, colIdx: this.state.editedCell.colIdx, value: this.state.userInput}]);
    const colIdxDirectlyToTheRight = Math.max(0, Math.min(this.getDisplayColIdx(this.state.editedCell.colIdx) + (toTheRight ? 1 : -1), this.props.data[0].length - 1));
    const dataColIdx = this.getDataColIdx(colIdxDirectlyToTheRight);
    this.setState({
      editedCell: {
        rowIdx: this.state.editedCell.rowIdx,
        colIdx: dataColIdx
      },
      cellsSelection: {
        rowIdx: {min: dataRowIdx, max: dataRowIdx, from: dataRowIdx},
        colIdx: {min: colIdxDirectlyToTheRight, max: colIdxDirectlyToTheRight, from: colIdxDirectlyToTheRight}
      },
      userInput: this.props.data[dataRowIdx][dataColIdx].caption
    });
  }

  moveEditionVertically(down) {
    this.props.onChange([{rowIdx: this.getDataRowIdx(this.state.editedCell.rowIdx), colIdx: this.state.editedCell.colIdx, value: this.state.userInput}]);
    const rowIdxDirectlyToTheBottom = Math.max(0, Math.min(this.getDataRowIdx(this.state.editedCell.rowIdx) + (down ? 1 : -1), this.props.data.length - 1));
    this.setState({
      editedCell: {
        rowIdx: this.getDisplayRowIdx(rowIdxDirectlyToTheBottom),
        colIdx: this.state.editedCell.colIdx
      },
      cellsSelection: {
        rowIdx: {min: rowIdxDirectlyToTheBottom, max: rowIdxDirectlyToTheBottom, from: rowIdxDirectlyToTheBottom},
        colIdx: {min: this.state.cellsSelection.colIdx.min, max: this.state.cellsSelection.colIdx.min, from: this.state.cellsSelection.colIdx.min}
      },
      userInput: this.props.data[rowIdxDirectlyToTheBottom][this.state.editedCell.colIdx].caption
    });
  }

  cleanEdition() {
    if(this.props.onChange !== undefined && this.state.editedCell !== undefined) {
      this.props.onChange([{rowIdx: this.getDataRowIdx(this.state.editedCell.rowIdx), colIdx: this.state.editedCell.colIdx, value: this.state.userInput}]);
      this.setState({
        editedCell: undefined,
        userInput: undefined
      })
    }
  }

  onChange(e) {
    this.setState({userInput: e.target.value});
  }

  // Utils 

  getDataColIdx(displayColIdx) {
    return this.state.colIdxMapping[displayColIdx];
  }

  getDisplayColIdx(dataColIdx) {
    return parseInt(_.find(Object.keys(this.state.colIdxMapping), i => this.getDataColIdx(i) === dataColIdx), 10);
  }

  getDataRowIdx(displayRowIdx) {
    return displayRowIdx < this.props.frozenRowsCount ? displayRowIdx : displayRowIdx + this.state.topIdx;
  }

  getDisplayRowIdx(dataRowIdx) {
    return dataRowIdx < this.props.frozenRowsCount ? dataRowIdx : dataRowIdx - this.state.topIdx;
  }

  getFrozenColumns() {
    return Object.keys(this.columns).filter(idx => idx < this.props.frozenColumnsCount).map(idx => this.columns[this.getDataColIdx(idx)]);
  }

  getLiveColumns() {
    return Object.keys(this.columns).filter(idx => idx >= this.props.frozenColumnsCount).map(idx => this.columns[this.getDataColIdx(idx)]);
  }

  getColumns() {
    return Object.keys(this.columns).map(idx => this.columns[this.getDataColIdx(idx)]);
  }

  getLiveRows() {
    return Object.keys(this.rows).filter(idx => idx >= this.props.frozenRowsCount).map(idx => this.rows[idx]);
  }

  // Listeners and render

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

  onKeydown(e) {
    if(this.isASingleCellSelected()) {
      if(!e.ctrlKey && this.props.onChange !== undefined && this.state.editedCell === undefined && keyboard.isAlphaNumeric(e.keyCode)) {
        this.enterEdition(e);
      }
      else if(this.state.editedCell !== undefined) {
        if(keyboard.isTab(e)) {
          this.moveEditionHorizontally(!e.shiftKey);
          e.preventDefault();
        }
        else if(keyboard.isEnter(e)) {
          this.moveEditionVertically(!e.shiftKey);
        }
      }
      
      else if(keyboard.isLeftArrow(e)) {
        this.moveSelectionHorizontally(false);
      }
      else if(keyboard.isRightArrow(e)) {
        this.moveSelectionHorizontally(true);
      }
      else if(keyboard.isUpArrow(e)) {
        this.moveSelectionVertically(false);
      }
      else if(keyboard.isDownArrow(e)) {
        this.moveSelectionVertically(true);
      }
    }
  }

  onKeyup(e) {
    if(keyboard.isEscape(e)) {
      if(this.state.editedCell !== undefined) {
        this.cleanEdition();
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
    }
  }

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
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('keydown', this.onKeydown);
    document.addEventListener('keyup', this.onKeyup);
    document.addEventListener('paste', this.paste);
    this.setState({
      data: this.state.frozenRows.concat(this.state.liveRows.slice(0, this.getNumberOfRowsThatFit(0)))
    });
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyup);
    document.removeEventListener('paste', this.paste);
  }

  columnRef(colIdx, elt) {
    this.columns[colIdx] = elt;
  }

  rowRef(colIdx, rowIdx, elt) {
    if(colIdx === 0) {
      this.rows[rowIdx < this.props.frozenRowsCount ? rowIdx : this.props.frozenRowsCount + rowIdx] = elt
    }
  }

  renderResizeIsPossibleHintBorder() {
    if(!this.state.isSelecting && this.state.highlightedBorderBottomIdx !== undefined) {
      return <FloatingBorder 
        top
        visible={true}
        offset={Object.values(this.rows)[this.state.highlightedBorderBottomIdx].getBoundingClientRect().bottom - 3}
        height={1}
        color={resizeHintColor}/>
    }
    return null;
  }

  renderColumn(frozen, colIdx, displayColIdx, headers) {
    return <Column 
        frozen={frozen}
        key={`${frozen ? 'frozen-': ''}column-${colIdx}`}
        columnRef={this.columnRef}
        rowRef={this.rowRef}
        colIdx={colIdx}
        frozenCellsCount={this.props.frozenRowsCount}
        data={this.state.data}
        columnWidth={this.state.columnWidths[colIdx] || columnWidth}
        rowHeights={this.state.rowHeights}
        defaultRowHeight={rowHeight}
        offsetTop={this.state.offsetTop}
        onMouseEnterBorderBottom={this.onMouseEnterRowBorderBottom}
        onMouseLeaveBorderBottom={this.onMouseLeaveRowBorderBottom}
        onMouseEnterBorderRight={this.onMouseEnterColBorderRight}
        onMouseLeaveBorderRight={this.onMouseLeaveColBorderRight}
        onResizeRowHeightStart={this.onResizeRowHeightStart}
        onResizeWidthStart={this.onResizeColumnWidthStart}
        isBorderRightHighlighted={!this.state.isSelecting && this.state.highlightedBorderRightIdx === colIdx}
        onMoveStart={this.onColumnMoveStart}
        isMoving={this.state.movingColumnIdx && this.getDataColIdx(this.state.movingColumnIdx) === colIdx}
        isMoveTarget={this.state.targetColIdx && this.getDataColIdx(this.state.targetColIdx) === colIdx}
        onSelectCellsStart={this.onSelectCellsStart}
        cellsSelection={this.state.cellsSelection}
        isSelecting={this.state.isSelecting}
        getDataRowIdx={this.getDataRowIdx}
        displayColIdx={displayColIdx}
        moveHintColor={moveHintColor}
        moveHintBorderColor={moveHintBorderColor}
        selectHintColor={selectHintColor}
        selectHintBorderColor={selectHintBorderColor}
        resizeHintColor={resizeHintColor}
        onEdit={this.onEdit}
        editedRowIdx={(this.state.editedCell !== undefined && this.state.editedCell.colIdx === colIdx) ? this.state.editedCell.rowIdx : undefined}
        userInput={(this.state.editedCell !== undefined && this.state.editedCell.colIdx === colIdx) ? this.state.userInput : undefined}
        onChange={this.onChange}
      />
  }

  renderColumns(frozen, colIdxOffset, headers) {
    return headers.map((r, colIdx) => this.renderColumn(frozen, this.getDataColIdx(colIdx + colIdxOffset), colIdx + colIdxOffset, headers))
  }

  render() {
    return (
      <Scroller 
        floating
        className={style('bt-container')} 
        containerRef={elt => this.container = elt}
        onVerticalScroll={this.onScroll}
        virtualHeight={this.state.virtualHeight}
        verticalOffset={this.state.frozenRowsHeight}
        horizontalOffset={this.state.frozenColumnsWidth}
      >
        <div style={{height: '100%', width: this.state.frozenColumnsWidth + this.state.bodyWidth}}>
          <div style={{height: '100%', position: 'fixed', overflow: 'hidden', width: this.state.frozenColumnsWidth, top: 0, left: 0, zIndex: 5}}>
            {this.renderColumns(true, 0, this.state.frozenHeaders)}
          </div>
          <div style={{height: '100%', width: this.state.bodyWidth, position: 'relative', left: this.state.frozenColumnsWidth}}>
            {this.renderColumns(false, this.props.frozenColumnsCount, this.state.liveHeaders)}
          </div>
          {this.renderResizeIsPossibleHintBorder()}
        </div>
      </Scroller>
    );
  }
}

export default Table;