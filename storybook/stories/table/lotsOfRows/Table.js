import React from 'react';
import Table from 'bam-table';
import {simplerHeader, simplerData} from '../../../data/data.js';

class LotsOfRows extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.multiply(simplerData, 20000)
    };
  }
  multiply(arr, factor, multiplyRow) {
    let arrays = Array.apply(null, new Array(factor));
    arrays = arrays.map((a , i) => arr.map((b, j) => [i * arr.length + j].concat(b)));
    return [].concat.apply([], arrays);
  }
  render() {
    return (
      <div style={{height: 500}}>
        <Table 
          data={[['#'].concat(simplerHeader)].concat(this.state.data)}
          configuration={{frozenRowsCount: 1, frozenColumnsCount: 2}}/>
      </div>
    )
  }
}

export default LotsOfRows;