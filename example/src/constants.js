import ScrollerExample from './examples/scroller/ScrollerExample.js';
import TableExample from './examples/table/TableExample.js';
import SimpleTable from './examples/table/SimpleTable.js';
import BigTable from './examples/table/BigTable.js';
import EditableTable from './examples/table/EditableTable.js';
import MergedTable from './examples/table/MergedTable.js';
import StyledTable from './examples/table/StyledTable.js';

export default {
	actions: {
		addTodo: 'addTodo',
		removeTodo: 'removeTodo',
		toggleTodo: 'toggleTodo',
		setFilter: 'setFilter',
		selectTab: 'selectTab',
		addTab: 'addTab',
		removeTab: 'removeTab',
		renameTab: 'renameTab',
		goto: 'goto',
		selectComponent: 'selectComponent',
		selectTableExample: 'selectTableExample'
	},
	filters: {
		all: 'all',
		completed: 'completed',
		remaining: 'remaining'
	},
	components: {
		scroller: ScrollerExample,
		table: TableExample,
	},
	tableExamples: {
		'basic examples': SimpleTable,
		'styled examples': StyledTable,
		'edition': EditableTable,
		'merged cells': MergedTable,
		'got a lot of data ?': BigTable
	}
}