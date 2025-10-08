import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker} from '@jupyterlab/notebook';

import { callChatGPT } from './caller';
import { showParticipantID, getParticipantID } from './participant-builder';

/**
 * Initialization data for the mlcn-extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'mlcn_extension:plugin',
  description: 'A JupyterLab extension for Multi-Language Computational Notebooks.',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, tracker: INotebookTracker) => {
    console.log('JupyterLab extension mlcn-extension is activated! Version 0.1.0');

    tracker.currentChanged.connect((sender, args) => {
      console.log('>>> tracker.currentChanged.connect')

      // TODO: write better!
      if (!window.localStorage.getItem('mlcnParticipantID')) {
        showParticipantID();
        window.localStorage.setItem('mlcnParticipantID', getParticipantID());
      }

      const current = tracker.currentWidget;
      let oldType = current?.content.activeCell?.model.type;
      let newType = current?.content.activeCell?.model.type;

      let lastSignal = Date.now();
      let lastLength = current?.content.model?.cells.length;

      current?.content.model?.cells.changed.connect(async (sender, args) => {
        console.log('>>> cells.changed.connect ');
        console.log(args);

        newType = current.content.activeCell?.model.type;

        if (Date.now() - lastSignal < 200) {
          console.log('>>>>>> cell fast call from ' + oldType + ' to ' + newType);

          if(oldType !== newType) {

            const mlcnNatural = current?.content.activeCell?.model.sharedModel.getMetadata('mlcnNatural') as string || '';
            //const mlcnCode = current?.content.activeCell?.model.sharedModel.getMetadata('mlcnCode') as string || '';
            //const mlcnMarkdown = current?.content.activeCell?.model.sharedModel.getMetadata('mlcnMarkdown') as string || '';
            const currentSource = current?.content.activeCell?.model.sharedModel.getSource() as string; 

            //console.log('');
            //console.log('>>>>>> mlcnNatural:', mlcnNatural);
            //console.log('>>>>>> mlcnCode:', mlcnCode);
            //console.log('>>>>>> mlcnMarkdown:', mlcnMarkdown);
            //console.log('>>>>>> currentSource:', currentSource);
            //console.log('');

            /**
             * case start new notebook with empty cell
             */
            if (oldType === undefined) {
              if (current?.content.activeCell?.model.sharedModel.getSource().length == 0) {
                current?.content.activeCell?.model.sharedModel.setSource(
                  '# if you want to use the extension, switch to a RAW cell'
                ); 
              }
            }

            /**
             * case natural to code
             */
            if (oldType === 'raw' && newType === 'code') {
              console.log('>>>>>> cell from raw to code');

              current?.content.activeCell?.model.sharedModel.setMetadata('mlcnNatural', currentSource);

              // check for changes
              if (currentSource !== mlcnNatural) {

                current?.content.activeCell?.model.sharedModel.setSource(
                  '# This is under heavy construction...'
                );

                const generatedFromNatural = await callChatGPT(current?.content.activeCell?.model.sharedModel.getMetadata('mlcnNatural') as string || '', tracker);

                current?.content.activeCell?.model.sharedModel.setMetadata('mlcnCode', generatedFromNatural.codeoutput);
                current?.content.activeCell?.model.sharedModel.setMetadata('mlcnMarkdown', generatedFromNatural.markdownoutput);

              }
                
              current?.content.activeCell?.model.sharedModel.setSource(
                  current?.content.activeCell?.model.sharedModel.getMetadata('mlcnCode') as string || ''
              );
              
            }

            /**
             * case natural to markdown
             */
            if (oldType === 'raw' && newType === 'markdown') {
              console.log('>>>>>> cell from raw to markdown');

              current?.content.activeCell?.model.sharedModel.setMetadata('mlcnNatural', currentSource);

              // check for changes
              if (currentSource !== mlcnNatural) {

                current?.content.activeCell?.model.sharedModel.setSource(
                  '# This is under heavy construction...'
                );

                const generatedFromNatural = await callChatGPT(current?.content.activeCell?.model.sharedModel.getMetadata('mlcnNatural') as string || '', tracker);

                current?.content.activeCell?.model.sharedModel.setMetadata('mlcnCode', generatedFromNatural.codeoutput);
                current?.content.activeCell?.model.sharedModel.setMetadata('mlcnMarkdown', generatedFromNatural.markdownoutput);

              }

              current?.content.activeCell?.model.sharedModel.setSource(
                  current?.content.activeCell?.model.sharedModel.getMetadata('mlcnMarkdown') as string || ''
              );            
            }

            /**
             * case code to natural
             */
            if (oldType === 'code' && newType === 'raw') {
              console.log('>>>>>> cell from code to raw');

              // TODO: educational purpose -> improve prompt in raw cell

              current?.content.activeCell?.model.sharedModel.setMetadata('mlcnCode', currentSource);

              current?.content.activeCell?.model.sharedModel.setSource(
                  current?.content.activeCell?.model.sharedModel.getMetadata('mlcnNatural') as string || ''
              );
            }

            /**
             * case code to markdown
             */
            if (oldType === 'code' && newType === 'markdown') {
              console.log('>>>>>> cell from code to markdown');

              current?.content.activeCell?.model.sharedModel.setMetadata('mlcnCode', currentSource);

              current?.content.activeCell?.model.sharedModel.setSource(
                  current?.content.activeCell?.model.sharedModel.getMetadata('mlcnMarkdown') as string || ''
              );
            }

            /**
             * case markdown to natural
             */
            if (oldType === 'markdown' && newType === 'raw') {
              console.log('>>>>>> cell from markdown to raw');

              // TODO: educational purpose -> improve prompt in raw cell

              current?.content.activeCell?.model.sharedModel.setMetadata('mlcnMarkdown', currentSource);

              current?.content.activeCell?.model.sharedModel.setSource(
                  current?.content.activeCell?.model.sharedModel.getMetadata('mlcnNatural') as string || ''
              );            
            }

            /**
             * case markdown to code
             */          
            if (oldType === 'markdown' && newType === 'code') {
              console.log('>>>>>> cell from markdown to code');

              current?.content.activeCell?.model.sharedModel.setMetadata('mlcnMarkdown', currentSource);

              current?.content.activeCell?.model.sharedModel.setSource(
                  current?.content.activeCell?.model.sharedModel.getMetadata('mlcnCode') as string || ''
              );            
            }
          } 
        
        } else {
          console.log('>>>>>> cell long call from ' + oldType + ' to ' + newType);

            if (lastLength != current?.content.model?.cells.length) {
              console.log('>>>>>> length-update: ' + args.type);

              if(args.type === 'add') {
                current?.content.model?.cells.get(args.newIndex).sharedModel.setSource(
                    '# if you want to use the extension, switch to a RAW cell'
                );

                
              }

            }

            if(oldType !== newType) {

            } else {

            }
        }


        oldType = newType;
        lastSignal = Date.now();
        lastLength = current?.content.model?.cells.length;

      });
    });
  }
};

export default plugin;
