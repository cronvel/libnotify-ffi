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



// Load modules
var ref = require( 'ref' ) ;



var libnotify = {} ;
module.exports = libnotify ;

libnotify.dl = require( './dl.js' ) ;



Object.defineProperty( libnotify , 'lib' , {
	enumerable: true ,
	configurable: true ,
	get: function() {
		var lib = libnotify.dl() ;
		Object.defineProperty( libnotify , 'lib' , { value: lib , enumerable: true } ) ;
		return lib ;
	}
} ) ;



var StringPtr = ref.refType( 'string' ) ;



var isInit = false ;

libnotify.init = function init( appName )
{
	if ( isInit ) { return ; }
	isInit = libnotify.lib.notify_init( appName && typeof appName === 'string' ? appName : 'libnotify-ffi' ) ;
} ;



libnotify.reset = function reset()
{
	if ( ! isInit ) { return ; }
	libnotify.lib.notify_uninit() ;
	isInit = false ;
} ;



libnotify.setAppName = function setAppName( appName )
{
	if ( ! appName || typeof appName !== 'string' ) { return ; }
	if ( ! isInit ) { return libnotify.init( appName ) ; }
	libnotify.lib.notify_set_app_name( appName ) ;
} ;



libnotify.getAppName = function getAppName()
{
	if ( ! isInit ) { libnotify.init() ; }
	return libnotify.lib.notify_get_app_name() ;
} ;



libnotify.getServerInfo = function getServerInfo()
{
	if ( ! isInit ) { libnotify.init() ; }
	
	var name = ref.alloc( StringPtr ) ;
	var vendor = ref.alloc( StringPtr ) ;
	var version = ref.alloc( StringPtr ) ;
	var specVersion = ref.alloc( StringPtr ) ;
	
	libnotify.lib.notify_get_server_info( name , vendor , version , specVersion ) ;
	
	return {
		name: name.deref().readCString() ,
		vendor: vendor.deref().readCString() ,
		version: version.deref().readCString() ,
		specVersion: specVersion.deref().readCString()
	} ;
} ;



function Notification( data ) { return libnotify.createNotification( data ) ; }
libnotify.Notification = Notification ;



libnotify.createNotification = function createNotification( data )
{
	if ( ! isInit ) { libnotify.init() ; }
	
	var notification = Object.create( Notification.prototype , {
		internalNotification: { value: null , enumerable: true , writable: true } ,
		pushed: { value: false , enumerable: true , writable: true } ,
		summary: { value: '' , enumerable: true , writable: true } ,
		body: { value: null , enumerable: true , writable: true } ,
		iconPath: { value: null , enumerable: true , writable: true } ,
		urgency: { value: 1 , enumerable: true , writable: true } ,
		timeout: { value: -1 , enumerable: true , writable: true } ,
		appName: { value: null , enumerable: true , writable: true } ,
		category: { value: null , enumerable: true , writable: true } ,
		actions: { value: null , enumerable: true , writable: true } ,
		runningLoop: { value: false , enumerable: true , writable: true } ,
		//gMainLoop: { value: null , enumerable: true , writable: true } ,
	} ) ;
	
	notification.update( data ) ;
	
	return notification ;
} ;



function notificationCallback( actionId , userData , userCallback )
{
	//console.log( ">>>> notificationCallback:" , arguments ) ;
	
	if ( typeof userCallback === 'function' ) { userCallback( this , actionId , userData ) ; }
	
	if ( this.runningLoop ) { this.stopLoop() ; }
}



