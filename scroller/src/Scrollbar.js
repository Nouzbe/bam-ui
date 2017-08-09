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
        this.set = this.set.bind(this);
        this.limit = this.limit.bind(this);
        this.onGuideClick = this.onGuideClick.bind(this);
        
        this.state = {
            dragging: false,
            initialMouseOffset: 0,
            offset: 0,
            size: this.getSize(props.size)
        };
    }
    getSize(size) {
        return Math.max(size, 5); // the scrollbar should not be smaller than 5% of the container
    }
    limit(offset) {
        const max = (this.props.horizontal ? this.guide.offsetWidth : this.guide.offsetHeight) * (1 - this.getSize(this.props.size) / 100);
        return [Math.min(Math.max(offset, 0), max), max]
    }
    set(offset, max) {
        this.setState({offset});
        this.props.onScroll(offset / max);
    }
    onMouseWheel(e) {
        if(!this.guide) {
            this.props.container.removeEventListener('mousewheel', this.onMouseWheel);
        }
        else if((this.props.horizontal && e.shiftKey) || (!this.props.horizontal && !e.shiftKey)) {
            const newOffset =  this.state.offset + this.props.sensitivity * e.deltaY * this.getSize(this.props.size) / 100;
            this.set(...this.limit(newOffset));
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
            const newOffset = (this.props.horizontal ? e.clientX : e.clientY) - this.state.initialMouseOffset;
            this.set(...this.limit(newOffset));
        }
    }
    onDragEnd(e) {
        if(this.state.dragging) {
            this.setState({dragging: false});
            document.getElementsByTagName('body')[0].style.userSelect = 'auto';
        }
    }
    onGuideClick(e) {
        const newOffset = this.getMouseOffset(e) - this.getSize(this.props.size) / 2;
        this.set(...this.limit(newOffset));
    }
    preventClickPropagation(e) {
        e.stopPropagation();
    }
    componentDidReceiveProps(newProps) {
        this.setState({size: this.getSize(newProps.size)});
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
                    height: this.props.horizontal ? this.props.thickness : `calc(100% - ${this.props.offset}px)`,
                    width: this.props.horizontal ? `calc(100% - ${this.props.offset}px)` : this.props.thickness,
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
                        width: this.props.horizontal ? `${this.getSize(this.props.size)}%` : '100%',
                        height: this.props.horizontal ? '100%' : `${this.getSize(this.props.size)}%`,
                        position: 'absolute',
                        top: this.props.horizontal ? 0 : `${this.state.offset}px`,
                        left: this.props.horizontal ? `${this.state.offset}px` : 0
                    }}
                    onMouseDown={this.onDragStart}
                    ref={elt => this.scrollbar = elt}
                    onClick={this.preventClickPropagation} // prevent parent from scrolling to click offset
                />
            </div>
        )
    }
}

export default ScrollBar;