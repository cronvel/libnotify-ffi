
var libnotify = require( '../lib/libnotify.js' ) ;

libnotify.createNotification( {
	summary: 'Hello world!' ,
	body: 'This is a <i>Hello world</i> sample code. <b>Thanks for your attention...</b><a href="http://google.com">google</a>' ,
	iconPath: 'appointment-new' ,
} ).push() ;
