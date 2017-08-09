import React from 'react';
import Scrollbar from './Scrollbar.js';
import {ResizeSensor} from 'css-element-queries';

class Scroller extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            verticalScrollbarHeight: 100,
            horizontalScrollbarWidth: 100,
            top: 0,
            left: 0
        };
        this.onVerticalScroll = this.onVerticalScroll.bind(this);
        this.onHorizontalScroll = this.onHorizontalScroll.bind(this);
        this.getSensitivity = this.getSensitivity.bind(this);
        this.getThickness = this.getThickness.bind(this);
        this.getVerticalScrollbarHeight = this.getVerticalScrollbarHeight.bind(this);
        this.getHorizontalScrollbarWidth = this.getHorizontalScrollbarWidth.bind(this);
        this.ref = this.ref.bind(this);
        this.refreshSizes = this.refreshSizes.bind(this);
        this.onResize = this.onResize.bind(this);
    }
    getSensitivity() {
        return this.props.sensitivity !== undefined ? this.props.sensitivity : 0.5;
    }
    getThickness() {
        return this.props.thickness || 15;
    }
    getVerticalScrollbarHeight() {
        if(this.props.virtualHeight !== undefined) {
            return 100 * Math.min(this.container.offsetHeight / this.props.contentHeight, 1)
        }
        if(this.container !== undefined && this.content !== undefined) {
            return 100 * this.container.offsetHeight / this.content.scrollHeight;
        }
        return 100;
    }
    getHorizontalScrollbarWidth() {
        if(this.props.virtualWidth !== undefined) {
            return 100 * Math.min(this.container.offsetWidth / this.props.contentWidth, 1);
        }
        if(this.container !== undefined && this.content !== undefined) {
            return 100 * this.container.offsetWidth / this.content.scrollWidth;
        }
        return 100;
    }
    onVerticalScroll(relativeScroll) {
        if(this.props.onVerticalScroll) {
            this.props.onVerticalScroll(relativeScroll);
        }
        else {
            this.setState({top: - relativeScroll * (this.content.scrollHeight - this.container.offsetHeight)});
        }
    }
    onHorizontalScroll(relativeScroll) {
        if(this.props.onHorizontalScroll) {
            this.props.onHorizontalScroll(relativeScroll);
        }
        else {
            this.setState({left: - relativeScroll * (this.content.scrollWidth - this.container.offsetWidth)});
        }
    }
    ref(elt) {
        this.container = elt;
        if(this.props.containerRef) {
            this.props.containerRef(elt);
        }
    }
    refreshSizes() {
        this.setState({
            verticalScrollbarHeight: this.getVerticalScrollbarHeight(),
            horizontalScrollbarWidth: this.getHorizontalScrollbarWidth()
        });
    }
    onResize() {
        if(this.content.scrollWidth - this.content.offsetWidth < - this.state.left) {
            this.setState({left: this.content.offsetWidth - this.content.scrollWidth});
        }
        this.refreshSizes();
        this.props.onResize ? this.props.onResize() : null;
    }
    componentDidReceiveProps() {
        this.refreshSizes();
    }
    componentDidMount() {
        this.refreshSizes();
        ResizeSensor(this.content, this.onResize);
        ResizeSensor(this.content.firstChild, this.onResize);
    }
    render() {
        const thickness = this.getThickness();
        const sensitivity = this.getSensitivity();
        const isVerticalScrollbarVisible = this.state.verticalScrollbarHeight < 100;
        const isHorizontalScrollbarVisible = this.state.horizontalScrollbarWidth < 100;
        return <div ref={this.ref} className={this.props.className} style={{height: '100%', width: '100%'}}>
            <div style={{height: isHorizontalScrollbarVisible ? `calc(100% - ${thickness}px)` : '100%', width: '100%'}}>
                <div style={{float: 'left', height: '100%', width: isVerticalScrollbarVisible ? `calc(100% - ${thickness}px)` : '100%', position: 'relative', overflow: 'hidden'}}>
                    <div ref={elt => this.content = elt} style={{position: 'relative', top: this.state.top, left: this.state.left, height: '100%', width: '100%', transition: 'top 50ms, left 50ms'}}> 
                        {this.props.children}
                    </div>
                </div>
                {isVerticalScrollbarVisible ? 
                    <Scrollbar 
                        offset={this.props.verticalOffset || 0}
                        sensitivity={sensitivity}
                        thickness={thickness}
                        onScroll={this.onVerticalScroll}
                        container={this.container}
                        size={this.state.verticalScrollbarHeight}
                        guideStyle={Object.assign(this.props.guideStyle || {}, {float: 'right'})}
                        handleStyle={this.props.handleStyle || {}}
                    /> 
                    : null
                }
            </div>
            {isHorizontalScrollbarVisible ? 
                <Scrollbar 
                    horizontal
                    offset={this.props.horizontalOffset || 0}
                    sensitivity={sensitivity}
                    thickness={thickness}
                    onScroll={this.onHorizontalScroll}
                    container={this.container}
                    size={this.state.horizontalScrollbarWidth}
                    guideStyle={this.props.guideStyle || {}}
                    handleStyle={this.props.handleStyle || {}}
                /> 
                : null
            }
        </div>
    }
}

export default Scroller;