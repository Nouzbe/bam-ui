import React from 'react';
import Table from 'bam-table';
import {simplerHeader, simplerData} from '../../../data/data.js';

class LotsOfColumns extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.multiply(simplerData, 100),
    };
  }
  multiply(arr, factor, multiplyRow) {
    let arrays = Array.apply(null, new Array(factor));
    arrays = arrays.map((a , i) => arr.map((b, j) => [i * arr.length + j].concat( this.multiplyRow(b))));
    return [].concat.apply([], arrays);
  }
  multiplyRow(arr) {
    let arrays = Array.apply(null, new Array(50 * arr.length));
    arrays = arrays.map((a , i) => i + ' ' + arr[i % arr.length]);
    return [].concat.apply([], arrays);
  }
  render() {
    return (
      <div style={{height: 500}}>
        <Table 
          data={[['#'].concat(this.multiplyRow(simplerHeader))].concat(this.state.data)}
          configuration={{frozenRowsCount: 1, frozenColumnsCount: 2}}/>
      </div>
    )
  }
}

export default LotsOfColumns;