import { useReducer, type ReactElement, useState } from 'react';
import { Stack, Button, Input, Box } from '@mui/joy';

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

const listReducer = (oldData: checklist[], { action, newTitle, newItem, indexes }: reducerAction): checklist[] => {
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

    return [...oldData];
};

export default function Home(): ReactElement<any, any> {
    const [newItem, setNewItem] = useState('');
    const [lists, updateLists] = useReducer(listReducer, []);

    const click = (): void => {
        updateLists({ newTitle: newItem, action: 'add' });

        setNewItem('');
    };

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
