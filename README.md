

# Libnotify

A node module providing a high-level API for *libnotify*, as well as lower level access to raw *libnotify* bindings:
this allow your program to display a nice and unobstrusive notification popup.

This works on all OS having a support for the spec *org.freedesktop.Notifications* (mostly Linux desktops).

Most node library for *libnotify* are in fact spawning a new process and executing the command line utility *notify-send*,
which is super-slow and does not provide all of *libnotify* features, like buttons with action callback.

This module loads the dynamic library (libnotify.so) and provides bindings for its C functions through node-ffi
(Foreign Function Interface).

You may want to try another module: [freedesktop-notifications](https://www.npmjs.com/package/freedesktop-notifications)
([Github page](https://github.com/cronvel/freedesktop-notifications)).
It achieves the same goal, but it does not rely on *libnotify*, instead it talks directly to *D-Bus*,
implementing the *Freedesktop.org Notifications* spec.



## Getting started!

This lib is super simple to use, here is the most common use-case:

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



## API reference

**Table of content:**

* [.init()](#ref.init)
* [.reset()](#ref.reset)
* [.setAppName()](#ref.setAppName)
* [.getAppName()](#ref.getAppName)
* [.getServerInfo()](#ref.getServerInfo)
* [.createNotification()](#ref.createNotification)
* [The Notification class](#ref.notification)
	* [.update()](#ref.notification.update)
	* [.push()](#ref.notification.push)
	* [.show()](#ref.notification.show)
	* [.close()](#ref.notification.close)
* [Limitations](#ref.limitations)



<a name="ref.init"></a>
### .init( appName )

* appName `string` (optional) the name of the application, default to *'libnotify-ffi'*

This method will init *libnotify* with the given application name.
The application name is **NOT** displayed, but the notification server needs it for some reason.

**Note that you do not need to call this method, it is automatically called the first time you will create a notification.**



<a name="ref.reset"></a>
### .reset()

This method will reset (de-init) *libnotify*.
Useful only if you will never send notifications anymore.



<a name="ref.setAppName"></a>
### .setAppName( appName )

* appName `string` (non-empty) the name of the application

This will configure the application name.
The application name is **NOT** displayed.



<a name="ref.getAppName"></a>
### .getAppName()

This will get the application name currently configured.



<a name="ref.getServerInfo"></a>
### .getServerInfo()

Returns an object containing server info, where:

* name `string` the name of the server (e.g. "gnome-shell")
* vendor `string` the vendor name (e.g. "GNOME")
* version `string` the version of the server
* specVersion `string` the version of the *org.freedesktop.Notifications* spec implemented by the server



<a name="ref.createNotification"></a>
### .createNotification( data )

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

It creates and returns a `Notification` object.



<a name="ref.notification"></a>
## Notification Class

Instances of this *class* represent a notification to be sent.



<a name="ref.notification.update"></a>
### Notification#update( data )

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
of *libnotify-ffi*, but a bug of Gnome itself (actions are correctly pushed to DBus). See [limitations](#ref.limitations).



<a name="ref.notification.push"></a>
### Notification#push( [options] , [finishCallback] ) 

* options `Object` (optional) an object of options, where:
	* timeout `number` the timeout in ms before giving up
* finishCallback `Function` (optional) a callback that will be triggered when the notification will be dismissed

This will send the notification to the notification server so it will be displayed as soon as possible, usually as soon as
the previous notification is dismissed. This is totally dependent to your desktop environment (some implementation may
allow multiple notifications at the same time, but as far as I know, there is no desktop doing that at the moment).

If you define a *finishCallback*, please be aware of [the limitations of the lib](#ref.limitations).

The *timeout* option defines a period of time after which the notification should be assumed to have timed out.
This exists because the notification server never send any event when a notification has actually timed out.
Again, see [the limitations of the lib](#ref.limitations) to understand what happens behind the scene.



<a name="ref.notification.show"></a>
### Notification#show( [options] , [finishCallback] )

Alias of *Notification#push()*. Only exists to be consistent with the *libnotify* terminology. 

This verb is very misleading because it implies that the notification would be displayed right know, which is not always true.
You are encouraged to use *Notification#push()* instead.



<a name="ref.notification.close"></a>
### Notification#close()

This close the notification right now.



<a name="ref.limitations"></a>
## Limitations

Sending a notification in a *fire and forget* fashion works pretty well.

However, advanced feature like buttons with action callback are utterly broken by design in the *org.freedesktop.Notifications* spec,
in notification server implementation and ultimately in the *libnotify* lib itself.

**In fact there is absolutely no mechanism signaling notification expiration**. That's it: the notification server can tell you if 
the user clicked the notification, if a particular button is clicked, or if the user closed the notification, **BUT NOT IF THE SERVER
HAS TIMED OUT YOUR NOTIFICATION!!!** For *fire and forget* it's not important, but if you want to send notifications with buttons,
that's a real problem: as time pass without any callback triggered, how do we know if the notification is still displayed and
the user is simply away from keyboard (thus an action callback has still a chance to be triggered) or if the notification has
been timed out and dismissed by the notification server itself.

Having a button triggering action callback **MUST** imply a timeout callback mechanism...
Sadly nothing changed for years in the spec.

Worse: *libnotify* does not provide an easy way to get our callback response *out of the box*. Internally, *libnotify-ffi* has
to play catch with some low-level gnome API to spawn a **BLOCKING** *g_main_loop*: **it is done in another thread so we do not
actually block anything**.

So you should be aware that:

* if you use the lib in the *fire and forget* mode, you are totally safe: it's fast and reliable
* as soon as you define *one* action callback or even call `Notification#push()` with the *finishCallback*, you are not in the
  trivial *fire and forget* mode anymore
* when not in *fire and forget* mode, each notification you send creates a new thread (that's still faster than other node libraries
  that spawn a whole brand new process to exec the *notify-send* program, also those libraries does not have the action callback
  features anyway...)
* as soon as you add *one* button to your notification, **the urgency level is forced to 'critical'**, because critical notifications
  *SHOULD* not expire (however, that's depend on the server implementation)
* because we can't detect notification expiration, *libnotify-ffi* assumes by default that the notification has expired after 10s 
  for *'low'* and *'normal'* urgency notification, and after 60s for *'critical'* notification: this is important to avoid leaking
  threads like hell. However this can be overridden by setting `options.timeout` to the appropriate value as the first argument
  of `Notification#push()`.
* you can update a *living* notification (i.e: a notification currently displayed), but some server (e.g. Gnome) will remove
  any existing buttons or buttons about to be created (despite the fact that actions are correctly pushed to DBus)...
  so you would probably want to close the notification and create a brand new one if that notification involves buttons.



## License

MIT License. See the `LICENSE` file.
