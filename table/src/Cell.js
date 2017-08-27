import React from 'react';
import style from './style.js';
import constants from './constants.js';
import FloatingBorder from './FloatingBorder.js';

const moveCursorAtEnd = e => {
    const tmp = e.target.value;
    e.target.value = '';
    e.target.value = tmp;
}

const defaultRenderer = props => (
    <div 
        style={{
            padding: 3,
            borderRight: props.frozen ? '1px solid #b3b3b3' : '1px solid #d3d3d3',
            borderBottom: props.frozen ? '1px solid #b3b3b3' : '1px solid #d3d3d3',
            height: '100%',
            boxSizing: 'border-box'
        }}
    >
        {props.getter(props.cell)}
    </div>
);

class Cell extends React.Component {
    constructor(props) {
        super(props);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onResizeHeightStart = this.onResizeHeightStart.bind(this);
        this.onResizeWidthStart = this.onResizeWidthStart.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const propKeys = _.union(Object.keys(nextProps) || [], Object.keys(this.props) || []);
        for(let i = 0; i < propKeys.length; i++) {
            if(nextProps[propKeys[i]] !== this.props[propKeys[i]]) {
                return true;
            }
        }
        return false;
    }

    onResizeWidthStart(e) {
        if(e.button === 0) {
            e.stopPropagation();
            this.props.onResizeWidthStart();
        }
    }

    onResizeHeightStart(e) {
        if(e.button === 0) {
            e.stopPropagation();
            this.props.onResizeHeightStart(this.props.rowIndexes);
        }
    }

    onMouseDown(e) {
        if(e.button === 0) {
            if(this.props.onMoveStart) {
                this.props.onMoveStart();
            }
            else if(!this.props.isEdited && this.props.onSelectCellsStart) {
                this.props.onSelectCellsStart(this.props.rowIdx, e)
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        this.props.rows !== undefined && nextProps.rows === undefined ? delete this.props.rows[this.props.rowIdx] : undefined;
        this.props.rows === undefined && nextProps.rows !== undefined ? nextProps.rows[this.props.rowIdx] = this.container : undefined;
    }

    componentDidMount() {
        this.props.rows !== undefined ? this.props.rows[this.props.rowIdx] = this.container : undefined;
    }

    componentWillUnmount() {
        this.props.rows !== undefined && this.props.rows[this.props.rowIdx] === this.container ? delete this.props.rows[this.props.rowIdx] : undefined;
    }
    
    render() {
        return (
            <div 
                ref={elt => this.container = elt}
                className={style('bt-cell-container')}
                onMouseDown={this.onMouseDown}
                onDoubleClick={e => e.button === 0 ? this.props.onEdit(this.props.rowIdx) : null}
                style={{
                    height: `${this.props.height}px`,  
                    backgroundColor: this.props.frozen ? '#e6e6e6' : this.props.isSelected ? constants.selectHintColor : '#fff'
                }} 
            >
                <div className={style(this.props.frozen ? 'bt-header' : 'bt-cell')}>
                    {this.props.isEdited ? 
                        <input autoFocus className={style('bt-input')} value={this.props.userInput} onFocus={moveCursorAtEnd} onChange={this.props.onChange}/>
                    :
                        (this.props.cellRenderer || defaultRenderer)(this.props)
                    }
                </div>
                <div className={style("bt-bottom-border")} onMouseDown={this.onResizeHeightStart}/>
                <div className={style("bt-right-border")} onMouseDown={this.onResizeWidthStart}/>
                <FloatingBorder top visible={this.props.isTopOfSelection} height={this.props.isEdited ? 1 : 2} color={constants.selectHintBorderColor} zIndex={2}/>
                <FloatingBorder bottom visible={this.props.isBottomOfSelection} height={this.props.isEdited ? 1 : 2} color={constants.selectHintBorderColor} zIndex={2}/>
                <FloatingBorder left visible={this.props.isLeftOfSelection} width={this.props.isEdited ? 1 : 2} color={constants.selectHintBorderColor} zIndex={2}/>
                <FloatingBorder right visible={this.props.isRightOfSelection} width={this.props.isEdited ? 1 : 2} color={constants.selectHintBorderColor} zIndex={2}/>
            </div>
        );
    }
}

export default Cell;