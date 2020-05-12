/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// begins process to create a trial app
// brings up template selector
// returns node to go on tree

import { window } from "vscode";
import { IActionContext, ICreateChildImplContext } from "vscode-azureextensionui";
import { ext } from "../../extensionVariables";

export async function createTrialApp(context: IActionContext & Partial<ICreateChildImplContext>): Promise<void> {

    const bearer: string = 'EAAAAI8X14FHvIQGNGOF7mkPCBxZDxQDkX3YTbP8OY1nRCboxrFFUfEi4ui3Me+Uaoybc24UE1xzTFy1zh9Ijcq2ehUm/a0Ps2EUPhKDsyD5i/jjObSI6vZ5PepN2IJOyYJzA2L30u16/MgYtUiilXFCJUOIwS0Jl8VwPk/xtnZPkLOzKTJLyMdFs6C+L/QVsZ29LaT7KPPj8hqdscPOHP7ikZ/ij1wFzXtqQzYRZqLg9DOBcbGajbFIrhjvW1WN6MSpGXlXt0h01GLntswAjBvoVQoBU+YwjMga6YvlVSIhMOwTf1CrfLvL6vxEi+3Fy+UX9xS8QKGA4tmp/CgGAY/5EYhYx2rzMIV4F0jgn+nbw2o+WXBY17iNuU7IVj6G6ixBCWgOYO2iTDw8tpJvgYQz9gWrG9J/dPfuYE4H5YYBHk38O+jwSKFJ/IykNQvq9wzF2LHXL94lqf6dZCVUTO5cNabXgHfnlQYKmsbgpIglma4N8n0+h0uBmlOljlbkcOaMj0r2MDwPVvxP6DafxCfBRDfA5E4sY3rxd6cuf68KzD7dRdO+tagQseNeWEv5qbMk2e3AyCujVKuo70T5Tizk/i2Afp6px9q6FeMGYLPz1vTJGJZtA7/m861b9irSxJF1liN7jfucesa10CD4xnkLm4ntrqkKaRdxxPsaKlXehOt0dkueJnDT11xYbpRbOcda/RgDRIZFHXfcqnLqSAkYjIEZeNMzkflP4UkL/Shdqaw/8jGZmT8SBpUDB4e1wr7g5VnQgBGcYNLSBxTY32SVdyykgTk75ysMGFXV0b81QVfUfVyENm3LduB4bRMdzcZ7dfOmN/ctmx4z+DbmZq+qzLaXvtyJ8AeRDRW+uNFS9A3NHxdwhA71+L2M8p2nTEGWDuWQTqZneU3oa3Owj6hobdhhGSlujbfQbGf3M35aa3h/e/yCVQ8EDp0yegKlYGpdcWVtSt9TuG9A1ODdvoB7zb219GreqEukNWDnF05OVfd0I3Cy8elcRRdCSs9KObDUMSiiA89+RugYADulJFWY+hgZ3Z0Fgp1ne1j/tmWLT5l7Dszk6dGOUTyzw9nSkSaPkLyAd5PBvf3dUnMZLKX40BYA51joOn5wsLmKCpDQIa//fAe1KKnKRK0Iiow2gD/8coU8x0/+JOyRQG5KOnovgd9t0hC86Zq0XeHP6SZIp8MrVh3IfKXKz3nd6umuoXcSxxENKZoIijULBt9qrusonVXbFcryuN+xwQzDVu1hP+1u77I5SGlpLp6F8vxk3F7hW8YYkzV1yAexTT2VKVQgc5Fzori3R7TF4AlhXXPJcitV';

    window.showInputBox({ placeHolder: 'Enter loginsession cookie' }).then((cookie: string) => {
        ext.context.globalState.update('trialApp.loginsession', cookie);
    });

    ext.context.globalState.update('appServiceTrialMode', true);
    ext.context.globalState.update('trialAppBearerToken', bearer);

    window.showInformationMessage('Your NodeJS Trial App has been successfully created.').then(async (result) => {
        if (result) {
            ext.outputChannel.append(result);
        }
    });

    await ext.tree.refresh();
}
