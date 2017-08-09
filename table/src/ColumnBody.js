import React from 'react';
import Cell from './Cell.js';
import style from './style.js';

class ColumnBody extends React.Component {
    render() {
        return (
            <div style={{position: 'relative', height: this.props.height, width: '100%', top: - this.props.containerTop}}>
                <div className={style('bt-column-body')} style={{top: this.props.contentTop}}>
                    {this.props.data.map((c, idx) => (
                        <Cell 
                            key={`cell-${this.props.colIdx}-${idx}`} 
                            cell={c} 
                            height={this.props.rowHeights[idx]}
                            onHeightChange={newHeight => this.props.onRowHeightChange(idx, newHeight)}    
                        />
                    ))}
                </div>
            </div>
        )
    }
}

export default ColumnBody;