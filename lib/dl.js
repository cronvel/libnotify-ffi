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





			/* Dynamic Library loading and bindings */





var ref = require( 'ref-napi' ) ;
var ffi = require( 'ffi-napi' ) ;



var PtrPtr = ref.refType( 'pointer' ) ;
var StringPtr = ref.refType( 'string' ) ;
var ObjectPtr = ref.refType( 'Object' ) ;



var NotifyActionCallback = ffi.Function( 'void' , [ 'pointer' , 'string' , ObjectPtr ] ) ;

var GSourceFunc = ffi.Function( 'bool' , [ 'pointer' ] ) ;

var ProxyCallback = ffi.Function( 'void' , [
	'pointer' ,	// proxy
	'string' ,	// sender_name
	'string' ,	// signal_name
	'pointer' ,	// parameters
	'pointer'	// notification
] ) ;

var GFreeFunc = ffi.Function( 'void' , [ 'pointer' ] ) ;



var libnotifyApi = {
	
	// https://developer.gnome.org/libnotify/unstable/libnotify-notify.html
	
	notify_init: [		// Init libnotify, this must be called before any other functions. 
		'bool' , [		// return success
			'string'	// app name
	] ] ,
	
	notify_uninit: [ 'void' , [] ] ,	// This should be called when the program no longer needs libnotify.
	
	notify_is_initted:		// Gets whether or not libnotify is initialized.
		[ 'bool' , [] ] ,	// return init or not
	
	notify_get_app_name: [	// Get the registered application name
		'string' , [] ] ,	// return the name
	
	notify_set_app_name: [	// Set the application name
		'void' , [
			'string'		// app name
	] ] ,
	
	//notify_get_server_caps: [ GList , [ 'string' ] ] ,
	
	notify_get_server_info: [	// Synchronously queries the server for its information.
		'bool' , [				// return success
			StringPtr ,			// return the name
			StringPtr ,			// return the vendor
			StringPtr ,			// return the version
			StringPtr			// return the spec version
	] ] ,
	
	// https://developer.gnome.org/libnotify/unstable/NotifyNotification.html
	
	notify_notification_new: [	// Creates a new NotifyNotification. Summary is required, but all other parameters are optional.
		'pointer' , [			// return a pointer to the NotifyNotification
			'string' ,			// summary (title)
			'string' ,			// body
			'string'			// icon path
	] ] ,
	
	notify_notification_update: [	// Updates the notification text and icon.
		'bool' , [					// return success
			'pointer' ,				// pointer to the NotifyNotification object
			'string' ,				// summary (title)
			'string' ,				// body
			'string'				// icon path
	] ] ,
	
	notify_notification_show: [	// Send the notification to the notification server so it will display it on screen. 
		'bool' , [				// return success
			'pointer' ,			// pointer to the NotifyNotification object
			PtrPtr				// GError**
	] ] ,
	
	notify_notification_close: [	// Close the notification
		'bool' , [					// return success
			'pointer' ,				// pointer to the NotifyNotification object
			PtrPtr					// GError**
	] ] ,
	
	notify_notification_set_app_name: [	// Override the application name
		'void' , [
			'pointer' ,					// pointer to the NotifyNotification object
			'string'					// app name
	] ] ,
	
	notify_notification_set_category: [	// Set the category
		'void' , [
			'pointer' ,					// pointer to the NotifyNotification object
			'string'					// category name
	] ] ,
	
	notify_notification_set_timeout: [	// Set the timeout of the notification.
		'void' , [
			'pointer' ,					// pointer to the NotifyNotification object
			'int'						// timeout in ms
	] ] ,
	
	notify_notification_set_urgency: [	// Set the urgency level of the notification.
		'void' , [
			'pointer' ,					// pointer to the NotifyNotification object
			'int'						// urgency -- 0: low, 1: normal, 2: critical
	] ] ,
	
	notify_notification_add_action: [	// Adds an action to a notification, that will trigger the providden callback when invoked,
										// along with the value passed to user_data. 
		'void' , [
			'pointer' ,					// pointer to the NotifyNotification object
			'string' ,					// action ID
			'string' ,					// human readable action label
			NotifyActionCallback , 		// the action's callback
			'pointer',					// user_data structure (optional) that will be passed to the callback
			'pointer' //GFreeFunc		// free_func (optional) function to free user_data when the notification is destroyed
										// but we don't care at all
	] ] ,
	
	notify_notification_clear_actions: [	// Clear all actions
		'void' , [
			'pointer'						// pointer to the NotifyNotification object
	] ] ,
	
	// It's not a part of libnotify but it is included in the ".so".
	// This is necessary to get those callback working when using with notify_notification_add_action().
	// https://developer.gnome.org/glib/stable/glib-The-Main-Event-Loop.html
	
	g_main_loop_new: [	// Create a new GMainLoop
		'pointer' , [	// return a GMainLoop
			'pointer' ,	// pointer to a GMainContext *context, it can be NULL
			'bool'		// is_running, not important, set it to false
	] ] ,
	
	g_main_loop_run: [	// Runs a main loop until g_main_loop_quit() is called on the loop. If this is called for the thread
						// of the loop's GMainContext, it will process events from the loop, otherwise it will simply wait.
		'void' , [
			'pointer'	// pointer to a GMainLoop to run
	] ] ,
	
	g_main_loop_quit: [	// Stops a GMainLoop from running. Any calls to g_main_loop_run() for the loop will return.
		'void' , [
			'pointer'	// pointer to a GMainLoop to quit
	] ] ,
	
	
	// Gnome signal documentation (signal = event, in the Gnome terminology)
	// https://developer.gnome.org/gobject/stable/signal.html
	// https://developer.gnome.org/gobject/stable/gobject-Signals.html#g-signal-connect
	
	g_signal_connect_object: [		// "connect" to a "signal" emitter (e.g. to an event emitter)
		'int' , [			// an handler ID
			'pointer' ,		// instance, a DBus proxy returned by g_dbus_proxy_new_for_bus_sync()
			'string' ,		// detailed_signal, use 'g-signal'
			ProxyCallback ,	// the callback
			'pointer' ,		// gobject
			'int'			// connect_flags
	] ] ,
	
	g_signal_handler_disconnect: [		// "disconnect" to a "signal" emitter
		'void' , [			// an handler ID
			'pointer' ,		// instance, a DBus proxy returned by g_dbus_proxy_new_for_bus_sync()
			'int'			// an handler ID returned by g_signal_connect_object()
	] ] ,
	
	g_timeout_add: [		// this is the gnome equivalent of setTinterval()
		'int' , [			// a timer ID
			'int' ,			// interval in ms
			GSourceFunc ,	// callback function
			'pointer'		// data
	] ]
	
} ;



var libnotify ;



function dl( path )
{
	// Already loaded? return it!
	if ( libnotify ) { return libnotify ; }
	
	if ( path )
	{
		libnotify = ffi.Library( path , libnotifyApi ) ;
	}
	else
	{
		try {
			libnotify = ffi.Library( '/usr/lib/libnotify.so' , libnotifyApi ) ;
		}
		catch ( error ) {
			// Try to load the lib in '/usr/lib64/' instead
			libnotify = ffi.Library( '/usr/lib64/libnotify.so' , libnotifyApi ) ;
		}
	}
	
	libnotify.NotifyActionCallback = NotifyActionCallback ;
	libnotify.GFreeFunc = GFreeFunc ;
	
	return libnotify ;
}



module.exports = dl ;


