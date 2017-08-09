import React from 'react';
import style from './style.js';

class Header extends React.Component {
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
            this.props.onWidthChange(e.clientX - this.container.offsetLeft);
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
            <div 
                ref={e => this.container = e}
                className={style('bt-header-container')}
                style={{height: `${this.props.height}px`}}
            >
                <div className={style("bt-header")}>
                    {this.props.header.caption}
                </div>
                <div className={style("bt-header-right-border")} onMouseDown={this.onResizeStart}/>
            </div>
        );
    }
}

export default Header;