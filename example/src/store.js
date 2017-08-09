import {createStore, combineReducers} from 'redux';
import _ from 'lodash';
import constants from './constants.js';

const todo = (state, action) => {
  switch(action.type) {
    case constants.actions.addTodo:
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case constants.actions.toggleTodo:
      if(state.id !== action.todoId) {
        return state;
      }
      return {
        ...state,
        completed: !state.completed
      };
    default:
      return state;
  }
};

const todos = (state, action) => {
  switch(action.type) {
    case constants.actions.addTodo:
      return [
        ...state,
        todo(undefined, action)
      ];
    case constants.actions.removeTodo:
      const idx = _.findIndex(state, {id: action.todoId});
      return [
        ...state.slice(0, idx),
        ...state.slice(idx + 1)
      ];
    case constants.actions.toggleTodo:
      return state.map(t => todo(t, action));
    default:
      return state;
  }
};

const filter = (state = constants.filters.all, action) => {
  switch(action.type) {
    case constants.actions.setFilter:
      return action.filter;
    default:
      return state;
  }
};

const tab = (state, action) => {
  switch(action.type) {
    case constants.actions.addTab:
      return {
        id: action.id,
        name: 'name me',
        selected: true,
        todos: []
      };
    case constants.actions.renameTab:
      return {
        ...state,
        name: action.name
      };
    case constants.actions.addTodo:
    case constants.actions.removeTodo:
    case constants.actions.toggleTodo:
      return {
        ...state,
        todos: todos(state.todos, action)
      };
    default:
      return state;
  }
};

const tabs = (state = {'0': {id: '0', name: 'first', todos: []}}, action) => {
  switch(action.type) {
    case constants.actions.addTab:
      return {
        ...state,
        [action.id]: tab(undefined, action)
      };
    case constants.actions.renameTab:
      return {
        ...state,
        [action.id]: tab(state[action.id], action)
      };
    case constants.actions.removeTab:
      return _.omit(state, action.id);
    case constants.actions.addTodo:
    case constants.actions.removeTodo:
    case constants.actions.toggleTodo:
      return {
        ...state, 
        [action.tabId]: tab(state[action.tabId], action)
      };
    default:
      return state;
  }
};

const selectedTab = (state = '0', action) => {
  switch(action.type) {
    case constants.actions.selectTab:
      return action.id;
    case constants.actions.removeTab:
      return action.fallbackId ? action.fallbackId : state;
    case constants.actions.addTab:
      return action.id;
    default:
      return state;
  }
};

const route = (state = window.location.pathname.substr(1), action) => {
  switch(action.type) {
    case constants.actions.goto:
      return action.route;
    default:
      return state;
  }
}

const toDoApp = combineReducers({
  tabs,
  selectedTab,
  filter,
  route
});

export default createStore(toDoApp);