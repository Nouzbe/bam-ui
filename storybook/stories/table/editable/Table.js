import React from 'react';
import Table from 'bam-table';
import {simplerHeader, simplerData} from '../../../data/data.js';

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [simplerHeader].concat(simplerData)
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
      <div style={{height: 500}}>
        <Table 
          data={this.state.data}
          configuration={{frozenRowsCount: 1}}
          onChange={this.onChange}/>
      </div>
    )
  }
}

export default EditableTable;