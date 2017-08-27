import React from 'react';
import Table from 'bam-table';
import {simplerHeader, simplerData} from '../../data/data.js';

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: simplerData
    };
    this.onChange = this.onChange.bind(this);
  }
  onChange(newCells) {
    const newData = this.state.data.slice(0);
    newCells.map(o => newData[o.rowIdx][o.colIdx] = o.value);
    this.setState({data: newData});
  }
  render() {
    return (
      <div style={{height: 'calc(100% - 200px)', overflow: 'hidden'}}>
        <div className="example" style={{height: 360, width: 1000, marginLeft: 'calc(50% - 500px)', marginTop: 100}}>
          <p>By providing an onChange prop, you can let the user edit the data that sits in the table</p>
          <Table 
            header={simplerHeader} 
            data={this.state.data}
            configuration={{frozenRowsCount: 1}}
            onChange={this.onChange}/>
        </div>
      </div>
    )
  }
}

export default EditableTable;