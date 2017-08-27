import React from 'react';
import {pivotHeader, pivotData} from '../../data/data.js';
import Table from 'bam-table';

class MergedTable extends React.Component {
  render() {
    return (
      <div style={{height: 'calc(100% - 200px)', overflow: 'hidden'}}>
        <div className="example" style={{width: 780, marginLeft: 'calc(50% - 390px)', marginTop: 150}}>
          <Table 
            header={pivotHeader} 
            data={pivotData}
            configuration={{frozenRowsCount: 1, frozenColumnsCount: 2, columns: {0: {merged: true}, 1: {merged: true}}}}/>
        </div>
      </div>
    )
  }
}

export default MergedTable;