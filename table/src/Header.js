import React from 'react';
import style from './style.js';
import FloatingBorder from './FloatingBorder.js';

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
            this.props.onWidthChange(Math.max(1, this.state.initialWidth + e.clientX - this.state.initialClientX));
        }
        if(this.state.resizingHeight) {
            this.props.onHeightChange(Math.max(1, this.state.initialHeight + e.clientY - this.state.initialClientY));
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
    renderBorderBottom() {
        return <div 
            className={style("bt-header-bottom-border")}
            onMouseDown={this.onResizeHeightStart}
            onMouseEnter={this.props.onMouseEnterBorderBottom}
            onMouseLeave={this.props.onMouseLeaveBorderBottom}
        />
    }
    renderBorderRight() {
        return <div 
            className={style("bt-header-right-border")} 
            onMouseDown={this.onResizeWidthStart}
            onMouseEnter={this.props.onMouseEnterBorderRight}
            onMouseLeave={this.props.onMouseLeaveBorderRight}
            style={{zIndex: (this.props.onWidthChange && this.props.onHeightChange) ? 6 : 4}}    
        />
    }
    render() {
        const containerStyle={height: this.props.height, zIndex: (this.props.onWidthChange && this.props.onHeightChange) ? 5 : 3};
        return (
            <div ref={e => this.container = e} className={style('bt-header-container')} style={containerStyle}>
                <div className={style("bt-header")}>
                    {this.props.cell.caption}
                </div>
                {this.props.onHeightChange ? this.renderBorderBottom() : null}
                {this.props.onWidthChange ? this.renderBorderRight() : null}
                <FloatingBorder horizontal visible={this.props.highlightedBorderBottom} color={this.props.highlightColor}/>
            </div>
        );
    }
}

export default Header;