import React from 'react';
import Cell from './Cell.js';
import style from './style.js';

class ColumnBody extends React.Component {
    render() {
        return (
            <div className={style('bt-column-body')} style={{top: this.props.offsetTop}}>
                {this.props.data.map((c, idx) => (
                    <Cell 
                        key={`cell-${this.props.colIdx}-${idx}`} 
                        cell={c} 
                        height={this.props.rowHeights[idx]}
                        onHeightChange={newHeight => this.props.onRowHeightChange(idx, newHeight)}    
                    />
                ))}
            </div>
        )
    }
}

export default ColumnBody;