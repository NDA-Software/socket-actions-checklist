import { readFileSync, existsSync, writeFileSync } from 'fs';

import { useReducer, type ReactElement, useState, useEffect } from 'react';
import { Stack, Button, Input, CssVarsProvider, Sheet, CssBaseline, Typography, ListItem, List } from '@mui/joy';

import Client, { type messageReceiver } from 'socket-actions/client';

import Checklist from '@/components/Checklist';

export type checklist = {
    title: string,
    data: item[],
}

export type item = {
    text: string,
    checked: boolean
}

export type reducerAction = {
    action: string,
    newTitle?: string,
    newItem?: {
        index: number,
        item: item,
    },
    indexes?: {
        list: number,
        item?: number
    },
    data?: checklist[];
}

type updateSocketType = (newList: checklist[]) => void;

const listReducerFactory = (updateSocket: updateSocketType) => (oldData: checklist[], { action, newTitle, newItem, indexes, data }: reducerAction): checklist[] => {
    switch (action) {
        case 'add':
            if (newTitle !== undefined && newTitle !== '')
                oldData.push({
                    title: newTitle,
                    data: []
                });
            break;

        case 'newItem':
            if (newItem !== undefined && newItem.item.text !== '')
                oldData[newItem.index].data.push(newItem.item);
            break;

        case 'check':
            if (indexes?.item !== undefined)
                oldData[indexes.list].data[indexes.item].checked = !oldData[indexes.list].data[indexes.item].checked;
            break;

        case 'overwrite':
            oldData = data as checklist[];
            break;

        case 'removeItem':
            if (indexes?.item !== undefined)
                oldData[indexes.list].data.splice(indexes.item, 1);
            break;

        case 'removeChecklist':
            if (indexes !== undefined)
                oldData.splice(indexes.list, 1);
            break;
    }

    if (action !== 'overwrite')
        updateSocket(oldData);

    return [...oldData];
};

let client: Client | null = null;

const connect = (onMessage: messageReceiver): void => {
    client = new Client({
        url: 'ws://localhost:3001',
        onMessage,
        onClose: async () => {
            console.log('Connection lost.');
            console.log('Trying again in 5 seconds...');

            setTimeout(() => {
                connect(onMessage);
            }, 5000);
        }
    });
};

type propType = {
    startingLists: checklist[]
};

export default function Home({ startingLists }: propType): ReactElement<any, any> {
    const [newItem, setNewItem] = useState('');

    const [lists, updateLists] = useReducer(listReducerFactory(
        (updatedList) => client?.sendAction('updateCheckList', { lists: updatedList })
    ), startingLists);

    const click = (): void => {
        updateLists({ newTitle: newItem, action: 'add' });

        setNewItem('');
    };

    useEffect(() => {
        connect(async ({ data }) => {
            const { lists } = JSON.parse(data);

            updateLists({
                action: 'overwrite',
                data: lists
            });
        });
    }, []);

    return (
        <CssVarsProvider defaultMode="dark">
            <CssBaseline />

            <Sheet sx={{ px: 5, py: 5, height: '100vh', width: '100vw' }}>
                <List orientation='horizontal' sx={{ width: '100%', height: '100%', overflowX: 'auto' }}>
                    {lists.map((checklist, i) => (
                        <ListItem key={`${i}-checklist`} sx={{ minWidth: '20%', height: '100%' }}>
                            <Checklist
                                title={checklist.title}
                                index={i}
                                data={checklist.data}
                                updateLists={updateLists}
                            />
                        </ListItem>)
                    )}

                    <ListItem>
                        <Sheet sx={{ flex: 'none', height: '100%', overflow: 'auto' }}>
                            <List>
                                <ListItem sticky>
                                    <Typography level="h3">&nbsp;</Typography>
                                </ListItem>

                                <ListItem>
                                    <Stack direction='row' spacing={1}>
                                        <Input
                                            onKeyUp={(e) => {
                                                if (e.key === 'Enter')
                                                    click();
                                            }}
                                            placeholder='New List'
                                            onChange={(e) => { setNewItem(e.target.value); }}
                                            value={newItem}
                                        />

                                        <Button onClick={click}>+</Button>
                                    </Stack>
                                </ListItem>
                            </List>
                        </Sheet>
                    </ListItem>
                </List>
            </Sheet>
        </CssVarsProvider>

    );
}

export const getServerSideProps = (): Record<string, object> => {
    let startingLists = [];

    const fileName = '../../data.json';

    if (!existsSync(fileName))
        writeFileSync(fileName, '[]');

    const data = readFileSync('../../data.json').toString();

    startingLists = JSON.parse(data);

    return {
        props: {
            startingLists
        }
    };
};
