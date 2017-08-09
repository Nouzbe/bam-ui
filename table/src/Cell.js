import React from 'react';
import style from './style.js';

class Cell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resizing: false
        };
        this.onResizeStart = this.onResizeStart.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onResizeEnd = this.onResizeEnd.bind(this);
    }
    onResizeStart() {
        this.setState({resizing: true});
    }
    onResize(e) {
        if(this.state.resizing) {
            this.props.onHeightChange(e.clientY - this.container.offsetTop);
        }
    }
    onResizeEnd() {
        this.setState({resizing: false});
    }
    componentDidMount() {
        document.addEventListener('mousemove', this.onResize);
        document.addEventListener('mouseup', this.onResizeEnd);
    }
    componentWillUnmount() {
        document.removeEventListener('mousemove', this.onResize);
        document.removeEventListener('mouseup', this.onResizeEnd);
    }
    render() {
        return (
            <div ref={e => this.container = e} style={{width: '100%', height: `${this.props.height}px`, position: 'relative'}}>
                <div className={style("bt-cell")}>{this.props.cell.caption}</div>
                <div className={style("bt-cell-bottom-border")} onMouseDown={this.onResizeStart}/>
            </div>
        );
    }
}

export default Cell;