import React from 'react';
import Scroller from 'bam-scroller';

import loremIpsum from '../../../data/loremIpsum.js';

export default props => (
  <div style={{height: 500, width: 400}}>
    <Scroller {...props}>
      <div style={{width: 500}}>
          {loremIpsum}
      </div>
    </Scroller>
  </div>
)