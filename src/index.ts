export const Internal: WeakMap<Private<Prototype>, { total: number, files: FS.PathLike[], directories: FS.PathLike[] }> = new WeakMap();

import FS from "fs";
import Path from "path";
import Event from "events";

export type Private<Generic> = Generic & { prototype: Function["prototype"] };

/*** @constructor */
export function Walker (this: Prototype) {
    if ( !( ( this ) instanceof ( Walker ) ) ) void null;

    Internal.set( this, {
        total: 0,
        files: [],
        directories: []
    } );
}

export type Prototype = typeof Walker;

Walker.prototype = Object.create(Event.prototype);
Walker.prototype.constructor = Walker;

// export const Unknown: () => Error = Walker.Unknown = Exception (
//     "Unknown-File-Type-Exception",
//     "The File Type of the Descriptor Context Couldn't be Determined"
// );

/***
 * Setup the Directory Filter Function
 * ---
 *
 * @param fn {Function} a function that will be given a directory name; if resolving
 * a directory, the return will additionally contain its children
 */
Walker.prototype.filter = function (fn: FS.PathLike) {
    this.filter = fn;

    return this;
};

/*** Process a file or directory */
Walker.prototype.walk = function (descriptor: FS.PathLike) {
    const instance = this;

    const internal = Internal.get(this);

    FS.lstat( descriptor, function (exception, statistics) {
        if ( exception ) {
            instance.emit( "error", exception, descriptor, statistics );
            instance.close();
            return;
        }

        if ( !descriptor || !statistics ) { instance.close(); }

        if ( statistics.isDirectory() ) {
            if ( !descriptor || !statistics || !instance.filter( descriptor ) ) {
                instance.close();
            } else {
                (internal) && internal.total++;
                (internal) && internal.directories.push(descriptor);
                FS.readdir( descriptor, function (exception, files) {
                    if ( exception ) {
                        instance.emit( "error", exception, descriptor, statistics, files );
                        instance.close();
                        return;
                    }

                    instance.emit( "directory", descriptor, statistics );
                    files.forEach( function (part) {
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
                                    (internal) && internal.total++;
                                    (internal) && internal.files.push(descriptor);

                                    instance.emit( "file", descriptor, statistics );
                                    instance.close();
                                } else {
                                    instance.emit( "error", new Error("Unknown-File-Type-Exception"), descriptor, statistics );
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

Walker.prototype.close = function () {
    if ( --this.total === 0 ) this.emit( "end" );

    const internal = Internal.get(this);

    FS.writeFileSync("output.json", JSON.stringify(internal, null, 4), { encoding: "utf-8"});
};

export const walker = new Walker.prototype.constructor;

walker.filter( (descriptor: FS.Dirent, statistics: FS.Stats) => {
    return !( descriptor.name === "/etc/pam.d" || String( descriptor ) === "/etc/pam.d" );
} )
    .on( "descriptor", function (descriptor: FS.Dirent, statistics: FS.Stats) {
        console.log( "Descriptor" + ":", descriptor );
    } )
    .on( "directory", function (this: Event, descriptor: FS.Dirent, statistics: FS.Stats) {
        console.log( "Directory" + ":", descriptor );
        return this as NodeJS.EventEmitter;
    } )
    .on( "file", function (this: Event, descriptor: FS.Dirent, statistics: FS.Stats) {
        console.log( "File" + ":", descriptor );
        return this as NodeJS.EventEmitter;
    } )
    .on( "symbolic-link", function (this: Event, descriptor: FS.Dirent, statistics: FS.Stats) {
        console.log( "Symbolic-Link" + ":", descriptor );
        return this as NodeJS.EventEmitter;
    } )
    .on( "block-device", function (this: Event, descriptor: FS.Dirent, statistics: FS.Stats) {
        console.log( "Block-Device" + ":", descriptor );
        return this as NodeJS.EventEmitter;
    } )
    .on( "fifo", function (this: Event, descriptor: FS.Dirent, statistics: FS.Stats) {
        console.log( "FIFO" + ":", descriptor );
        return this as NodeJS.EventEmitter;
    } )
    .on( "socket", function (this: Event, descriptor: FS.Dirent, statistics: FS.Stats) {
        console.log( "Socket" + ":", descriptor );
        return this as NodeJS.EventEmitter;
    } )
    .on( "character-device", function (this: Event, descriptor: FS.Dirent, statistics: FS.Stats) {
        console.log( "Character-Device" + ":", descriptor );
        return this as NodeJS.EventEmitter;
    } )
    .on( "error", function (this: Event, exception?: Error, descriptor?: FS.Dirent, statistics?: FS.Stats) {
        console.error( "Error" + ":", exception, descriptor, statistics );
        return this as NodeJS.EventEmitter;
    } )
    .on( "end", function () {
        console.log( "Complete" );
    } );

walker.walk(".");

export type { FS };
export type { Stats } from "fs";
export type { Dirent } from "fs";
