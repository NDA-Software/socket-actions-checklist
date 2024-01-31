import { readFileSync, existsSync, writeFileSync } from 'fs';

import { useReducer, type ReactElement, useState, useEffect } from 'react';
import { Stack, Button, Input, Box } from '@mui/joy';

import Client, { type messageReceiver } from 'socket-actions/client';

import Checklist from '@/app/Checklist';

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
        item: number
    },
    data?: checklist[];
}

type updateSocketType = (newList: checklist[]) => void;

const listReducerFactory = (updateSocket: updateSocketType) => (oldData: checklist[], { action, newTitle, newItem, indexes, data }: reducerAction): checklist[] => {
    if (action === 'add' && newTitle !== undefined && newTitle !== '')
        oldData.push({
            title: newTitle,
            data: []
        });

    if (
        action === 'newItem' &&
        newItem !== undefined &&
        newItem.item.text !== ''
    )
        oldData[newItem.index].data.push(newItem.item);

    if (
        action === 'check' &&
        indexes !== undefined
    )
        oldData[indexes.list].data[indexes.item].checked = !oldData[indexes.list].data[indexes.item].checked;

    if (action === 'overwrite')
        oldData = data as checklist[];
    else
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
        <Stack direction='row' spacing={1}>
            {lists.map((checklist, i) => (
                <Checklist
                    title={checklist.title}
                    key={`${i}-checklist`}
                    index={i}
                    data={checklist.data}
                    updateLists={updateLists}
                />)
            )}

            <Box>
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
            </Box>
        </Stack>
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
