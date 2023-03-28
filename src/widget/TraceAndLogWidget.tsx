import React from 'react';

import { ReactWidget } from '@jupyterlab/apputils';

import TraceAndLogComponent from './TraceAndLogComponent';

export class TraceAndLogWidget extends ReactWidget {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;
  }

  render(): JSX.Element {
    return (
      <div id={this.id + '_component'}>
        <TraceAndLogComponent />
      </div>
    );
  }
}

export default TraceAndLogWidget;
