import React from 'react';
import Table from 'bam-table';
import {simplerHeader, simplerData} from '../../data/data.js';

class BigTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.multiply(simplerData, 20000),
      longData: this.multiply(simplerData, 100, true)
    };
  }
  multiply(arr, factor, multiplyRow) {
    let arrays = Array.apply(null, new Array(factor));
    arrays = arrays.map((a , i) => arr.map((b, j) => [i * arr.length + j].concat(multiplyRow ? this.multiplyRow(b) : b)));
    return [].concat.apply([], arrays);
  }
  multiplyRow(arr) {
    let arrays = Array.apply(null, new Array(50 * arr.length));
    arrays = arrays.map((a , i) => i + ' ' + arr[i % arr.length]);
    return [].concat.apply([], arrays);
  }
  render() {
    return (
      <div>
        <div className="example" style={{marginBottom: 20, height: 350, width: 1000, marginLeft: 'calc(50% - 500px)'}}>
          <p><b>A lot</b> of rows is not a problem :</p>
          <Table 
            header={['#'].concat(simplerHeader)} 
            data={this.state.data}
            configuration={{frozenRowsCount: 1, frozenColumnsCount: 2}}/>
        </div>
        <div className="example" style={{marginBottom: 20, height: 350, width: 1000, marginLeft: 'calc(50% - 500px)'}}>
          <p>neither is <b>a lot</b> of columns</p>
          <Table 
            header={['#'].concat(this.multiplyRow(simplerHeader))} 
            data={this.state.longData}
            configuration={{frozenRowsCount: 1, frozenColumnsCount: 2}}/>
        </div>
      </div>
    )
  }
}

export default BigTable;