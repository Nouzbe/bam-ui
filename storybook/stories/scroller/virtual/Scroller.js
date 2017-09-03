import React from 'react';
import Scroller from 'bam-scroller';

const red = [255, 51, 0];
const green = [51, 204, 51];
const blue = [0, 51, 204];

const mix = (arr1, arr2, factor) => arr1.map((x, i) => Math.round((1 - factor) * x + factor * arr2[i]));

const invert = arr => mix([255, 255, 255], arr.map(x => 255 - x), 0.5);

const color = arr => `rgb(${arr.join(',')})`;

class Virtual extends React.Component {
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
        this.setState({color: mix(red, green, 2 * value), scroll: value})
    }
    else {
        this.setState({color: mix(green, blue, 2 * (value - 0.5)), scroll: value})
    }
}
  render() {
    return (
      <div style={{height: 400, width: 400}}>
        <Scroller floating guideStyle={{background: color(this.state.color)}} handleStyle={{background: '#fff', boxSizing: 'border-box'}} onVerticalScroll={this.onScroll}>
          <div style={{width: '100%', height: 3000, background: color(this.state.color), color: '#fff', textAlign: 'center'}}>
              <div style={{position: 'relative', top: 200}}>Your content. And your custom scroll behavior.</div>
          </div>
        </Scroller>
      </div>
    )
  }
}

export default Virtual;