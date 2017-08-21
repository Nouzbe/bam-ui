import React from 'react';
import style from './style.js';
import FloatingBorder from './FloatingBorder.js';

class Header extends React.Component {
    renderBorderBottom() {
        return <div 
            className={style("bt-header-bottom-border")}
            onMouseDown={e => e.button === 0 ? this.props.onResizeHeightStart(this.props.rowIdx, this.container.offsetHeight - e.clientY) : null}
            onMouseEnter={() => this.props.onMouseEnterBorderBottom(this.props.rowIdx)}
            onMouseLeave={() => this.props.onMouseLeaveBorderBottom(this.props.rowIdx)}
        />
    }
    renderBorderRight() {
        return <div 
            className={style("bt-header-right-border")} 
            onMouseDown={e => e.button === 0 ? this.props.onResizeWidthStart(this.container.offsetWidth - e.clientX) : null}
            onMouseEnter={() => this.props.onMouseEnterBorderRight(this.props.rowIdx)}
            onMouseLeave={() => this.props.onMouseLeaveBorderRight(this.props.rowIdx)}
            style={{zIndex: (this.props.onWidthResizeStart && this.props.onResizeHeightStart) ? 6 : 4}}    
        />
    }
    render() {
        const containerStyle={
            height: this.props.height, 
            zIndex: (this.props.onResizeWidthStart && this.props.onResizeHeightStart) ? 5 : 3,
            cursor: this.props.onMoveStart ? navigator.userAgent.indexOf('Chrome') !== -1 ? '-webkit-grab' : 'grab' : 'auto',
            background: this.props.isSelected ? '#d3d3d3': '#e6e6e6'
        };
        return (
            <div 
                ref={e => {
                    this.container = e;
                    if(this.props.rowRef !== undefined) {
                        this.props.rowRef(this.props.rowIdx, e);
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