import React from 'react';
import style from './style.js';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resizingWidth: false,
            resizingHeight: false,
            initialClientX: 0,
            initialWidth: 0,
            initialClientY: 0,
            initialHeight: 0
        };
        this.onResizeWidthStart = this.onResizeWidthStart.bind(this);
        this.onResizeHeightStart = this.onResizeHeightStart.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onResizeEnd = this.onResizeEnd.bind(this);
    }
    onResizeWidthStart(e) {
        this.props.onResizeWidthStart();
        this.setState({resizingWidth: true, initialClientX: e.clientX, initialWidth: this.container.offsetWidth});
    }
    onResizeHeightStart(e) {
        this.props.onResizeHeightStart();
        this.setState({resizingHeight: true, initialClientY: e.clientY, initialHeight: this.container.offsetHeight});
    }
    onResize(e) {
        if(this.state.resizingWidth) {
            this.props.onWidthChange(this.state.initialWidth + e.clientX - this.state.initialClientX);
        }
        if(this.state.resizingHeight) {
            this.props.onHeightChange(this.state.initialHeight + e.clientY - this.state.initialClientY);
        }
    }
    onResizeEnd() {
        (this.props.onResizeWidthEnd && this.state.resizingWidth) ? this.props.onResizeWidthEnd() : null;
        (this.props.onResizeHeightEnd && this.state.resizingHeight) ? this.props.onResizeHeightEnd() : null;
        this.setState({resizingHeight: false, resizingWidth: false});
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
                style={{
                    height: `${this.props.height}px`,
                    zIndex: (this.props.onWidthChange && this.props.onHeightChange) ? 5 : 3    
                }}
            >
                <div className={style("bt-header")} style={{borderRight: this.props.onWidthChange ? 'auto' : '1px solid #b3b3b3'}}>
                    {this.props.cell.caption}
                </div>
                {this.props.onHeightChange ? 
                    <div 
                        className={style("bt-header-bottom-border")}
                        onMouseDown={this.onResizeHeightStart}
                        onMouseEnter={this.props.onMouseEnterBorderBottom}
                        onMouseLeave={this.props.onMouseLeaveBorderBottom}
                    />
                :
                    null
                }
                {this.props.onWidthChange ? 
                    <div 
                        className={style("bt-header-right-border")} 
                        onMouseDown={this.onResizeWidthStart}
                        onMouseEnter={this.props.onMouseEnterBorderRight}
                        onMouseLeave={this.props.onMouseLeaveBorderRight}
                        style={{zIndex: (this.props.onWidthChange && this.props.onHeightChange) ? 6 : 4}}    
                    /> 
                : 
                    null
                }
                {this.props.highlightedBorderBottom ?
                    <div className={style('bt-cell-border-bottom')} style={{background: this.props.highlightColor}}/>
                :
                    null
                }
            </div>
        );
    }
}

export default Header;