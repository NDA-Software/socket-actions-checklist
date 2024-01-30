import { Socket } from 'socket-actions/server';

import UpdateCheckList from './actions/updateCheckList';

const actions = {
    updateCheckList: new UpdateCheckList()
};

// eslint-disable-next-line no-new
new Socket({
    actions,
    port: 3001,
    disableAuthentication: true
});
