import React from 'react';
import {simplerHeader, simplerData} from '../../data/data.js';
import Table from 'bam-table';

const cellRenderer = props => (
  <div 
    style={{
      background: props.frozen ? '#4c4c4c' : '#676767',
      color: props.frozen ? 'rgb(200, 200, 200)' : 'rgb(220, 220, 220)',
      borderRight: props.frozen ? '1px solid rgb(130, 130, 130)' : '1px solid rgb(150, 150, 150)',
      borderBottom: props.frozen ? '1px solid rgb(130, 130, 130)' : '1px solid rgb(150, 150, 150)',
      boxSizing: 'border-box',
      height: '100%',
      padding: 5
    }}
  >
    {props.cell}
  </div>
);

class StyledTable extends React.Component {
  render() {
    return (
      <div>
        <div className="example" style={{marginBottom: 50, height: 360}}>
          <p>You can provide a custom style</p>
          <Table 
            header={['#'].concat(simplerHeader)} 
            data={simplerData.map((r, i) => [i].concat(r))}
            configuration={{frozenRowsCount: 1, frozenColumnsCount: 2}}/>
        </div>
        <div className="example" style={{marginBottom: 20, height: 360}}>
          <Table 
            header={['#'].concat(simplerHeader)} 
            data={simplerData.map((r, i) => [i].concat(r))}
            configuration={{frozenRowsCount: 1, frozenColumnsCount: 2}}
            cellRenderer={cellRenderer}
            guideStyle={{background: '#404040'}}
            handleStyle={{background: 'rgb(187, 187, 187)'}}/>
        </div>
      </div>
    )
  }
}

export default StyledTable;