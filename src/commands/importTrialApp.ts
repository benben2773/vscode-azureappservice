/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window } from "vscode";
import { ext } from '../extensionVariables';

export async function importTrialApp(loginSession?: string): Promise<void> {

    if (loginSession) {
        // ext.context.globalState.update('trialApp.hasApp', true);
        ext.context.globalState.update('trialApp.loginsession', loginSession);
        ext.context.globalState.update('trialApp.imported', true);

        await ext.azureAccountTreeItem.refresh();

    } else {
        window.showErrorMessage('App could not be imported. No loginSession provided.');
    }
}
