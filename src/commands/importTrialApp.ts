/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// begins process to create a trial app
// brings up template selector
// returns node to go on tree

import { window } from "vscode";
import { ext } from 'vscode-azureappservice/out/src/extensionVariables';

export async function importTrialApp(loginSession?: string): Promise<void> {

    window.showInformationMessage(loginSession || '');

    // window.showInputBox({ placeHolder: 'Enter loginsession cookie' }).then((cookie: string) => {
    //     ext.context.globalState.update('trialApp.loginsession', cookie);
    // });

    ext.context.globalState.update('appServiceTrialMode', true);
    ext.context.globalState.update('trialApp.loginsession', loginSession);
    // ext.context.globalState.update('trialAppBearerToken', bearer);

    window.showInformationMessage('Trial app has been successfully imported.').then(async (result) => {
        if (result) {
            ext.outputChannel.append(result);
        }
    });
}
