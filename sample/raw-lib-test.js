/*
	The Cedric's Swiss Knife (CSK) - CSK libnotify

	Copyright (c) 2015 Cédric Ronvel 
	
	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/





var ref = require( 'ref' ) ;
var libnotify = require( '../lib/libnotify.js' ) ;






			/* Tests */



var ret ;

ret = libnotify.lib.notify_init( 'my-app' ) ;
console.log( 'notify_init():' , ret ) ;

ret = libnotify.lib.notify_is_initted() ;
console.log( 'notify_is_initted():' , ret ) ;

console.log( 'notify_get_app_name():' , libnotify.lib.notify_get_app_name() ) ;

libnotify.lib.notify_set_app_name( 'bob app' ) ;
console.log( 'notify_get_app_name():' , libnotify.lib.notify_get_app_name() ) ;



var PtrPtr = ref.refType( 'pointer' ) ;
var StringPtr = ref.refType( 'string' ) ;
var StringPtrPtr = ref.refType( StringPtr ) ;

//*
var name = ref.alloc( StringPtr ) ;
var vendor = ref.alloc( StringPtr ) ;
var version = ref.alloc( StringPtr ) ;
var spec_version = ref.alloc( StringPtr ) ;
//*/
//console.log( '\nBefore notify_get_server_info():\n' , name , vendor , version , spec_version ) ;
libnotify.lib.notify_get_server_info( name , vendor , version , spec_version ) ;
//console.log( '\nAfter notify_get_server_info():\n' , name , vendor , version , spec_version ) ;
name = name.deref().readCString() ;
vendor = vendor.deref().readCString() ;
version = version.deref().readCString() ;
spec_version = spec_version.deref().readCString() ;
console.log( 'After notify_get_server_info():\n\tname: %s\n\tvendor: %s\n\tversion: %s\n\tspec version: %s\n' , name , vendor , version , spec_version ) ;
//console.log( '\n' ) ;

var notif = libnotify.lib.notify_notification_new( 'Supa test!' , 'Hey! Hellooooow world!' , __dirname + '/log.png' ) ;
//var notif = libnotify.lib.notify_notification_new( 'Supa test!' , 'Hey! Hellooooow world!' , null ) ;
console.log( 'notify_notification_new():' , notif ) ;

// This create a pointer to a null pointer.
// Libnotify want that.
// The pointer of pointer will point to a non-null pointer if something bad happens.
var gerror = ref.NULL.ref() ;
console.log( 'gerror:' , gerror ) ;

libnotify.lib.notify_notification_set_urgency( notif , 1 ) ;


// Create the main loop, usefull to get response from the user
var loop = libnotify.lib.g_main_loop_new( ref.NULL , false ) ;



var myCallback = function( notification , action , userDataPtr_ )
{
	console.log( '\n\nMy callback:' , action , "\n" ) ;
	console.log( 'arguments:' ,  arguments , '\n' ) ;
	console.log( 'userDataPtr:' , userDataPtr ) ;
	console.log( 'userDataPtr.deref():' , userDataPtr.deref() ) ;
	console.log( 'userDataPtr_:' , userDataPtr_ ) ;
	console.log( 'userDataPtr_.deref():' , userDataPtr_.deref() ) ;
	console.log( '\n\n' ) ;
	
	libnotify.lib.g_main_loop_quit( loop ) ;
	
	setTimeout( function() {} , 1000 ) ;
} ;

var userData = { one: 1 , two: 2 } ;
var userDataPtr = ref.alloc( 'Object' , userData ) ;
var ObjectPtr = ref.refType( 'Object' ) ;
console.log( 'userDataPtr:' , userDataPtr ) ;
console.log( 'userDataPtr.deref():' , userDataPtr.deref() ) ;



//libnotify.lib.notify_notification_add_action( notif , 'ok' , 'ok!' , myCallback , userDataPtr , freeCallback ) ;

libnotify.lib.notify_notification_add_action( notif , 'ok' , 'ok!' , myCallback , userDataPtr , null ) ;
libnotify.lib.notify_notification_add_action( notif , 'nope' , 'nope!' , myCallback , userDataPtr , null ) ;
libnotify.lib.notify_notification_add_action( notif , 'never' , 'never!' , myCallback , userDataPtr , null ) ;

// action = default is a special case: this is what we get when the notif is clicked (not a button)
libnotify.lib.notify_notification_add_action( notif , 'default' , 'default' , myCallback , userDataPtr , null ) ;




ret = libnotify.lib.notify_notification_show( notif , gerror ) ;
console.log( 'notify_notification_show():' , ret ) ;
console.log( 'gerror:' , gerror ) ;


//*
var proxy = libnotify.lib.g_dbus_proxy_new_for_bus_sync(
	2 ,
	1 ,
	ref.NULL ,
	"org.freedesktop.Notifications" ,
	"/org/freedesktop/Notifications" ,
	"org.freedesktop.Notifications" ,
	ref.NULL ,
	gerror
) ;

console.log( "g_dbus_proxy_new_for_bus_sync():" , proxy , gerror ) ;

var proxyCb = function()
{
	console.log( "\n>>> proxyCb:" , arguments ) ;
} ;

var handler = libnotify.lib.g_signal_connect_object( proxy , "g-signal" , proxyCb , notif , 0 ) ;
//*/

// Without this, we can't get the action callback triggered, even if we setTimeout().
// This is a blocking call.
console.log( "Before g_main_loop_run()" ) ;
//libnotify.lib.g_main_loop_run( loop ) ;

//* Non-blocking version using node-ffi .async() feature, that create a thread for the call
libnotify.lib.g_main_loop_run.async( loop , function( error , result ) {
	console.log( "Async call finished! Arguments:" , arguments ) ;
} ) ;
//*/

// This will not be logged, until g_main_loop_quit() is called
console.log( "After g_main_loop_run()" ) ;

/*
setTimeout( function() {
	ret = libnotify.lib.notify_notification_update( notif , 'Mega test!' , 'Rewrite!' , __dirname + '/log.png' ) ;
	console.log( 'notify_notification_update():' , ret ) ;

	ret = libnotify.lib.notify_notification_show( notif , gerror ) ;
	console.log( 'notify_notification_show():' , ret ) ;
	console.log( 'gerror:' , gerror ) ;
} , 500 ) ;
//*/
