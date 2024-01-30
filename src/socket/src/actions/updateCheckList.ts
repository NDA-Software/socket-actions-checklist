import { writeFileSync } from 'fs';

import { Action } from 'socket-actions/server';

import { type ActionParameters } from 'socket-actions/server';

export default class UpdateCheckList extends Action {
    override async onRun(param: ActionParameters): Promise<void> {
        const { data, userData } = param;

        const { lists } = data;

        writeFileSync('../../data.json', JSON.stringify(lists));

        this.server?.sendMessageToAll({ lists }, { exceptions: [userData.id] });
    }
}
