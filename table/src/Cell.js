import React from 'react';
import style from './style.js';

class Cell extends React.Component {
    render() {
        return (
            <div ref={e => this.container = e} style={{width: '100%', height: `${this.props.height}px`, position: 'relative'}}>
                <div className={style("bt-cell")}>{this.props.cell.caption}</div>
                {this.props.highlightedBorderBottom ?
                    <div className={style('bt-cell-border-bottom')} style={{background: this.props.highlightColor}}/>
                :
                    null
                }
            </div>
        );
    }
}

export default Cell;