/*
	The Cedric's Swiss Knife (CSK) - CSK logger toolbox

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

/* global describe, it */




var ref = require( 'ref' ) ;
var libnotify = require( '../lib/libnotify.js' ) ;
//var async = require( 'async-kit' ) ;
//var expect = require( 'expect.js' ) ;






			/* Tests */



describe( "..." , function() {
	
	it( "..." , function( done ) {
		
		this.timeout( 5000 ) ;
		
		var ret ;
		
		ret = libnotify.notify_init( 'my-app' ) ;
		console.log( 'notify_init():' , ret ) ;

		ret = libnotify.notify_is_initted() ;
		console.log( 'notify_is_initted():' , ret ) ;

		console.log( 'notify_get_app_name():' , libnotify.notify_get_app_name() ) ;

		libnotify.notify_set_app_name( 'bob app' ) ;
		console.log( 'notify_get_app_name():' , libnotify.notify_get_app_name() ) ;



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
		libnotify.notify_get_server_info( name , vendor , version , spec_version ) ;
		//console.log( '\nAfter notify_get_server_info():\n' , name , vendor , version , spec_version ) ;
		name = name.deref().readCString() ;
		vendor = vendor.deref().readCString() ;
		version = version.deref().readCString() ;
		spec_version = spec_version.deref().readCString() ;
		console.log( 'After notify_get_server_info():\n\tname: %s\n\tvendor: %s\n\tversion: %s\n\tspec version: %s\n' , name , vendor , version , spec_version ) ;
		//console.log( '\n' ) ;

		var notif = libnotify.notify_notification_new( 'Supa test!' , 'Hey! Hellooooow world!' , __dirname + '/log.png' ) ;
		//var notif = libnotify.notify_notification_new( 'Supa test!' , 'Hey! Hellooooow world!' , null ) ;
		console.log( 'notify_notification_new():' , notif ) ;

		// This create a pointer to a null pointer.
		// Libnotify want that.
		// The pointer of pointer will point to a non-null pointer if something bad happens.
		var gerror = ref.NULL.ref() ;
		console.log( 'gerror:' , gerror ) ;

		libnotify.notify_notification_set_urgency( notif , 2 ) ;


		// Create the main loop, usefull to get response from the user
		var loop = libnotify.g_main_loop_new( ref.NULL , false ) ;



		var myCallback = function( notification , action , userDataPtr_ )
		{
			console.log( '\n\nMy callback:' , action , "\n" ) ;
			console.log( 'arguments:' ,  arguments , '\n' ) ;
			console.log( 'userDataPtr:' , userDataPtr ) ;
			console.log( 'userDataPtr.deref():' , userDataPtr.deref() ) ;
			console.log( 'userDataPtr_:' , userDataPtr_ ) ;
			console.log( 'userDataPtr_.deref():' , userDataPtr_.deref() ) ;
			console.log( '\n\n' ) ;
			
			libnotify.g_main_loop_quit( loop ) ;
			
			setTimeout( function() {} , 1000 ) ;
		} ;

		var freeCallback = function( pointer )
		{
			console.log( '\n\nfreeCallback: ' , arguments , '\n\n' ) ;
		} ;

		var userData = { one: 1 , two: 2 } ;
		var userDataPtr = ref.alloc( 'Object' , userData ) ;
		var ObjectPtr = ref.refType( 'Object' ) ;
		console.log( 'userDataPtr:' , userDataPtr ) ;
		console.log( 'userDataPtr.deref():' , userDataPtr.deref() ) ;



		//libnotify.notify_notification_add_action( notif , 'ok' , 'ok!' , myCallback , userDataPtr , freeCallback ) ;

		libnotify.notify_notification_add_action( notif , 'ok' , 'ok!' , myCallback , userDataPtr , freeCallback ) ;
		libnotify.notify_notification_add_action( notif , 'nope' , 'nope!' , myCallback , userDataPtr , freeCallback ) ;
		libnotify.notify_notification_add_action( notif , 'never' , 'never!' , myCallback , userDataPtr , freeCallback ) ;

		// action = default is a special case: this is what we get when the notif is clicked (not a button)
		libnotify.notify_notification_add_action( notif , 'default' , 'default' , myCallback , userDataPtr , freeCallback ) ;




		ret = libnotify.notify_notification_show( notif , gerror ) ;
		console.log( 'notify_notification_show():' , ret ) ;
		console.log( 'gerror:' , gerror ) ;



		// Without this, we can't get the action callback triggered, even if we setTimeout().
		// This is a blocking call.
		console.log( "Before g_main_loop_run()" ) ;
		//libnotify.g_main_loop_run( loop ) ;

		//* Non-blocking version using node-ffi .async() feature, that create a thread for the call
		libnotify.g_main_loop_run.async( loop , function( error , result ) {
			console.log( "Async call finished! Arguments:" , arguments ) ;
			done() ;
		} ) ;
		//*/

		// This will not be logged, until g_main_loop_quit() is called
		console.log( "After g_main_loop_run()" ) ;

		/*
		setTimeout( function() {
			ret = libnotify.notify_notification_update( notif , 'Mega test!' , 'Rewrite!' , __dirname + '/log.png' ) ;
			console.log( 'notify_notification_update():' , ret ) ;

			ret = libnotify.notify_notification_show( notif , gerror ) ;
			console.log( 'notify_notification_show():' , ret ) ;
			console.log( 'gerror:' , gerror ) ;
		} , 500 ) ;
		//*/

	} ) ;
	
} ) ;



