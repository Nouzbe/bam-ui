## Table Component

### Usage

```js
import Table from 'bam-table';

render() {
  return <Table {props}/>
}
```

### Properties

* `data` - array of arrays (rows) of objects that should be represented
* `configuration` - configuration of the component
* `onChange` - data change callback
* `onConfigurationChange` - configuration change callback
* `getter` - the gettter for the cell value to display and potentially copy
* `cellRenderer` - your cell Component
* `guideStyle` - the guide style of the underlying scroller component
* `handleStyle` - the handle style of the underlying scroller component

| propName              | propType | defaultValue | isRequired |
|-----------------------|----------|--------------|------------|
| data                  | array    |              | true       |
| configuration         | object   | {}           |            |
| onChange              | func     |              |            |
| onConfigurationChange | func     |              |            |
| getter                | func     | x => x       |            |
| cellRenderer          | func     |              |            |
| guideStyle            | object   |              |            |
| handleStyle           | object   |              |            |