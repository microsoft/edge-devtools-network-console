// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { AccentButton, Typography, TypographySize, TypographyTag } from '@microsoft/fast-components-react-msft';

import { Base64String, binToB64 } from 'utility/b64';
import Size from 'ui/generic/Size';
import LocText from 'ui/LocText';

interface IProps {
    fileName: string;
    fileContents: Base64String;

    onFileChanged: (fileName: string, contents: Base64String) => void;
}

export default function GridFileInput(props: IProps) {
    const fileRef = React.useRef<HTMLInputElement | null>(null);
    return (
        <div>
            {!!props.fileName ? (
            <div style={{
                display: 'flex',
                flexDirection: 'row',
            }}>
                <div style={{
                    flex: '1 1 auto',
                    position: 'relative',
                    paddingTop: '8px',
                }}>
                    <Typography
                        tag={TypographyTag.p}
                        size={TypographySize._7}
                        style={{
                            whiteSpace: 'nowrap',
                            position: 'absolute',
                            width: '90%',
                            overflow: 'hidden',
                            paddingLeft: '5%',
                        }}
                        title={props.fileName}
                        >
                        {props.fileName}
                    </Typography>
                </div>

                <div style={{
                    flexShrink: 0,
                    flexGrow: 0,
                    paddingTop: '8px',
                }}>
                    {calculateSize(props.fileContents)}
                </div>
                <input
                    type="file"
                    ref={fileRef}
                    style={{display: 'none'}}
                    onChange={async e => {
                        const list = e.target.files;
                        if (list && list.length === 1) {
                            const file = list.item(0);
                            if (!file) {
                                return;
                            }
                            const name = file.name;
                            const binary = await (file as any).arrayBuffer();
                            const b64 = binToB64(binary);
                            props.onFileChanged(name, b64);
                        }
                    }}
                    />
                <AccentButton style={{
                    height: '32px',
                    flexShrink: 0,
                    flexGrow: 0,
                }} onClick={_e => {
                    fileRef.current?.click();
                }}>
                    <LocText textKey="EditorGrid.GridFileInput.replaceFileLabel" />
                </AccentButton>
            </div>)
            :
            (<div style={{textAlign: 'center'}}>
                <input
                    type="file"
                    ref={fileRef}
                    style={{display: 'none'}}
                    onChange={async e => {
                        const list = e.target.files;
                        if (list && list.length === 1) {
                            const file = list.item(0);
                            if (!file) {
                                return;
                            }
                            const name = file.name;
                            const binary = await (file as any).arrayBuffer();
                            const b64 = binToB64(binary);
                            props.onFileChanged(name, b64);
                        }
                    }}
                    />
                <AccentButton
                    onClick={_e => {
                        fileRef.current?.click();
                    }}
                    style={{ margin: '4px' }}
                    >
                        <LocText textKey="EditorGrid.GridFileInput.chooseFileLabel" />
                    </AccentButton>
                </div>)
            }
        </div>
    )
}

function calculateSize(input: Base64String) {
    const resultSize = Math.ceil(input.length * 3 / 4.0);

    return <Size size={resultSize} />;
}
