export const Internal: WeakMap<Private<Prototype>, { total: number, files: FS.PathLike[], directories: FS.PathLike[] }> = new WeakMap();

import FS from "fs";
import Path from "path";
import Event from "events";

export type Private<Generic> = Generic & { prototype: Function["prototype"] };

/*** @constructor */
export function Walker( this: Prototype ) {
    if ( !( ( this ) instanceof ( Walker ) ) ) void null;

    Internal.set( this, {
        total: 0,
        files: [],
        directories: []
    } );
}

export type Prototype = typeof Walker & Instance;

Walker.prototype = Object.create( Event.prototype );
Walker.prototype.constructor = Walker;

Walker.prototype.close = function () {
    if ( --this.total === 0 ) this.emit( "end" );

    const internal = Internal.get( this );

    FS.writeFileSync( "output.json", JSON.stringify( internal, null, 4 ), { encoding: "utf-8" } );
};

export type Closure = typeof Walker.prototype.close & ( () => void );

/***
 * Setup the Directory Filter Function
 * ---
 *
 * @param fn {Function} a function that will be given a directory name; if resolving
 * a directory, the return will additionally contain its children
 */
Walker.prototype.filter = function ( fn: FS.PathLike ) {
    this.filter = fn;

    return this as Instance;
};

export type Filter = typeof Walker.prototype.filter & ( ( fn: FS.PathLike ) => void );

/*** Process a file or directory */
Walker.prototype.walk = function ( descriptor: FS.PathLike ) {
    const instance: Instance = this;

    const internal = Internal.get( this );

    FS.lstat( descriptor, function ( exception, statistics ) {
        if ( exception ) {
            instance.emit( "error", exception, descriptor, statistics );
            instance.close();
            return;
        }

        if ( !descriptor || !statistics ) {
            instance.close();
        }

        if ( statistics.isDirectory() ) {
            if ( !descriptor || !statistics || !instance.filter( descriptor ) ) {
                instance.close();
            } else {
                ( internal ) && internal.total++;
                ( internal ) && internal.directories.push( descriptor );
                FS.readdir( descriptor, function ( exception, files ) {
                    if ( exception ) {
                        instance.emit( "error", exception, descriptor, statistics, files );
                        instance.close();
                        return;
                    }

                    instance.emit( "directory", descriptor, statistics );
                    files.forEach( function ( part ) {
                        if ( typeof descriptor === "string" ) instance.walk( Path.join( descriptor, part ) );
                    } );
                    instance.close();
                } );
            }
        } else {
            if ( statistics.isSymbolicLink() ) {
                instance.emit( "symbolic-link", descriptor, statistics );
                instance.close();
            } else {
                if ( statistics.isBlockDevice() ) {
                    instance.emit( "block-device", descriptor, statistics );
                    instance.close();
                } else {
                    if ( statistics.isCharacterDevice() ) {
                        instance.emit( "character-device", descriptor, statistics );
                        instance.close();
                    } else {
                        if ( statistics.isFIFO() ) {
                            instance.emit( "fifo", descriptor, statistics );
                            instance.close();
                        } else {
                            if ( statistics.isSocket() ) {
                                instance.emit( "socket", descriptor, statistics );
                                instance.close();
                            } else {
                                if ( statistics.isFile() ) {
                                    ( internal ) && internal.total++;
                                    ( internal ) && internal.files.push( descriptor );

                                    instance.emit( "file", descriptor, statistics );
                                    instance.close();
                                } else {
                                    instance.emit( "error", new Error( "Unknown-File-Type-Exception" ), descriptor, statistics );
                                    instance.close();
                                }
                            }
                        }
                    }
                }
            }
        }
    } );
};

export type Walk = typeof Walker.prototype.walk & ( ( descriptor: FS.PathLike ) => void );

export const Listener = new Walker.prototype.constructor;

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

export enum Emitter {
    "descriptor" = "descriptor",
    "directory" = "directory",
    "file" = "file",
    "symbolic-link" = "symbolic-link",
    "block-device" = "block-device",
    "fifo" = "fifo",
    "socket" = "socket",
    "character-device" = "character-device",
    "error" = "error",
    "end" = "end"
}

export type Emitters = keyof typeof Emitter;
export type Instance = Event & WeakMapConstructor & { close: Closure; filter: Filter; walk: Walk };

export type { FS };
export type { Stats } from "fs";
export type { Dirent } from "fs";
