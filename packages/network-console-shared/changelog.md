# Network Console - Shared component

This project is intended to contain a common component to be used by
Network Console hosts and clients. Because this is a shared component,
version changes might be breaking. This changelog will attempt to
document when breaking changes occur.

## v0.9.2

This change introduces a new File I/O module. This module is intended
to support both reading and writing of supported file formats. This is
supported via the root export `FileFormats` property `CollectionFormats`,
as well as the interfaces `ICollection[type]Adapter`.

This design will soon be extended to environment file formats. No
additional work will be done to the old Collections and Environments
file parsers, and all APIs within the default exported namespaces
`Collections` and `Environments` will be deprecated, and then removed
in 0.10.0.

These APIs will be annotated with Console warnings indicating use of a
deprecated API.
