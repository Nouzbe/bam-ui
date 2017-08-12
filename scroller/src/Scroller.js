import React from 'react';
import Scrollbar from './Scrollbar.js';
import {ResizeSensor} from 'css-element-queries';

const minHandleSize = 5;

class Scroller extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            verticalHandleHeight: 100,
            horizontalHandleWidth: 100,
            verticalScroll: 0,
            horizontalScroll: 0
        };
        this.onVerticalScroll = this.onVerticalScroll.bind(this);
        this.onHorizontalScroll = this.onHorizontalScroll.bind(this);
        this.getVerticalSensitivity = this.getVerticalSensitivity.bind(this);
        this.getHorizontalSensitivity = this.getHorizontalSensitivity.bind(this);
        this.getThickness = this.getThickness.bind(this);
        this.getVerticalHandleHeight = this.getVerticalHandleHeight.bind(this);
        this.getHorizontalHandleWidth = this.getHorizontalHandleWidth.bind(this);
        this.getTop = this.getTop.bind(this);
        this.getLeft = this.getLeft.bind(this);
        this.ref = this.ref.bind(this);
        this.refreshSizes = this.refreshSizes.bind(this);
        this.onResize = this.onResize.bind(this);
    }
    getVerticalSensitivity() {
        const factor = this.props.sensitivity !== undefined ? this.props.sensitivity : 1;
        const sizeRate = (this.container && this.content) ? this.container.offsetHeight / (this.props.virtualHeight || this.content.scrollHeight) : 1;
        return factor * sizeRate / 2000;
    }
    getHorizontalSensitivity() {
        const factor = this.props.sensitivity !== undefined ? this.props.sensitivity : 1;
        const sizeRate = (this.container && this.content) ? this.container.offsetWidth / (this.props.virtualWidth || this.content.scrollWidth) : 1;
        return factor * sizeRate / 2000;
    }
    getThickness() {
        return this.props.thickness || 15;
    }
    getVerticalHandleHeight() {
        if(this.props.virtualHeight !== undefined) {
            return 100 * Math.min((this.container.offsetHeight - this.props.verticalOffset) / this.props.virtualHeight, 1)
        }
        if(this.container !== undefined && this.content !== undefined) {
            return 100 * (this.container.offsetHeight - this.props.verticalOffset) / this.content.scrollHeight;
        }
        return 100;
    }
    getHorizontalHandleWidth() {
        if(this.props.virtualWidth !== undefined) {
            return 100 * Math.min((this.container.offsetWidth - this.props.horizontalOffset) / this.props.virtualWidth, 1);
        }
        if(this.container !== undefined && this.content !== undefined) {
            return 100 * (this.container.offsetWidth - this.props.horizontalOffset) / this.content.scrollWidth;
        }
        return 100;
    }
    getTop() {
        if(!this.props.onVerticalScroll && this.content) {
            return - this.state.verticalScroll * (this.content.scrollHeight - this.content.offsetHeight);
        }
        return 0;
    }
    getLeft() {
        if(!this.props.onHorizontalScroll && this.content) {
            return - this.state.horizontalScroll * (this.content.scrollWidth - this.content.offsetWidth);
        }
        return 0;
    }
    onVerticalScroll(value) {
        this.setState({verticalScroll: value});
        this.props.onVerticalScroll ? this.props.onVerticalScroll(value) : null;
    }
    onHorizontalScroll(value) {
        this.setState({horizontalScroll: value});
        this.props.onHorizontalScroll ? this.props.onHorizontalScroll(value) : null;
    }
    ref(elt) {
        this.content = elt;
        if(this.props.containerRef) {
            this.props.containerRef(elt);
        }
    }
    refreshSizes() {
        this.setState({
            verticalHandleHeight: this.getVerticalHandleHeight(),
            horizontalHandleWidth: this.getHorizontalHandleWidth()
        });
    }
    onResize() {
        const totalWidth = Math.max(this.props.virtualWidth || this.content.scrollWidth, this.content.scrollWidth);
        if(totalWidth - this.content.offsetWidth < this.state.horizontalScroll * totalWidth) {
            this.onHorizontalScroll((totalWidth - this.content.offsetWidth) / totalWidth);
        }
        const totalHeight = Math.max(this.props.virtualHeight || this.content.scrollHeight, this.content.scrollHeight);
        if(totalHeight - this.content.offsetHeight < this.state.verticalScroll * totalHeight) {
            this.onVerticalScroll((totalHeight - this.content.offsetHeight) / totalHeight);
        }
        this.refreshSizes();
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.virtualHeight !== this.props.virtualHeight || nextProps.virtualWidth !== this.props.virtualWidth) {
            this.refreshSizes();
        }
    } 
    componentDidMount() {
        this.refreshSizes();
        ResizeSensor(this.content, this.onResize);
        ResizeSensor(this.content.firstChild, this.onResize);
    }
    render() {
        const thickness = this.getThickness();
        const isVerticalScrollbarVisible = this.state.verticalHandleHeight < 100;
        const isHorizontalScrollbarVisible = this.state.horizontalHandleWidth < 100;
        return <div ref={elt => this.container = elt} className={this.props.className} style={{height: '100%', width: '100%'}}>
            <div style={{height: isHorizontalScrollbarVisible ? `calc(100% - ${thickness}px)` : '100%', width: '100%'}}>
                <div style={{float: 'left', height: '100%', width: isVerticalScrollbarVisible ? `calc(100% - ${thickness}px)` : '100%', position: 'relative', overflow: 'hidden'}}>
                    <div 
                        ref={this.ref} 
                        style={{
                                position: 'relative', 
                                top: this.getTop(), 
                                left: this.getLeft(), 
                                height: '100%', 
                                width: '100%', 
                                transition: 'top 50ms, left 50ms'
                            }}
                        > 
                        {this.props.children}
                    </div>
                </div>
                {isVerticalScrollbarVisible ? 
                    <Scrollbar 
                        offset={this.props.verticalOffset || 0}
                        sensitivity={this.getVerticalSensitivity()}
                        guideWidth={thickness}
                        container={this.container}
                        handleSize={Math.max(minHandleSize, this.state.verticalHandleHeight) * this.container.offsetHeight / 100}
                        guideStyle={Object.assign(this.props.guideStyle || {}, {float: 'left'})}
                        handleStyle={this.props.handleStyle || {}}
                        value={this.state.verticalScroll}
                        onValueChange={this.onVerticalScroll}
                    /> 
                    : null
                }
            </div>
            {isHorizontalScrollbarVisible ? 
                <Scrollbar 
                    horizontal
                    offset={this.props.horizontalOffset || 0}
                    sensitivity={this.getHorizontalSensitivity()}
                    guideHeight={thickness}
                    container={this.container}
                    handleSize={Math.max(minHandleSize, this.state.horizontalHandleWidth) * this.container.offsetWidth / 100}
                    guideStyle={this.props.guideStyle || {}}
                    handleStyle={this.props.handleStyle || {}}
                    value={this.state.horizontalScroll}
                    onValueChange={this.onHorizontalScroll}
                /> 
                : null
            }
        </div>
    }
}

export default Scroller;