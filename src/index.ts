import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { WidgetTracker } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { WebDSService, WebDSWidget } from '@webds/service';

import { traceAndLogIcon } from './icons';

import TraceAndLogWidget from './widget/TraceAndLogWidget';

namespace Attributes {
  export const command = 'webds_trace_and_log:open';
  export const id = 'webds_trace_and_log_widget';
  export const label = 'Trace and Log';
  export const caption = 'Trace and Log';
  export const category = 'Device - Assessment';
  export const rank = 80;
}

export let webdsService: WebDSService;

/**
 * Initialization data for the @webds/trace_and_log extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: '@webds/trace_and_log:plugin',
  autoStart: true,
  requires: [ILauncher, ILayoutRestorer, WebDSService],
  activate: (
    app: JupyterFrontEnd,
    launcher: ILauncher,
    restorer: ILayoutRestorer,
    service: WebDSService
  ) => {
    console.log('JupyterLab extension @webds/trace_and_log is activated!');

    webdsService = service;

    let widget: WebDSWidget;
    const { commands, shell } = app;
    const command = Attributes.command;
    commands.addCommand(command, {
      label: Attributes.label,
      caption: Attributes.caption,
      icon: (args: { [x: string]: any }) => {
        return args['isLauncher'] ? traceAndLogIcon : undefined;
      },
      execute: () => {
        if (!widget || widget.isDisposed) {
          const content = new TraceAndLogWidget(Attributes.id);
          widget = new WebDSWidget<TraceAndLogWidget>({ content });
          widget.id = Attributes.id;
          widget.title.label = Attributes.label;
          widget.title.icon = traceAndLogIcon;
          widget.title.closable = true;
        }

        if (!tracker.has(widget)) tracker.add(widget);

        if (!widget.isAttached) shell.add(widget, 'main');

        shell.activateById(widget.id);
      }
    });

    launcher.add({
      command,
      args: { isLauncher: true },
      category: Attributes.category,
      rank: Attributes.rank
    });

    let tracker = new WidgetTracker<WebDSWidget>({
      namespace: Attributes.id
    });
    restorer.restore(tracker, {
      command,
      name: () => Attributes.id
    });
  }
};

export default plugin;
