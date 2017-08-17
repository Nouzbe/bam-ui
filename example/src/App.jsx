import React from 'react';
import {Provider} from 'react-redux';
import {Router, Route} from 'react-router';
import createHistory from 'history/createBrowserHistory';
import Table from 'bam-table';
import Scroller from 'bam-scroller';

import store from './store.js';
import actions from './actions.js';

import {data, header} from './data/data.js';

const history = createHistory();
history.listen((location, action) => {
  const route = location.pathname.substr(1);
  store.dispatch(actions.goto(route));
});

const factor = 1000;

class App extends React.Component {
  multiply(arr) {
    let arrays = Array.apply(null, new Array(factor));
    arrays = arrays.map((a, i) => arr.map((r, j) => [{caption: i * arr.length + j}].concat(r)));
    return [].concat.apply([], arrays);
  }
  render() {
    return (
      <Table data={[header].concat(this.multiply(data))} frozenRowsCount={3} frozenColumnsCount={2}/>
    );
  }
}

export default App;

/*
<Scroller floating>
        <div style={{width: 1000}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac tellus diam. Fusce sed elementum ipsum, id pharetra turpis. Sed non metus hendrerit orci placerat auctor eget quis odio. Praesent hendrerit tempus malesuada. Nunc rutrum sapien a massa tincidunt, ut mollis lacus gravida. Sed dolor eros, congue non nunc eget, convallis rutrum eros. Quisque id dolor in ligula tincidunt commodo. Nunc eu justo imperdiet, viverra nunc ut, efficitur ligula. Phasellus tempus, mauris et porttitor vulputate, odio nisl viverra erat, sit amet ultrices odio sem vel velit. Cras at vestibulum ante, vitae consectetur turpis. Morbi ornare, risus vitae sagittis accumsan, justo lectus ornare nisi, sagittis pharetra ligula risus in diam. Donec eget nisi sollicitudin, pulvinar lorem a, ullamcorper massa. Aenean sed ullamcorper ipsum. Etiam in nunc dignissim justo scelerisque sodales.

Duis non purus ac ante vulputate facilisis et at ipsum. Suspendisse volutpat, mauris sit amet eleifend varius, lorem lectus rutrum purus, vitae sodales nulla felis eu massa. Duis tincidunt mi a vehicula tempus. Etiam id ex faucibus, porta eros vulputate, luctus quam. Aliquam ultricies iaculis iaculis. In sit amet tincidunt nibh. Praesent malesuada, odio eget gravida dictum, erat eros rutrum augue, ut consectetur nibh elit at dui. Duis at sagittis turpis. Duis in tristique nisl, sed pretium ligula. Praesent dictum odio nibh, ac dapibus enim sagittis sit amet. Aliquam fermentum tempus leo, nec ultricies erat bibendum quis. Etiam diam mauris, scelerisque nec ullamcorper vel, pharetra in diam.

Suspendisse potenti. Etiam vestibulum hendrerit faucibus. Quisque dictum convallis libero, et pulvinar nisl sodales id. Duis vel eros semper, dignissim metus ut, ornare orci. Quisque et urna nec nunc viverra feugiat. Aliquam rutrum purus sed mauris cursus, at viverra nisl accumsan. Curabitur pharetra pulvinar turpis, eu luctus diam lacinia ut. Ut laoreet nulla sit amet luctus tincidunt. Interdum et malesuada fames ac ante ipsum primis in faucibus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus molestie blandit justo nec maximus.

Donec ac efficitur quam. Donec venenatis turpis orci, sit amet tempus nisi dignissim fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Cras id faucibus quam. Cras eleifend convallis mi sit amet feugiat. Ut dui erat, mollis id consequat vel, hendrerit eu nunc. Donec blandit dolor a est ultrices malesuada. Suspendisse ut maximus metus.
      </div></Scroller>
*/