import { Button, Checkbox, Input, List, ListItem, Sheet, Stack, Typography } from '@mui/joy';
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
        <Sheet sx={{ flex: 'none', height: '100%', overflow: 'auto' }}>
            <List>
                <ListItem sx={{ width: '100%', justifyContent: 'space-between' }} sticky>
                    <Typography level="h3" >{title}</Typography>

                    <Button variant='soft' size="sm" color="danger" onClick={click}>X</Button>
                </ListItem>

                {data.map((item, i) => (
                    <ListItem sx={{ width: '100%', justifyContent: 'space-between' }}>
                        <Checkbox
                            key={`${index}-${i}-item`}
                            checked={item.checked}
                            onChange={() => { updateLists({ action: 'check', indexes: { list: index, item: i } }); }}
                            label={item.text}
                        />

                        <Button variant='plain' size="sm" color="danger" onClick={click}>X</Button>
                    </ListItem>
                ))}

                <ListItem>
                    <Stack direction='row' spacing={1} >
                        <Input onKeyUp={(e) => {
                            if (e.key === 'Enter')
                                click();
                        }} placeholder='New Item' onChange={(e) => { setNewItem(e.target.value); }} value={newItem} />

                        <Button
                            color="success"
                            onClick={click}>+</Button>
                    </Stack>
                </ListItem>
            </List>

        </Sheet>
    );
}