// Create the notification on the C-lib side
Notification.prototype.create = function create()
{
	var k ;
	
	if ( this.internalNotification ) { return ; }
	
	this.internalNotification = libnotify.lib.notify_notification_new( this.summary , this.body , this.iconPath ) ;
	
	if ( this.timeout !== -1 )
	{
		libnotify.lib.notify_notification_set_timeout( this.internalNotification , this.timeout ) ;
	}
	
	if ( this.appName )
	{
		libnotify.lib.notify_notification_set_app_name( this.internalNotification , this.appName ) ;
	}
	
	if ( this.category )
	{
		libnotify.lib.notify_notification_set_category( this.internalNotification , this.category ) ;
	}
	
	if ( this.actions )
	{
		for ( k in this.actions )
		{
			//console.log( '>>>>>>>' , k , ':' , this.actions[ k ] ) ;
			
			libnotify.lib.notify_notification_add_action(
				this.internalNotification ,
				k ,
				this.actions[ k ].label ,
				this.actions[ k ].callback ,
				null ,	// don't bother the lib with this userData stuff here, let the JS callback handle that for us
				null	// we don't send userData to the lib, so we don't care about the GFreeFunc
			) ;
			
			// Always set urgency to 'critical' when an action callback is set: the dialog box should not disappear!
			this.urgency = 2 ;
		}
	}
	
	if ( this.urgency !== 1 )
	{
		libnotify.lib.notify_notification_set_urgency( this.internalNotification , this.urgency ) ;
	}
} ;



Notification.prototype.update = function update( data )
{
	var k , action , ret , gerror ;
	
	if ( data.summary || data.body || data.iconPath )
	{
		if ( data.summary ) { this.summary = data.summary ; }
		if ( data.body ) { this.body = data.body ; }
		if ( data.iconPath ) { this.iconPath = data.iconPath ; }
		
		if ( this.internalNotification )
		{
			libnotify.lib.notify_notification_update( this.internalNotification , this.summary , this.body , this.iconPath ) ;
		}
	}
	
	
	if ( typeof data.timeout === 'number' )
	{
		this.timeout = Math.round( data.timeout ) ;
		
		if ( this.internalNotification )
		{
			libnotify.lib.notify_notification_set_timeout( this.internalNotification , this.timeout ) ;
		}
	}
	
	if ( typeof data.appName === 'string' )
	{
		this.appName = data.appName ;
		
		if ( this.internalNotification )
		{
			libnotify.lib.notify_notification_set_app_name( this.internalNotification , this.appName ) ;
		}
	}
	
	if ( typeof data.category === 'string' )
	{
		this.category = data.category ;
		
		if ( this.internalNotification )
		{
			libnotify.lib.notify_notification_set_category( this.internalNotification , this.category ) ;
		}
	}
	
	if ( data.actions !== undefined )
	{
		if ( this.actions && this.internalNotification )
		{
			libnotify.lib.notify_notification_clear_actions( this.internalNotification ) ;
		}
		
		if ( typeof data.actions === 'object' )
		{
			this.actions = {} ;
			
			for ( k in data.actions )
			{
				action = data.actions[ k ] ;
				
				if ( ! action || typeof action !== 'object' ) { continue ; }
				
				if ( ! action.label ) { action.label = ' ' ; }
				if ( ! action.userData ) { action.userData = null ; }
				
				if ( k === 'close' )
				{
					// 'close' is a special case
					this.closeAction = notificationCallback.bind( this , k , action.userData , action.callback ) ;
					continue ;
				}
				
				action.callback = notificationCallback.bind( this , k , action.userData , action.callback ) ;
				
				this.actions[ k ] = action ;
				
				// Always set urgency to 'critical' when an action callback is set: the dialog box should not disappear!
				data.urgency = 2 ;
				
				if ( this.internalNotification )
				{
					libnotify.lib.notify_notification_add_action(
						this.internalNotification ,
						k ,
						action.label ,
						action.callback ,
						null ,	// don't bother the lib with this userData stuff here, let the JS callback handle that for us
						null
					) ;
				}
			}
		}
		else
		{
			this.actions = null ;
		}
	}
	
	if ( data.urgency !== undefined && data.urgency !== this.urgency )
	{
		switch ( data.urgency )
		{
			case 0 :
			case 'low' :
				this.urgency = 0 ;
				break ;
			case 1 :
			case 'normal' :
				this.urgency = 1 ;
				break ;
			case 2 :
			case 'critical' :
				this.urgency = 2 ;
				break ;
			default :
				this.urgency = 1 ;
		}
		
		if ( this.internalNotification )
		{
			libnotify.lib.notify_notification_set_urgency( this.internalNotification , this.urgency ) ;
		}
	}
	
	if ( this.pushed )
	{
		gerror = ref.NULL.ref() ;
		ret = libnotify.lib.notify_notification_show( this.internalNotification , gerror ) ;
	}
} ;



