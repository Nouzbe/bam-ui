import React from 'react';
import style from './style.js';
import FloatingBorder from './FloatingBorder.js';

class Header extends React.Component {
    renderBorderBottom() {
        return <div 
            className={style("bt-header-bottom-border")}
            onMouseDown={e => e.button === 0 ? this.props.onResizeHeightStart(this.container.offsetHeight - e.clientY) : null}
            onMouseEnter={this.props.onMouseEnterBorderBottom}
            onMouseLeave={this.props.onMouseLeaveBorderBottom}
        />
    }
    renderBorderRight() {
        return <div 
            className={style("bt-header-right-border")} 
            onMouseDown={e => e.button === 0 ? this.props.onResizeWidthStart(this.container.offsetWidth - e.clientX) : null}
            onMouseEnter={this.props.onMouseEnterBorderRight}
            onMouseLeave={this.props.onMouseLeaveBorderRight}
            style={{zIndex: (this.props.onWidthResizeStart && this.props.onResizeHeightStart) ? 6 : 4}}    
        />
    }
    render() {
        const containerStyle={
            height: this.props.height, 
            zIndex: (this.props.onResizeWidthStart && this.props.onResizeHeightStart) ? 5 : 3,
            cursor: this.props.onMoveStart ? navigator.userAgent.indexOf('Chrome') !== -1 ? '-webkit-grab' : 'grab' : 'auto'
        };
        return (
            <div 
                ref={e => {
                    this.container = e;
                    if(this.props.rowRef !== undefined) {
                        this.props.rowRef(e);
                    }
                }} 
                className={style(`bt-header-container`)} 
                style={containerStyle}
            >
                <div className={style("bt-header")} onMouseDown={this.props.onMoveStart}>
                    {this.props.cell.caption}
                </div>
                {this.props.onResizeHeightStart ? this.renderBorderBottom() : null}
                {this.props.onResizeWidthStart ? this.renderBorderRight() : null}
                <FloatingBorder bottom offset={2} visible={this.props.highlightedBorderBottom} color={this.props.resizeHintColor}/>
            </div>
        );
    }
}

export default Header;