import constants from './constants.js';

let nextTabId = 1;
let nextTodoId = 0;

const setFilter = filter => {
	return {
		type: constants.actions.setFilter,
		filter
	};
};

const addTodo = (tabId, text) => {
  return {
    type: constants.actions.addTodo,
    text: text,
    id: nextTodoId++,
    tabId
  };
};

const toggleTodo = (tabId, todoId) => {
  return {
    type: constants.actions.toggleTodo,
    tabId,
    todoId
  };
};

const removeTodo = (tabId, todoId) => {
  return {
    type: constants.actions.removeTodo,
    tabId,
    todoId,
  }
};

const addTab = () => {
  return {
    type: constants.actions.addTab,
    id: '' + nextTabId++
  };
};

const selectComponent = name => {
  return {
    type: constants.actions.selectComponent,
    name
  }
};

const selectTableExample = name => {
  return {
    type: constants.actions.selectTableExample,
    name
  }
};

const selectTab = id => {
  return {
    type: constants.actions.selectTab,
    id
  };
};

const removeTab = (id, fallbackId) => {
  return {
    type: constants.actions.removeTab,
    id,
    fallbackId
  };
};

const renameTab = (id, name) => {
  return {
    type: constants.actions.renameTab,
    id,
    name
  };
};

const goto = route => {
  return {
    type: constants.actions.goto,
    route: route
  }
};

export default {
	setFilter,
	addTodo,
	toggleTodo,
  removeTodo,
  addTab,
  selectTab,
  removeTab,
  renameTab,
  goto,
  selectComponent,
  selectTableExample
}