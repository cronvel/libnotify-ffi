var libnotify = require('../');

var notif = libnotify.createNotification({
	summary: 'Hello world!',
	body: 'This is a hello world sample',
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
});

notif.push(function() {
	console.log ('Notification closed!');
});
