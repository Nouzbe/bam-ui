import React from 'react';
import style from './style.js';
import FloatingBorder from './FloatingBorder.js';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            resizingWidth: false,
            resizingHeight: false,
            movingColumn: false,
            initialClientX: 0,
            initialWidth: 0,
            initialClientY: 0,
            initialHeight: 0
        };
        this.onResizeWidthStart = this.onResizeWidthStart.bind(this);
        this.onResizeHeightStart = this.onResizeHeightStart.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onColumnMoveStart = this.onColumnMoveStart.bind(this);
    }
    onResizeWidthStart(e) {
        this.props.onResizeWidthStart();
        this.setState({resizingWidth: true, initialClientX: e.clientX, initialWidth: this.container.offsetWidth});
    }
    onResizeHeightStart(e) {
        this.props.onResizeHeightStart();
        this.setState({resizingHeight: true, initialClientY: e.clientY, initialHeight: this.container.offsetHeight});
    }
    onMouseMove(e) {
        if(this.state.resizingWidth) {
            this.props.onWidthChange(Math.max(1, this.state.initialWidth + e.clientX - this.state.initialClientX));
        }
        if(this.state.resizingHeight) {
            this.props.onHeightChange(Math.max(1, this.state.initialHeight + e.clientY - this.state.initialClientY));
        }
        if(this.state.movingColumn) {
            this.props.onColumnMove(e.clientX);
        }
    }
    onMouseUp() {
        (this.props.onResizeWidthEnd && this.state.resizingWidth) ? this.props.onResizeWidthEnd() : null;
        (this.props.onResizeHeightEnd && this.state.resizingHeight) ? this.props.onResizeHeightEnd() : null;
        (this.props.onColumnMoveEnd && this.state.movingColumn) ? this.props.onColumnMoveEnd() : null;
        this.setState({resizingHeight: false, resizingWidth: false, movingColumn: false});
    }
    onColumnMoveStart() {
        this.setState({movingColumn: true});
        this.props.onColumnMoveStart();
    }
    componentDidMount() {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }
    componentWillUnmount() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
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
        const containerStyle={
            height: this.props.height, 
            zIndex: (this.props.onWidthChange && this.props.onHeightChange) ? 5 : 3,
            cursor: this.props.onColumnMove ? navigator.userAgent.indexOf('Chrome') !== -1 ? '-webkit-grab' : 'grab' : 'auto'
        };
        return (
            <div ref={e => this.container = e} className={style(`bt-header-container`)} style={containerStyle}>
                <div className={style("bt-header")} onMouseDown={this.props.onColumnMove ? this.onColumnMoveStart : undefined}>
                    {this.props.cell.caption}
                </div>
                {this.props.onHeightChange ? this.renderBorderBottom() : null}
                {this.props.onWidthChange ? this.renderBorderRight() : null}
                <FloatingBorder horizontal visible={this.props.highlightedBorderBottom} color={this.props.resizeHintColor}/>
            </div>
        );
    }
}

export default Header;