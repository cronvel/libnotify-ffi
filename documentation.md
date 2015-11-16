

# Libnotify

A node module providing a high-level API for *libnotify*, as well as lower level access to raw *libnotify* bindings:
this allow your program to display a nice and unobstrusive notification popup.

This works on all OS having a support for the spec *org.freedesktop.Notifications* (mostly Linux desktops).

Most node library for *libnotify* are in fact spawning a new process and executing the command line utility *notify-send*,
which is super-slow and does not provide all of *libnotify* features, like buttons with action callback.

This module loads the dynamic library (libnotify.so) and provides bindings for its C functions through node-ffi
(Foreign Function Interface).



## Getting started!

This lib is super simple to use, here is the most most common use-case:

```js
var libnotify = require( 'libnotify-ffi' ) ;

libnotify.createNotification( {
	summary: 'Hello world!' ,
	body: 'This is a <i>Hello world</i> sample code. <b>Thanks for your attention...</b>' ,
	iconPath: 'appointment-new' ,
} ).push() ;
```

This will display an unobstrusive notification popup with "Hello world!" as the title, and a body message featuring
italic and bold markup.

Note that the *org.freedesktop.Notifications* spec only support italic, bold and underline.
HTML link are said to be working, but they are not implemented at the moment (tested on the latest Gnome desktop).

Also note that *iconPath* can be either a full path to an image, or a stock image existing on your desktop environment.

Here another example featuring **buttons** and **actions callback**:

```js
var libnotify = require( 'libnotify-ffi' ) ;

var notif = libnotify.createNotification( {
	summary: 'Hello world!' ,
	body: 'This is a <i>Hello world</i> sample code. <b>Thanks for your attention...</b>' ,
	iconPath: __dirname + '/log.png' ,
	actions: {
		default: {
			callback: function() { console.log( 'Default action!' ) ; }
		} ,
		close: {
			callback: function() { console.log( 'Close action!' ) ; }
		} ,
		ok: {
			label: 'OK!' ,
			callback: function() { console.log( '"OK" was clicked!' ) ; }
		} ,
		nope: {
			label: 'Nope!' ,
			callback: function() { console.log( '"Nope" was clicked!' ) ; }
		}
	}
} ) ;

notif.push( function() {
	console.log( 'Notification closed!' ) ;
} ) ;
```

This popup will have two buttons: *'OK!'* and *'Nope!'*.

The *default* and *close* callback does not create buttons, they are special cases:

* the *default* callback is triggered if the user click the notification, but not any button
* the *close* callback is triggered if the user close the notification, either by clicking the close button or by clicking
	the notification itself if there is no *default* callback registered

One of the four action callbacks will be triggered, then the `.push()` callback.



## Method reference - High-level API

#### .init( appName )

* appName `string` (optional) the name of the application, default to libnotify-ffi

This method will init *libnotify* with the given application name.
The application name is **NOT** displayed, but the notification server needs it for some reason.

**Note that you do not need to call this method, it is automatically called the first time you will create a notification.**



#### .reset()

This method will reset (de-init) *libnotify*.
Useful only if you will never send notifications anymore.



#### .setAppName( appName )

* appName `string` (optional) the name of the application, default to libnotify-ffi

This will set the given application name.
The application name is **NOT** displayed.



#### .getAppName()

This will get the application name currently configured.



#### .getServerInfo()

Returns an object containing server info, where:

* name `string` the name of the server (e.g. "gnome-shell")
* vendor `string` the vendor name (e.g. "GNOME")
* version `string` the version of the server
* specVersion `string` the version of the *org.freedesktop.Notifications* spec implemented by the server



#### .createNotification( data )

* data `Object` contains the data of the notification, where:
	* summary `string` the title/summary of the notification
	* body `string` the body of the notification, supporting HTML tags `<b>`, `<i>` and `<u>`
	* iconPath `string` (optional) either a full path to an image, or a stock image existing on your desktop environment
	* urgency `mixed` (optional, default to 1/*normal*) this is the urgency level for this notification, the value can be:
		* 0/*low*
		* 1/*normal*
		* 2/*critical* (critical notification does not timeout)
	* timeout `number` (optional) the timeout before the notification disappears in *ms* (rarely implemented by notification servers)
	* appName `string` (optional) override the global libnotify application name
	* category `string` (optional) a category name, **NOT** displayed, probably useful for the notification server but not mandatory.
	  Most probably some notification servers will provide filters to users somewhere in the future, and this category would be
	  used for that.
	* actions `Object` an object of actions, where:
		* default `Object` object containing a callback to be triggered when the user click the notification, but not any button:
			* callback `Function` the callback to trigger if the action occurs
		* close `Object` object containing a callback to be triggered when the user close the notification, either by clicking
		  the close button or by clicking the notification itself if there is no *default* callback registered:
			* callback `Function` the callback to trigger if the action occurs
		* *anything else* `Object` object containing a button to attach to the notification and a callback:
			* label `string` the label of the button to create
			* callback `Function` the callback to trigger if the action occurs

It returns a `libnotify.Notification` instance.



### Notification Class

#### Notification#update( data )

* data `Object` contains the data of the notification, where:
	* summary `string` the title/summary of the notification
	* body `string` the body of the notification, supporting HTML tags `<b>`, `<i>` and `<u>`
	* iconPath `string` (optional) either a full path to an image, or a stock image existing on your desktop environment
	* urgency `mixed` (optional, default to 1/*normal*) this is the urgency level for this notification, the value can be:
		* 0/*low*
		* 1/*normal*
		* 2/*critical* (critical notification does not timeout)
	* timeout `number` (optional) the timeout before the notification disappears in *ms* (rarely implemented by notification servers)
	* appName `string` (optional) override the global libnotify application name
	* category `string` (optional) a category name, **NOT** displayed, probably useful for the notification server but not mandatory.
	  Most probably some notification servers will provide filters to users somewhere in the future, and this category would be
	  used for that.
	* actions `Object` an object of actions, where:
		* default `Object` object containing a callback to be triggered when the user click the notification, but not any button:
			* callback `Function` the callback to trigger if the action occurs
		* close `Object` object containing a callback to be triggered when the user close the notification, either by clicking
		  the close button or by clicking the notification itself if there is no *default* callback registered:
			* callback `Function` the callback to trigger if the action occurs
		* *anything else* `Object` object containing a button to attach to the notification and a callback:
			* label `string` the label of the button to create
			* callback `Function` the callback to trigger if the action occurs

Update the notification.

If the notification has been already pushed, it attempts to modify it.

**Note:** some server like Gnome will lose all action buttons when updating a notification already pushed. This is not a bug
of *libnotify-ffi*, but a bug of Gnome itself (actions are correctly pushed to DBus).





