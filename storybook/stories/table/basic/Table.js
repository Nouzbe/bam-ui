import React from 'react';
import Table from 'bam-table';

export default props => (
  <div style={{height: 200, width: 600}}>
    <Table 
      data={[['Country', 'City', 'Inhabitants', 'Size'], ['France', 'Paris', '2 220 445', '105,40 km2'], ['UK', 'London', '8 673 713', '1 572 km2']]}
      configuration={{frozenRowsCount: props.frozenRowsCount, frozenColumnsCount: props.frozenColumnsCount}}/>
  </div>
);