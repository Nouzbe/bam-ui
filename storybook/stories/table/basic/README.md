## Basic Example

Render a Table simply by providing your data.

```js
import Table from 'bam-table';

render() {
  return() {
    <Table
      data={[
        ['Country', 'City', 'Inhabitants', 'Size'],
        ['France', 'Paris', '2 220 445', '105,40 km2'], 
        ['UK', 'London', '8 673 713', '1 572 km2']
      ]}
      configuration={{frozenRowsCount: 1, frozenColumnsCount: 2}}
    />
  }
}
```