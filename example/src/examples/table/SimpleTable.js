import React from 'react';
import Table from 'bam-table';

class SimpleTable extends React.Component {
  render() {
    return (
      <div style={{height: 'calc(100% - 100px)', display: 'table', width: 1000, marginLeft: 'calc(50% - 500px)'}}>
        <div style={{display: 'table-cell', verticalAlign: 'middle'}}>
          <div className="example" style={{height: 150, marginBottom: 50}}>
            <p>Notice that the user can resize rows and columns, select cells and copy them to his clipboard.</p>
            <Table 
              header={['Country', 'City', 'Inhabitants', 'Size']}
              data={[['France', 'Paris', '2 220 445', '105,40 km2'], ['UK', 'London', '8 673 713', '1 572 km2']]}/>
          </div>
          <div className="example" style={{height: 150, marginBottom: 50}}>
            <p>It's possible to freeze rows.</p>
            <Table 
              header={['Country', 'City', 'Inhabitants', 'Size']} 
              data={[['France', 'Paris', '2 220 445', '105,40 km2'], ['UK', 'London', '8 673 713', '1 572 km2']]}
              configuration={{frozenRowsCount: 1}}/>
          </div>
          <div className="example" style={{height: 150}}>
            <p>... columns as well.</p>
            <Table 
              header={['Country', 'City', 'Inhabitants', 'Size']} 
              data={[['France', 'Paris', '2 220 445', '105,40 km2'], ['UK', 'London', '8 673 713', '1 572 km2']]}
              configuration={{frozenRowsCount: 1, frozenColumnsCount: 2}}/>
          </div>
        </div>
      </div>
    )
  }
}

export default SimpleTable;