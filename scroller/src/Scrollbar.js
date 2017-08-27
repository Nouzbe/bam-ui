import React from 'react';

import style from './style.js';

class ScrollBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoveringHandle: false,
            dragging: false,
            initialMouseOffset: 0,
            hovering: false
        };
        this.onDragStart = this.onDragStart.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        this.onGuideClick = this.onGuideClick.bind(this);
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.delegate = this.delegate.bind(this);
    }
    onMouseEnter() {
        this.setState({hoveringHandle: true});
    }
    onMouseLeave() {
        this.setState({hoveringHandle: false});
    }
    delegate(value, relative) {
        const max = relative ? 1 : (this.props.horizontal ? this.guide.offsetWidth : this.guide.offsetHeight) - this.props.handleSize;
        const limitedValue = Math.max(0, Math.min(value, max)) / max;
        this.props.onValueChange(limitedValue);
    }
    onMouseWheel(e) {
        if(!this.guide) {
            this.delegate(0, true);
            this.props.container.removeEventListener('wheel', this.onMouseWheel);
        }
        else if(((this.props.horizontal && e.shiftKey) || (!this.props.horizontal && !e.shiftKey)) && this.props.visible) {
            e.stopPropagation();
            e.preventDefault();
            const value =  this.props.value + this.props.sensitivity * e.deltaY;
            this.delegate(value, true);
        }
    }
    getMouseOffset(e) {
        return this.props.horizontal ? (e.clientX - e.target.offsetLeft) : (e.clientY - e.target.offsetTop);
    }
    onDragStart(e) { 
        this.setState({dragging: true, initialMouseOffset: this.getMouseOffset(e)});
        document.getElementsByTagName('body')[0].style.userSelect = 'none';
        document.getElementsByTagName('body')[0].style['-moz-user-select'] = 'none';
        document.getElementsByTagName('body')[0].style['-webkit-user-select'] = 'none';
        document.getElementsByTagName('body')[0].style['-ms-user-select'] = 'none';
    }
    onDrag(e) {
        if(this.state.dragging) {
            const value = (this.props.horizontal ? e.clientX : e.clientY) - this.state.initialMouseOffset;
            this.delegate(value);
        }
    }
    onDragEnd(e) {
        if(this.state.dragging) {
            this.setState({dragging: false});
            document.getElementsByTagName('body')[0].style.userSelect = 'auto';
            document.getElementsByTagName('body')[0].style['-moz-user-select'] = 'auto';
            document.getElementsByTagName('body')[0].style['-webkit-user-select'] = 'auto';
            document.getElementsByTagName('body')[0].style['-ms-user-select'] = 'auto';
        }
    }
    onGuideClick(e) {
        const value = this.getMouseOffset(e) - this.props.handleSize / 2;
        this.delegate(value);
    }
    preventClickPropagation(e) {
        e.stopPropagation();
    }
    getTop() {
        if(this.guide && !this.props.horizontal) {
            return this.props.value * (this.guide.offsetHeight - this.props.handleSize);
        }
        return 0;
    }
    getLeft() {
        if(this.guide && this.props.horizontal) {
            return this.props.value * (this.guide.offsetWidth - this.props.handleSize - this.props.guideHeight);
        }
        return 0;
    }
    getOpacity() {
        if(!this.props.visible) return 0;
        if(!this.props.floating) return 1;
        if(this.state.dragging) return 0.9;
        if(this.state.hoveringHandle) return 0.7;
        if(this.props.hoveringContent) return 0.6;
        return 0;
    }
    componentDidMount() {
        document.addEventListener('mousemove', this.onDrag);
        document.addEventListener('mouseup', this.onDragEnd);
        this.props.container.addEventListener('wheel', this.onMouseWheel);
        (this.props.extraWheelElements || []).map(elt => elt.addEventListener('mousewheel', this.onMouseWheel));
    }
    componentWillUnmout() {
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.onDragEnd);
        this.props.container.removeEventListener('wheel', this.onMouseWheel);
        (this.props.extraWheelElements || []).map(elt => elt.removeEventListener('mousewheel', this.onMouseWheel));
    }
    render() {
        return (
            <div 
                className={style(`bs-guide${this.props.floating ? '-floating' : ''}`)} 
                style={Object.assign({
                    height: this.props.horizontal ? this.props.guideHeight : `100%`,
                    width: this.props.horizontal ? `100%` : this.props.guideWidth,
                    bottom: this.props.horizontal ? 0 : 'initial',
                    right: this.props.horizontal ? 'initial' : 0,
                    opacity: this.getOpacity()
                }, this.props.guideStyle || {})}
                ref={elt => this.guide = elt}
                onClick={this.onGuideClick} // scroll to click offset
                onMouseEnter={this.props.onMouseEnter}
                onMouseLeave={this.props.onMouseLeave}
            >
                <div 
                    className={style('bs-handle')}
                    style={Object.assign({
                        width: this.props.horizontal ? this.props.handleSize : '100%',
                        height: this.props.horizontal ? '100%' : this.props.handleSize,
                        top: this.getTop(),
                        left: this.getLeft()
                    }, this.props.handleStyle ||{})}
                    onMouseDown={e => e.button === 0 ? this.onDragStart(e) : null}
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave}
                    ref={elt => this.scrollbar = elt}
                    onClick={this.preventClickPropagation} // prevent parent from scrolling to click offset
                />
            </div>
        )
    }
}

export default ScrollBar;