var libnotify = require( '../lib/libnotify.js' ) ;

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

