import React from 'react';
import style from './style.js';
import FloatingBorder from './FloatingBorder.js';

class Cell extends React.Component {
    render() {
        return (
            <div ref={e => this.container = e} style={{width: '100%', height: `${this.props.height}px`, position: 'relative'}}>
                <div className={style("bt-cell")}>{this.props.cell.caption}</div>
                <FloatingBorder horizontal visible={this.props.highlightedBorderBottom} color={this.props.highlightColor}/>
            </div>
        );
    }
}

export default Cell;