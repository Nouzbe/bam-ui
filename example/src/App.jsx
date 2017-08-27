import React from 'react';
import {Provider, connect} from 'react-redux';
import {Router, Route} from 'react-router';
import createHistory from 'history/createBrowserHistory';
import Table from 'bam-table';
import Scroller from 'bam-scroller';
import List from './List.js';
import Detail from './Detail.js';

import store from './store.js';
import actions from './actions.js';

import {pivotData, pivotHeader, simplerHeader, simplerData} from './data/data.js';

const history = createHistory();
history.listen((location, action) => {
  const route = location.pathname.substr(1);
  store.dispatch(actions.goto(route));
});

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <div style={{height: '100%'}}>
          <List />
          <Detail />
        </div>
      </Provider>
    );
  }
}

export default App;

/*

<div style={{height: '100%', width: 1000, marginLeft: 'calc(50% - 500px)', background: '#fff', boxShadow: '0px 0px 2px #888888', overflow: 'hidden'}}>
          <Scroller floating>
            <h2 style={{width: 'calc(100% - 20px)', textAlign: 'center', margin: 0, padding: 10}}>UI Experiments</h2>
            <h4 style={{margin: 10, marginLeft: 20}}>Table</h4>
            <div className="example" style={{height: 100}}>
              <Table 
                header={['Country', 'City', 'Inhabitants', 'Size']}
                data={[['France', 'Paris', '2 220 445', '105,40 km2'], ['UK', 'London', '8 673 713', '1 572 km2']]}/>
            </div>
            <div className="example" style={{height: 150}}>
              <p>It's possible to freeze rows</p>
              <Table 
                header={['Country', 'City', 'Inhabitants', 'Size']} 
                data={[['France', 'Paris', '2 220 445', '105,40 km2'], ['UK', 'London', '8 673 713', '1 572 km2']]}
                configuration={{frozenRowsCount: 1}}/>
            </div>
            <div className="example" style={{height: 150}}>
              <p>... and columns too</p>
              <Table 
                header={['Country', 'City', 'Inhabitants', 'Size']} 
                data={[['France', 'Paris', '2 220 445', '105,40 km2'], ['UK', 'London', '8 673 713', '1 572 km2']]}
                configuration={{frozenRowsCount: 1, frozenColumnsCount: 2}}/>
            </div>
            <div className="example" style={{marginBottom: 20}}>
              <p>Having <b>a lot</b> of rows is not a problem</p>
              <Table 
                header={['#'].concat(simplerHeader)} 
                data={this.state.data}
                configuration={{frozenRowsCount: 1, frozenColumnsCount: 2}}/>
            </div>
            <div className="example" style={{marginBottom: 20}}>
              <p>Actually while your at it, you can also have <b>a lot</b> of columns</p>
              <Table 
                header={['#'].concat(this.multiplyRow(simplerHeader))} 
                data={this.state.longData}
                configuration={{frozenRowsCount: 1, frozenColumnsCount: 2}}/>
            </div>
            <div className="example" style={{marginBottom: 20}}>
              <p>Tree-like data structures can be displayed</p>
              <Table 
                header={pivotHeader} 
                data={pivotData}
                configuration={{frozenRowsCount: 1, frozenColumnsCount: 2, columns: {0: {merged: true}, 1: {merged: true}}}}/>
            </div>
            <div style={{width: '100%', height: 50}} />
          </Scroller>
        </div>
*/