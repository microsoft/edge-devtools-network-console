# Host message definitions

This document contains a loose set of message definitions between the front-end and the host.
This maps to the `vscode-host.ts` module.

## RPC Protocol

Communication between the frontend and host take place over the `IHTMLWindow.postMessage`
channel. If a message expects a response, the message will include an `id` property. Presently,
only requests from the frontend support responses.

## Frontend-to-Host

### `CONSOLE_READY`

Indicates that the frontend is ready to process messages. This is fired once the
`VsCodeApplicationHost` has been created, so that none of the messages are sent without
any listeners.

```ts
{
    type: 'CONSOLE_READY'
}
```

### `EXECUTE_REQUEST`

Requests the host to issue a network request on behalf of the front-end.

```ts
{
    type: 'EXECUTE_REQUEST';
    id: number; // Uniquely identifies this request to correlate request/response
    configuration: IHttpRequest;
}
```

### `SAVE_REQUEST`

Requests the host to save a request into an existing collection.

```ts
{
    type: 'SAVE_REQUEST';
    id: number; // Uniquely identifies this request to correlate request/response
    request: ISerializableNetConsoleRequest;
    toCollectionId: string | undefined;
}
```

The `toCollectionId` parameter indicates which collection folder the request should be saved into.
If the parameter is omitted, it should replace the existing request with the matching request ID. If no
matching request ID exists (perhaps because the request has been deleted from disk since it was loaded),
the host should raise an error to the frontend.

The return value of this function should include two properties:

 * `result`, of type `ISerializableNetConsoleRequest`; and
 * `resultRequestId` of type `string`. If the `toCollectionId` parameter was specified, the
 result request ID will be different (it functions like Save-As).

### `SAVE_COLLECTION_AUTHORIZATION_PARAMETERS`

Requests the host to save Authorization settings into an existing collection folder.

```ts
{
    type: 'SAVE_COLLECTION_AUTHORIZATION_PARAMETERS';
    id: number;
    collectionId: string;
    authorization: INetConsoleAuthorization;
}
```

### `SAVE_ENVIRONMENT_VARIABLES`

Requests the host to save a set of environment variables to a particular environment.

```ts
{
    type: 'SAVE_ENVIRONMENT_VARIABLES';
    id: number;
    variables: ISerializableNetConsoleParameter[];
    environmentId: string;
}
```

### `OPEN_WEB_LINK`

Requests the host launch a browser or new tab to a particular URL. This is a fire-and-forget API
and does not monitor for a result.

```ts
{
    type: 'OPEN_WEB_LINK';
    url: string;
}
```

### `OPEN_NEW_UNATTACHED_REQUEST`

Requests the host present a new tab and associates it to a particular ID. This is a fire-and-forget
message insofar as it doesn't require a result or response, but the ID is stateful.

```ts
{
    type: 'OPEN_NEW_UNATTACHED_REQUEST';
    requestId: string;
}
```

### `UPDATE_DIRTY_FLAG`

Notifies the host that the current Network Console window is dirty or clean so that the host
can query the user to save a request before closing the window. This is a fire-and-forget API and
does not monitor for a result.

```ts
{
    type: 'UPDATE_DIRTY_FLAG';
    requestId: string;
    isDirty: boolean;
}
```

### `LOG`

Logs some message via the message port. No response is expected to this.

```ts
{
    type: 'LOG';
    [key: string | number]: unknown;
}
```

## Host-to-Frontend

### `INIT_HOST`

Initializes the application according to the host settings.

```ts
{
    type: 'INIT_HOST';
    cssVariables: string; // CSS variables injected by host
    isDark: boolean; // Whether the host theme is a dark theme
    isHighContrast: boolean; // Whether the host theme is a high-contrast theme
    persistedState?: string;
    messagePort?: MessagePort; // Allows the host to provide an alternative message port
}
```

If `persistedState` is set, the frontend will attempt to rehydrate its state from the JSON
payload contained within that property. (This allows for hosts like VS Code to store state
in the event of crashes or process suspension).

### `INIT_NEW_EMPTY_REQUEST`

Initializes a new empty request. This does not include any parameters nor have a response
message defined; however, if a new empty request is successfully created, an
`OPEN_NEW_UNATTACHED_REQUEST` message will be sent from the frontend to the host.

```ts
{
    type: 'INIT_NEW_EMPTY_REQUEST';
}
```

### `CSS_STYLE_UPDATED`

Updates the application styles.

```ts
{
    type: 'CSS_STYLE_UPDATED';
    cssVariables: string; // CSS variables injected by VS Code
    isDark: boolean; // Whether the VS Code theme is a dark theme
}
```

### `SET_PREFERENCES`

Updates the preferences registered to the application.

```ts
{
    type: 'SET_PREFERENCES';
    shouldShowDescription: boolean; // Whether to show the 'Description' field in editor grids
}
```

### `LOAD_REQUEST`

Loads a request from a collection.

```ts
{
    type: 'LOAD_REQUEST';
    request: INetConsoleRequest;
    environmentAuth?: INetConsoleAuthorization;
    environmentAuthPath?: string[];
}
```

`environmentAuth` and `environmentAuthPath` are optional parameters, but if one is included, both
must be included. This enables the frontend to view and modify the environment authorization. The
`environmentAuthPath` is an array of

### `REQUEST_COMPLETE`

Indicates that a request has been completed.

```ts
{
    type: 'REQUEST_COMPLETE';
    id: number; // Corresponds to the ID that was sent with EXECUTE_REQUEST
    response: INetConsoleResponse;
}
```

### `UPDATE_COLLECTIONS_TREE`

Indicates that the set of loaded collections has been modified. The loaded collections are folders,
allowing a user to choose where to "Save As".

```ts
{
    type: 'UPDATE_COLLECTIONS_TREE';
    collections: ICollectionFolder[];
}
```

### `EDIT_ENVIRONMENT_VARIABLES`

Indicates that the user has requested to edit an environment.

```ts
{
    type: 'EDIT_ENVIRONMENT_VARIABLES';
    id: string; // Environment ID, from host
    environment: INetConsoleEnvironment;
    file: string;
    collectionName: string; // friendly name of collection
}
```

If the frontend successfully edits the environment, it will dispatch the `SAVE_ENVIRONMENT_VARIABLES`
message. If the frontend dismisses the edit modal, no action will be dispatched.

### `UPDATE_ENVIRONMENT`

Indicates that the user has activated an environment as the current environment.

```ts
{
    type: 'UPDATE_ENVIRONMENT';
    environment: INetConsoleEnvironment;
}
```

This frontend needs to see the active environment for environment variable substitution display.

### `CLEAR_ENVIRONMENT`

Clears the current active environment with no replacement.

```ts
{
    type: 'CLEAR_ENVIRONMENT';
}
```

### `SHOW_OPEN_REQUEST`

Switches the root currently-displayed-view to a different request ID.

```ts
{
    type: 'SHOW_OPEN_REQUEST';
    requestId: string;
}
```

### `CLOSE_VIEW`

Closes a view.

```ts
{
    type: 'CLOSE_VIEW';
    requestId: string;
}
```
