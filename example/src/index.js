import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';

const root = document.getElementById('root');

const render = Component => {
	ReactDOM.render(
		<Component/>,
	  root
	);
};

render(App);

if (module.hot) {
  module.hot.accept('./App', () => {
    const NextApp = require('./App').default;
    ReactDOM.render(
      <NextApp />,
      root
    );
  });
}