# Data and View Model for Network Console

This document attempts to reason how the data model for Network Console should work. The difficulty for this
project is due to managing in-memory state, saved/persisted state, serializing state to/from disk, and also
managing the request-response model.

## Basic data types

The data model is centered around the request-response model of HTTP:

```ts
export interface IHttpHeader {
    key: string;
    value: string;
}

export interface IHttpBody {
    body: Buffer | null;
}

export interface IHttpRequest {
    verb: HttpVerb;
    url: string;
    headers: IHttpHeader[];
    body: IHttpBody;
}

export interface IHttpResponse {
    statusCode: number;
    headers: IHttpHeader[];
    body: IHttpBody;
    size: number;
}
```

These mirror the basic I/O components of a simple HTTP request. Network console builds on these with the
`INetConsole-` interfaces:

```ts
export interface INetConsoleParameter extends IHttpHeader {
    id: number;

    description: string;
    isActive: boolean;
}

export interface INetConsoleRequest extends IHttpRequest {
    id: number;
    name: string;
    description: string;
    headers: INetConsoleParameter[];
    queryParameters: INetConsoleParameter[];
    routeParameters: INetConsoleParameter[];
}

export interface INetConsoleResponse {
    response: IHttpResponse;
    duration: ms;
    status: ResponseStatus;
}
```

During the issuance of a request, the raw `INetConsoleRequest` is not sent to the server; rather, it is transformed into an `IHttpRequest` taking into account transformations in this way:

 1. The INetConsoleRequest is duplicated into a new value
 1. Environment variables are substituted into the **values** of the duplicate, within the `url`, `headers`, `queryParameters`, and `routeParameters` values. Environment variables are matched within double-handlebars notation, i.e., `{{someValue}}` matches the `someValue` environment variable.
 1. The final `url` value is composed, taking into account substitutions from `routeParameters` and suffixed with appropriately-encoded `queryParameters`.

**During v0.1, substitutions will not be supported; however, the transformation pipeline will still be set up this way**.

Saving is not currently supported. The plan to support persistence will be in two different directions:

 1. **Edit, Undo, Redo**: An "edit" action will be considered when a UI element loses focus (`blur`). Within a given session (which might be an open tab or other representation of a "request document" in the UI), any "edit action" will be added to a state stack. A monadic implementation of the command pattern will be used here; the current state will be memoized as a shorthand, but should always be able to be recreated from a "starting point" (either a new, blank request or a staged copy of the request that existed when it was opened) and then replaying any later edits.
 2. **Persistence to disk**: A major differentiating feature is that we want to be able to store our "Collections" equivalent in source control (as opposed to Postman which leverages a cloud service). The goals we have for this are:
   * Closing an unsaved document (e.g., via a crash, close of IDE/browser, etc) should keep the "unsaved state" so that reopening should restore the last user's document position. This is consistent with Postman; however, this state should *not* be persisted into the on-disk "Collections" equivalent.
   * We should be able to interoperate with an existing collections format, e.g., Postman or HTTP Client.

The edit, undo, and redo state will not be persisted to disk. Upon the user's invocation of "Save", the snapshot of the current state will be serialized, and the "last saved" pointer will be updated. This will provide a mechanism for the state stack to be able to determine whether a combination of Undo and Redo point to the most-recently-saved data.

## How does this fit together with the UI layer?

The UI layer is implemented in terms of Redux for state management.

