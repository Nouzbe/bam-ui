import React from 'react';
import _ from 'lodash';

import style from './style.js';

class ScrollBar extends React.Component {
    constructor(props) {
        super(props);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);
        this.onGuideClick = this.onGuideClick.bind(this);
        this.delegate = this.delegate.bind(this);
        
        this.state = {
            dragging: false,
            initialMouseOffset: 0,
            offset: 0,
        };
    }
    delegate(value, relative) {
        const max = relative ? 1 : (this.props.horizontal ? this.guide.offsetWidth : this.guide.offsetHeight) - this.props.handleSize;
        const limitedValue = Math.max(0, Math.min(value, max)) / max;
        this.props.onValueChange(limitedValue);
    }
    onMouseWheel(e) {
        if(!this.guide) {
            this.delegate(0, true);
            this.props.container.removeEventListener('mousewheel', this.onMouseWheel);
        }
        else if((this.props.horizontal && e.shiftKey) || (!this.props.horizontal && !e.shiftKey)) {
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
            return this.props.value * (this.guide.offsetWidth - this.props.handleSize);
        }
        return 0;
    }
    componentDidMount() {
        document.addEventListener('mousemove', this.onDrag);
        document.addEventListener('mouseup', this.onDragEnd);
        this.props.container.addEventListener('mousewheel', this.onMouseWheel);
    }
    componentWillUnmout() {
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.onDragEnd);
        this.props.container.removeEventListener('mousewheel', this.onMouseWheel);
    }
    render() {
        return (
            <div 
                className={style('bs-guide', this.props.guideStyle)} 
                style={{
                    height: this.props.horizontal ? this.props.guideHeight : `calc(100% - ${this.props.offset}px)`,
                    width: this.props.horizontal ? `calc(100% - ${this.props.offset}px)` : this.props.guideWidth,
                    position: 'relative',
                    top: (!this.props.horizontal && this.props.offset) ? this.props.offset : 0,
                    left: (this.props.horizontal && this.props.offset) ? this.props.offset : 0
                }}
                ref={elt => this.guide = elt}
                onClick={this.onGuideClick} // scroll to click offset
            >
                <div 
                    className={style('bs-handle', this.props.handleStyle)}
                    style={{
                        width: this.props.horizontal ? this.props.handleSize : '100%',
                        height: this.props.horizontal ? '100%' : this.props.handleSize,
                        position: 'absolute',
                        top: this.getTop(),
                        left: this.getLeft()
                    }}
                    onMouseDown={e => e.button === 0 ? this.onDragStart(e) : null}
                    ref={elt => this.scrollbar = elt}
                    onClick={this.preventClickPropagation} // prevent parent from scrolling to click offset
                />
            </div>
        )
    }
}

export default ScrollBar;