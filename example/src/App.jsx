import React from 'react';
import {Provider} from 'react-redux';
import {Router, Route} from 'react-router';
import createHistory from 'history/createBrowserHistory';
import Table from 'bam-table';

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
    let fatData = [];
    for(let i = 0; i < factor; i++) {
      const offset = i * arr.length;
      fatData = fatData.concat(arr.map((r, idx) => [{caption: idx + offset, value: idx + offset}].concat(r)));
    }
    return fatData;
  }
  render() {
    return (
      <Table data={[header].concat(this.multiply(data))} frozenRowsCount={5} frozenColumnsCount={4}/>
    );1
  }
}

export default App;