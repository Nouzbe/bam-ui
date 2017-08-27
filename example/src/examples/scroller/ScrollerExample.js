import React from 'react';
import Scroller from 'bam-scroller';
import {loremIpsum} from '../../data/data.js';

const red = [255, 51, 0];
const green = [51, 204, 51];
const blue = [0, 51, 204];

const mix = (arr1, arr2, factor) => arr1.map((x, i) => Math.round((1 - factor) * x + factor * arr2[i]));

const invert = arr => mix([255, 255, 255], arr.map(x => 255 - x), 0.5);

const color = arr => `rgb(${arr.join(',')})`;

class ScrollerExample extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: [].concat(red),
            scroll: 0
        };
        this.onScroll = this.onScroll.bind(this);
    }
    onScroll(value) {
        if(value < 0.5) {
            console.log(mix(red, green, 2 * value));
            this.setState({color: mix(red, green, 2 * value), scroll: value})
        }
        else {
            console.log(mix(green, blue, 2 * (value - 0.5)));
            this.setState({color: mix(green, blue, 2 * (value - 0.5)), scroll: value})
        }
    }
    render() {
        return (
            <div style={{height: '100%'}}>
                <div style={{height: 'calc(50% - 20px)', width: 'calc(100% - 20px)', float: 'left', padding: 10}}>
                    <div style={{height: 30}}>
                        <h4 style={{width: '100%', textAlign: 'center', margin: 0}}>Your scrollbars style is up to you</h4>
                    </div>
                    <div style={{height: 'calc(100% - 30px)'}}>
                        <div style={{float: 'left', width: 'calc(50% - 10px)', height: 'calc(100% - 10px)', padding: 5}}>
                            <div style={{height: '100%', width: 400, marginLeft: 'calc(50% - 200px)'}}>
                                <Scroller handleStyle={{background: '#585858', borderRadius: 5}}>
                                    <div style={{width: 500}}>
                                        {loremIpsum}
                                    </div>
                                </Scroller>
                            </div>
                        </div>
                        <div style={{float: 'left', width: 'calc(50% - 10px)', height: 'calc(100% - 10px)', width: 'calc(50% - 10px)', padding: 5}}>
                            <div style={{height: '100%', width: 400, marginLeft: 'calc(50% - 200px)'}}>
                                <Scroller guideStyle={{background: '#404040'}} handleStyle={{background: '#a0a0a0', boxSizing: 'border-box'}}>
                                    <div style={{width: 500, background: '#404040', color: 'rgb(199, 199, 199)'}}>
                                        {loremIpsum}
                                    </div>
                                </Scroller>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{height: 'calc(50% - 20px)', width: 'calc(100% - 20px)', float: 'left', padding: 10}}>
                    <div style={{float: 'left', width: 'calc(50% - 10px)', height: 'calc(100% - 10px)', padding: 5}}>
                        <div style={{height: 30}}>
                            <h4 style={{width: '100%', textAlign: 'center', margin: 0}}>Your can choose to display them only when the content is hovered.</h4>
                        </div>
                        <div style={{height: 'calc(100% - 30px)'}}>
                            <div style={{height: '100%', width: 400, marginLeft: 'calc(50% - 200px)'}}>
                                <Scroller floating guideStyle={{background: '#404040'}} handleStyle={{background: '#a0a0a0', boxSizing: 'border-box'}}>
                                    <div style={{width: 500, background: '#404040', color: 'rgb(199, 199, 199)'}}>
                                        {loremIpsum}
                                    </div>
                                </Scroller>
                            </div>
                        </div>
                    </div>
                    <div style={{float: 'left', width: 'calc(50% - 10px)', height: 'calc(100% - 10px)', padding: 5}}>
                        <div style={{height: 30}}>
                            <h4 style={{width: '100%', textAlign: 'center', margin: 0}}>You can be called back on scroll if you need to develop custom scroll behaviors.</h4>
                        </div>
                        <div style={{height: 'calc(100% - 30px)'}}>
                            <div style={{height: '100%', width: 400, marginLeft: 'calc(50% - 200px)'}}>
                                <Scroller floating guideStyle={{background: color(this.state.color)}} handleStyle={{background: '#fff', boxSizing: 'border-box'}} onVerticalScroll={this.onScroll}>
                                    <div style={{width: 400, height: 3000, background: color(this.state.color), color: '#fff', textAlign: 'center'}}>
                                        <div style={{position: 'relative', top: 200}}>Like changing a background color, what do I know ?</div>
                                        {this.state.scroll > 0.8 ? 
                                            <div style={{position: 'relative', top: 250}}>No, for real it's meant for virtual scrolling.</div>
                                            : 
                                            null
                                        }
                                    </div>
                                </Scroller>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ScrollerExample;