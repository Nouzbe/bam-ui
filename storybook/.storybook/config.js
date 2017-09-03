import { configure } from '@storybook/react';
import { setOptions } from '@storybook/addon-options';

setOptions({
  name: 'Bam Components',
  downPanelInRight: true
});

configure(() => {
  require('../stories/index.js');
}, module)