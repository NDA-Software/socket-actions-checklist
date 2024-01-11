import { Button, Checkbox, Input, Stack, Typography } from '@mui/joy';
import { type ReactElement, useState, type Dispatch } from 'react';

import { type item, type reducerAction } from '@/pages';

type propType = {
    index: number,
    title: string,
    data: item[],
    updateLists: Dispatch<reducerAction>
}

export default function Checklist ({ index, title, data, updateLists }: propType): ReactElement<any, any> {
    const [newItem, setNewItem] = useState('');

    const click = (): void => {
        updateLists({
            action: 'newItem',
            newItem: {
                index,
                item: {
                    text: newItem,
                    checked: false
                }
            }
        });

        setNewItem('');
    };

    return (
        <Stack direction='column' spacing={1}>
            <Typography level="h3">{title}</Typography>

            {data.map((item, i) => (
                <Checkbox
                    key={`${index}-${i}-item`}
                    checked={item.checked}
                    onChange={() => { updateLists({ action: 'check', indexes: { list: index, item: i } }); }}
                    label={item.text}
                />
            ))}

            <Stack direction='row' spacing={1}>
                <Input onKeyUp={(e) => {
                    if (e.key === 'Enter')
                        click();
                }} placeholder='New Item' onChange={(e) => { setNewItem(e.target.value); }} value={newItem} />

                <Button
                    color="success"
                    onClick={click}>+</Button>
            </Stack>
        </Stack>
    );
}
