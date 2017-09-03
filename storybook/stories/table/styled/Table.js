import React from 'react';
import {simplerHeader, simplerData} from '../../../data/data.js';
import Table from 'bam-table';

const cellRenderer = (props, knobProps) => {
  const border = `1px solid ${props.frozen ? knobProps.frozenBorderColor: knobProps.borderColor}`;
  return (
    <div 
      style={{
        background: props.frozen ? knobProps.frozenBackground : knobProps.background,
        color: props.frozen ? knobProps.frozenColor : knobProps.color,
        borderRight: border,
        borderBottom: border,
        boxSizing: 'border-box',
        height: '100%',
        padding: 5
      }}
    >
      {props.cell}
    </div>
  )
};

class StyledTable extends React.Component {
  render() {
    return (
      <div style={{height: 500}}>
        <Table 
          data={[['#'].concat(simplerHeader)].concat(simplerData.map((r, i) => [i].concat(r)))}
          configuration={{frozenRowsCount: 1, frozenColumnsCount: 2}}
          cellRenderer={props => cellRenderer(props, this.props)}
          guideStyle={{background: this.props.guideColor}}
          handleStyle={{background: this.props.handleColor}}/>
      </div>
    )
  }
}

export default StyledTable;