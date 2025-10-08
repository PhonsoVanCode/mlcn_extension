import { Widget } from '@lumino/widgets';
import { showDialog, Dialog } from '@jupyterlab/apputils';

const participantID = generateParticipantID();

let isShowed = false;

/**
 * Displays a dialog showing a randomly generated participant ID for survey use.
 *
 * The participant ID is constructed from two random prefixes and the current timestamp.
 * The dialog includes an input field with the participant ID and a button to copy it to the clipboard.
 * Users are instructed to enter this code in the survey form before proceeding.
 *
 * @remarks
 * The copy-to-clipboard functionality uses `document.execCommand('copy')`.
 * The dialog is presented using the `showDialog` function.
 */
export function showParticipantID() {

    if (!isShowed) {
        isShowed = true;
        const bodyWidget = new Widget();
        bodyWidget.node.innerHTML = `
        <div style="margin-bottom: 1em;">
            <b>Your participant code for the survey is:</b><br>
            <input id="participant-id" value="${participantID}" readonly style="width: 100%; font-size: 1.2em; margin-top: 0.5em;" />
            <button id="copy-btn" style="margin-top: 10px;">Copy to clipboard</button>
        </div>
        <div style="font-size: 1em; margin-top: 1em;">
            <b>Please enter this code in the survey form before proceeding.</b><br><br>
            <b>Thank you very much for your participation!</b>
        </div>
        `;
        bodyWidget.node.querySelector('#copy-btn')?.addEventListener('click', () => {
            const input = bodyWidget.node.querySelector('#participant-id') as HTMLInputElement;
            input.select();
            document.execCommand('copy');
        });

        showDialog({
            title: 'Your participant code',
            body: bodyWidget,
            buttons: [Dialog.okButton({ label: 'OK' })]
        });
    }

}

/**
 * Returns the current participant ID used for the survey.
 */
export function getParticipantID(): string {
    return participantID;
}


function generateParticipantID():string {
    const prefix1 = Math.random() < 0.5 ? 'AB' : 'BA';
    const prefix2 = Math.random() < 0.5 ? 'WO' : 'OW';
    const millis = Date.now().toString();
    const participantID = `${prefix1}${prefix2}${millis}`;
    return participantID;
}
