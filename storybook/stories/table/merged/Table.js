import React from 'react';
import {pivotHeader, pivotData} from '../../../data/data.js';
import Table from 'bam-table';

class MergedTable extends React.Component {
  render() {
    return (
      <div style={{height: 500}}>
        <Table 
          data={[pivotHeader].concat(pivotData)}
          configuration={{frozenRowsCount: 1, frozenColumnsCount: this.props.frozenColumnsCount, mergedColumnsCount: this.props.mergedColumnsCount}}/>
      </div>
    )
  }
}

export default MergedTable;