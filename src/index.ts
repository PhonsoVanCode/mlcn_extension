import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the mlcn_extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'mlcn_extension:plugin',
  description: 'A JupyterLab extension for Multi-Language-Computational-Notebooks',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension mlcn_extension is activated!');
  }
};

export default plugin;
