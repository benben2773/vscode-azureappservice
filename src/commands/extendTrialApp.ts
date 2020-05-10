/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// begins process to create a trial app
// brings up template selector
// returns node to go on tree

import { window } from "vscode";
import { IActionContext, ICreateChildImplContext } from "vscode-azureextensionui";
import { TrialAppTreeItem } from '../explorer/TrialAppTreeItem';
import { ext } from "../extensionVariables";

export async function extendTrialApp(context: IActionContext & Partial<ICreateChildImplContext>, node?: TrialAppTreeItem): Promise<void> {

    if (!node) {
        return;
    } else {

        await node.extendTrialApp();

        window.showInformationMessage('Your NodeJS Trial App has been successfully extended.').then(async (result) => {
            if (result) {
                ext.outputChannel.append(result);
            }
        });
    }

    await ext.tree.refresh();
}
