# `@iac-factory/walker` #

*File-Descriptor Event Handler + Listener*

## Usage ##

```node
/*** ESM Module Wrapper for Common-JS (No Additional Configuration Required) */
import("@iac-factory/ecma");

import { Listener } from "@iac-factory/walker";
Listener.filter( ( descriptor: FS.Dirent, statistics: FS.Stats ) => {
    return !( descriptor.name === "/etc/pam.d" || String( descriptor ) === "/etc/pam.d" );
} ).on( "descriptor" as const as Emitters, function ( descriptor: FS.Dirent, statistics: FS.Stats ) {
    console.log( "Descriptor" + ":", descriptor );
} ).on( "directory" as const as Emitters, function (descriptor: FS.Dirent, statistics: FS.Stats ) {
    console.log( "Directory" + ":", descriptor );
} ).on( "file" as const as Emitters, function (descriptor: FS.Dirent, statistics: FS.Stats ) {
    console.log( "File" + ":", descriptor );
} ).on( "symbolic-link" as const as Emitters, function (descriptor: FS.Dirent, statistics: FS.Stats ) {
    console.log( "Symbolic-Link" + ":", descriptor );
} ).on( "block-device" as const as Emitters, function (descriptor: FS.Dirent, statistics: FS.Stats ) {
    console.log( "Block-Device" + ":", descriptor );
} ).on( "fifo" as const as Emitters, function (descriptor: FS.Dirent, statistics: FS.Stats ) {
    console.log( "FIFO" + ":", descriptor );
} ).on( "socket" as const as Emitters, function (descriptor: FS.Dirent, statistics: FS.Stats ) {
    console.log( "Socket" + ":", descriptor );
} ).on( "character-device" as const as Emitters, function (descriptor: FS.Dirent, statistics: FS.Stats ) {
    console.log( "Character-Device" + ":", descriptor );
} ).on( "error" as const as Emitters, function ( exception?: Error, descriptor?: FS.Dirent, statistics?: FS.Stats ) {
    console.error( "Error" + ":", exception, descriptor, statistics );
} ).on( "end" as const as Emitters, function () {
    console.log( "Complete" );
} );

Listener.walk( "." );
```

## Dependencies ##

> *Where are the 500+ dependencies coming from?*

Dependency management can be hard; especially when it comes to tooling
for development teams to standardize certain practices -- including:

- Commit Messages
- Versioning
- Release Lifecycles
- CI-CD Process
- Unit Testing
- Security Scanning

Therefore, to understand more accurately the requirement(s) for a given package,
always ensure to check if a lock-file exists. In the specific case of the following
repository, being an `npm` package, that lock file is `package.json` + `package-lock.json`.

The **Production** dependencies, or just `dependencies`, is the section to take note of.

In order to prepare a package, generally speaking, for use in a production environment or
downstream package (as of `node` 18.x, `npm` +8):

```bash
npm install --omit dev --omit optional --omit peer
```

running the command above yields:

```log
up to date, audited 10 packages in 798ms
```
