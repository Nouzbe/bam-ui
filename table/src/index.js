import React from 'react';
import Table from './Table.js';

class ExportedTable extends React.Component {
  isValid() {
    return this.props.headers !== undefined
    && this.props.headers.length > 0
    && this.props.data !== undefined
    && this.props.data.length > 0;
  }
  render() {
    return this.isValid() ? <Table {...this.props} /> : <div>Invalid props</div>;
  }
}

export default ExportedTable;
