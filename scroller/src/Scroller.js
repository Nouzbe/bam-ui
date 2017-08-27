import React from 'react';
import Scrollbar from './Scrollbar.js';
import style from './style.js';
import {ResizeSensor} from 'css-element-queries';

const minHandleSize = 5;

class Scroller extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            verticalHandleHeight: 100,
            horizontalHandleWidth: 100,
            verticalScroll: 0,
            top: 0,
            left: 0,
            horizontalScroll: 0,
            hoveringContent: false
        };
        this.onVerticalScroll = this.onVerticalScroll.bind(this);
        this.onHorizontalScroll = this.onHorizontalScroll.bind(this);
        this.getVerticalSensitivity = this.getVerticalSensitivity.bind(this);
        this.getHorizontalSensitivity = this.getHorizontalSensitivity.bind(this);
        this.getThickness = this.getThickness.bind(this);
        this.getVerticalHandleHeight = this.getVerticalHandleHeight.bind(this);
        this.getHorizontalHandleWidth = this.getHorizontalHandleWidth.bind(this);
        this.ref = this.ref.bind(this);
        this.refreshSizes = this.refreshSizes.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onMouseEnterContent = this.onMouseEnterContent.bind(this);
        this.onMouseLeaveContent = this.onMouseLeaveContent.bind(this);
    }
    onMouseEnterContent() {
        this.setState({hoveringContent: true});
    }
    onMouseLeaveContent() {
        this.setState({hoveringContent: false});
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
            return 100 * Math.min(this.container.offsetHeight / this.props.virtualHeight, 1)
        }
        if(this.container !== undefined && this.content !== undefined) {
            return 100 * this.container.offsetHeight / this.content.scrollHeight;
        }
        return 100;
    }
    getHorizontalHandleWidth() {
        if(this.props.virtualWidth !== undefined) {
            return 100 * Math.min(this.container.offsetWidth / this.props.virtualWidth, 1);
        }
        if(this.container !== undefined && this.content !== undefined) {
            return 100 * this.container.offsetWidth / this.content.scrollWidth;
        }
        return 100;
    }
    onVerticalScroll(value) {
        const top = (!this.props.onVerticalScroll && this.content) ? - value * (this.content.scrollHeight - this.container.offsetHeight) : 0;
        this.setState({
            verticalScroll: value,
            top
        }, () => this.props.onVerticalScroll ? this.props.onVerticalScroll(value) : null);
    }
    onHorizontalScroll(value) {
        const left = ((!this.props.onHorizontalScroll || this.props.handleHorizontal) && this.content) ? - value * (this.content.scrollWidth - this.container.offsetWidth) : 0;
        this.setState({
            horizontalScroll: value,
            left
        }, () => this.props.onHorizontalScroll ? this.props.onHorizontalScroll(value) : null);
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
        const requiredWidth = this.props.virtualWidth || this.content.scrollWidth;
        const availableWidth = this.container.offsetWidth;
        if(availableWidth >= requiredWidth) {
            this.state.horizontalScroll !== 0 ? this.onHorizontalScroll(0) : null;
        }
        else if(availableWidth - this.state.left > requiredWidth) {
            this.onHorizontalScroll(1);
        }
        else if(this.props.onHorizontalScroll) {
            this.props.onHorizontalScroll(this.state.horizontalScroll);
        }
        const requiredHeight = this.props.virtualHeight || this.content.scrollHeight;
        const availableHeight = this.container.offsetHeight;
        if(availableHeight >= requiredHeight) {
            this.state.verticalScroll !== 0 ? this.onVerticalScroll(0) : null;
        }
        else if(availableHeight - this.state.top > requiredHeight) {
            this.onVerticalScroll(1);
        }
        else if(this.props.onVerticalScroll) {
            this.props.onVerticalScroll(this.state.verticalScroll);
        }
        this.refreshSizes();
    }
    componentWillReceiveProps(nextProps) {
        if(nextProps.virtualHeight !== this.props.virtualHeight || nextProps.virtualWidth !== this.props.virtualWidth) {
            this.onResize();
        }
        if(nextProps.verticalScroll !== this.props.verticalScroll) {
            this.onVerticalScroll(Math.max(0, Math.min(1, nextProps.verticalScroll)));
        }
        if(nextProps.horizontalScroll !== this.props.horizontalScroll) {
            this.onHorizontalScroll(Math.max(0, Math.min(1, nextProps.horizontalScroll)));
        }
    } 
    componentDidMount() {
        this.refreshSizes();
        ResizeSensor(this.container, this.onResize);
        ResizeSensor(this.content.firstChild, this.onResize);
    }
    render() {
        const thickness = this.getThickness();
        const isVerticalScrollbarVisible = this.state.verticalHandleHeight < 100;
        const isHorizontalScrollbarVisible = this.state.horizontalHandleWidth < 100;
        return <div ref={elt => this.container = elt} className={this.props.className} style={{height: '100%', width: '100%', overflow: 'hidden'}} onMouseEnter={this.onMouseEnterContent} onMouseLeave={this.onMouseLeaveContent}>
            <div style={{height: this.props.floating ? '100%' : isHorizontalScrollbarVisible ? `calc(100% - ${thickness}px)` : '100%', width: '100%'}}>
                <div className={style('bs-container')} style={{width: this.props.floating ? '100%' : isVerticalScrollbarVisible ? `calc(100% - ${thickness}px)` : '100%'}}>
                    <div ref={this.ref} className={style('bs-content')} style={{top: this.state.top, left: this.state.left}}> 
                        {(this.props.children && this.props.children.type !== undefined) ? this.props.children : <div>{this.props.children}</div>}
                    </div>
                </div>
                {this.container !== undefined ? <Scrollbar 
                    sensitivity={this.getVerticalSensitivity()}
                    guideWidth={thickness}
                    container={this.container}
                    handleSize={Math.max(minHandleSize, this.state.verticalHandleHeight) * this.container.offsetHeight / 100}
                    guideStyle={Object.assign(this.props.guideStyle || {}, {float: 'left'})}
                    handleStyle={this.props.handleStyle || {}}
                    value={this.state.verticalScroll}
                    onValueChange={this.onVerticalScroll}
                    floating={this.props.floating}
                    hoveringContent={this.state.hoveringContent || this.props.forceVisible}
                    visible={isVerticalScrollbarVisible}
                    extraWheelElements={this.props.extraWheelElements}
                /> : null}
                
            </div>
            {this.container !== undefined ? <Scrollbar 
                horizontal
                sensitivity={this.getHorizontalSensitivity()}
                guideHeight={thickness}
                container={this.container}
                handleSize={Math.max(minHandleSize, this.state.horizontalHandleWidth) * (this.container.offsetWidth - thickness) / 100}
                guideStyle={this.props.guideStyle || {}}
                handleStyle={this.props.handleStyle || {}}
                value={this.state.horizontalScroll}
                onValueChange={this.onHorizontalScroll}
                floating={this.props.floating}
                hoveringContent={this.state.hoveringContent || this.props.forceVisible}
                visible={isHorizontalScrollbarVisible}
                extraWheelElements={this.props.extraWheelElements}
            /> : null}
        </div>
    }
}

export default Scroller;