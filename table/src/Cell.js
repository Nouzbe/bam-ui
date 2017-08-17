import React from 'react';
import style from './style.js';
import FloatingBorder from './FloatingBorder.js';

class Cell extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        const propKeys = _.intersection(Object.keys(nextProps) || [], Object.keys(this.props) || []);
        for(let i = 0; i < propKeys.length; i++) {
            if(nextProps[propKeys[i]] !== this.props[propKeys[i]]) {
                return true;
            }
        }
        return false;
    }
    render() {
        return (
            <div 
                ref={this.props.rowRef ? e => this.props.rowRef(this.props.rowIdx, e) : undefined}
                onMouseDown={e => e.button === 0 ? this.props.onSelectCellsStart(this.props.rowIdx, e) : null}
                className={style('bt-cell-container')}
                style={{
                    height: `${this.props.height}px`,
                    backgroundColor: this.props.isSelected ? this.props.selectHintColor : '#fff'
                }} 
            >
                <div className={style("bt-cell")}>{this.props.cell.caption}</div>
                <FloatingBorder top visible={this.props.isTopOfSelection} height={2} color={this.props.selectHintBorderColor} zIndex={2}/>
                <FloatingBorder bottom visible={this.props.isBottomOfSelection} height={2} color={this.props.selectHintBorderColor} zIndex={2}/>
                <FloatingBorder left visible={this.props.isLeftOfSelection} width={2} color={this.props.selectHintBorderColor} zIndex={2}/>
                <FloatingBorder right visible={this.props.isRightOfSelection} width={2} color={this.props.selectHintBorderColor} zIndex={2}/>
            </div>
        );
    }
}

export default Cell;