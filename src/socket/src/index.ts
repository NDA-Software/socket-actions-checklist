import { Socket } from 'socket-actions/server';

import UpdateCheckList from './actions/updateCheckList';

const actions = {
    updateCheckList: new UpdateCheckList()
};

// eslint-disable-next-line no-new
const socket = new Socket({
    actions,
    disableAuthentication: true,
    serverOptions: {
        port: 3001
    }
});

socket.start();