function proxyCallback()
{
	//console.log( ">>>> proxyCallback:" , arguments ) ;
	
	if ( arguments[ 2 ] === 'NotificationClosed' && this.closeAction ) { this.closeAction() ; }
	
	if ( this.runningLoop ) { this.stopLoop() ; }
}



function timeoutCallback()
{
	//console.log( ">>>> timeoutCallback:" , arguments ) ;
	
	if ( this.runningLoop ) { this.stopLoop() ; }
	return false ;
}



Notification.prototype.show =
Notification.prototype.push = function push( options , finishCallback )
{
	var ret , gerror = ref.NULL.ref() ;
	
	// Arguments management
	if ( typeof options === 'function' ) { finishCallback = options ; options = {} ; }
	else if ( ! options || typeof options !== 'object' ) { options = {} ; }
	
	if ( finishCallback && typeof finishCallback !== 'function' ) { finishCallback = null ; }
	
	
	// Create the notification, if necessary
	if ( ! this.internalNotification ) { this.create() ; }
	
	// Show the notification
	ret = libnotify.lib.notify_notification_show( this.internalNotification , gerror ) ;
	
	// Should be handled by the lib later, creating a JS Error instance
	if ( ! ret ) { return gerror ; }
	
	this.pushed = true ;
	
	// Now the hardest part: manage action callback
	if ( this.actions || finishCallback )
	{
		if ( ! libnotify.gMainLoop ) { libnotify.gMainLoop = libnotify.lib.g_main_loop_new( ref.NULL , false ) ; }
		
		this.runningLoop = true ;
		
		this.dbusProxy = libnotify.lib.g_dbus_proxy_new_for_bus_sync(
			2 ,
			1 ,
			ref.NULL ,
			'org.freedesktop.Notifications' , 
			'/org/freedesktop/Notifications' ,
			'org.freedesktop.Notifications' ,
			ref.NULL ,
			gerror
		) ;
		
		this.dbusProxySignalHandler = libnotify.lib.g_signal_connect_object(
			this.dbusProxy ,
			'g-signal' ,
			proxyCallback.bind( this ) ,
			this.internalNotification ,
			0
		) ;
		
		/*
			Soooooooooooooo....... This broken notification lib and spec DO NOT TELL US WHEN THE NOTIF TIMEOUT.
			That's so silly... Once a button with an action callback is set, we NEED to know if the notification is still
			running (i.e. the user is slowly reading the text, or is away from this computer), or if the notification server
			has dismiss it due to timeout.
			
			Fine.
			
			We have 2 things to do to overcome that silly defective design:
				- use node-ffi async execution, so the whole event loop won't be blocked (at the cost of a thread)
				- add a timeout to the g_loop to destroy it in any case, so we are not leaking resource and thread like hell
		*/
		this.timerId = libnotify.lib.g_timeout_add(
			options.timeout || ( this.urgency >= 2 ? 60000 : 10000 ) ,	// default timeout: 60s for critical notif, 10s for others
			timeoutCallback.bind( this ) ,
			ref.NULL
		) ;
		
		libnotify.lib.g_main_loop_run.async( libnotify.gMainLoop , function( error ) {
			//console.log( "Async call finished! Arguments:" , arguments ) ;
			if ( finishCallback ) { finishCallback( error ) ; }
		} ) ;
	}
	
	
	return ;
} ;



Notification.prototype.stopLoop = function stopLoop()
{
	libnotify.lib.g_signal_handler_disconnect(
		this.dbusProxy ,
		this.dbusProxySignalHandler
	) ;
	
	libnotify.lib.g_object_unref( this.dbusProxy ) ;
	
	this.runningLoop = false ;
	
	libnotify.lib.g_main_loop_quit( libnotify.gMainLoop ) ;
} ;



Notification.prototype.close = function close()
{
	var ret , gerror = ref.NULL.ref() ;
	libnotify.lib.notify_notification_close( this.internalNotification , gerror ) ;
	
	if ( ret ) { return ; }
	
	// Should be handled by the lib later, creating a JS Error instance
	return gerror ;
} ;


