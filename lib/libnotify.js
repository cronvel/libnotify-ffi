

var ref = require( 'ref' ) ;
var Struct = require('ref-struct');
var ffi = require( 'ffi' ) ;



var PtrPtr = ref.refType( 'pointer' ) ;
var StringPtr = ref.refType( 'string' ) ;
var StringPtrPtr = ref.refType( StringPtr ) ;
var ObjectPtr = ref.refType( 'Object' ) ;



var NotifyActionCallback = ffi.Function( 'void' , [ 'pointer' , 'string' , ObjectPtr ] ) ;
var GFreeFunc = ffi.Function( 'void' , [ 'pointer' ] ) ;



var libnotify = ffi.Library( '/usr/lib64/libnotify.so.4' , {
//var libnotify = ffi.Library( './src/libnotify/.libs/libnotify.so' , {
	
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
	
	notify_notification_show: [	// Tells the notification server to display the notification on the screen. 
		'bool' , [				// return success
			'pointer' ,			// pointer to the NotifyNotification object
			PtrPtr				// GError**
	] ] ,
	
	notify_notification_set_app_name: [	// Override the application name
		'void' , [
			'pointer' ,					// pointer to the NotifyNotification object
			'string'					// app name
	] ] ,
	
	notify_notification_set_timeout: [	// Sets the timeout of the notification.
		'void' , [
			'pointer' ,					// pointer to the NotifyNotification object
			'int'						// timeout in ms
	] ] ,
	
	// notify_notification_set_category()
	
	notify_notification_set_urgency: [	// Sets the urgency level of the notification.
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
			GFreeFunc					// free_func (optional) function to free user_data when the notification is destroyed
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
	
	//notify_notification_test: [ 'void' , [ 'pointer' ] ] ,
	
} ) ;



libnotify.NotifyActionCallback = NotifyActionCallback ;
libnotify.GFreeFunc = GFreeFunc ;



module.exports = libnotify ;
