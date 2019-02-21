const CONFIG = {
	BASEURL:window.location.host=='localhost'? window.location.protocol + "//" + window.location.host + "/moov/api/v2":"http://themoovapp.com/api/v2",
	//BASEURL:window.location.protocol + "//" + window.location.host + "/api/v2"
}
if (alertify) {
	//alertify.defaults.transition = "slide";
	alertify.defaults.theme.ok = "btn btn-primary";
	alertify.defaults.theme.cancel = "btn btn-danger";
	alertify.defaults.theme.input = "form-control";
	alertify.notifier = {
		// auto-dismiss wait time (in seconds)  
		delay: 0,
		// default position
		position: 'top-right',
		// adds a close button to notifier messages
		closeButton: true
	};
	alertify.defaults.glossary = {
		// dialogs default title
		//title: 'Alert!',
		// ok button text
		ok: 'OK',
		// cancel button text
		cancel: 'Cancel'
	};
}


const filters = {
	users: {
		page: 1,
		limit: 20,
		a: false,
		s: false,
		d: false,
		school: null,
		keyword: "",
		filter_role:null
	},
	rides: {
		page: 1,
		limit: 20,
		for: "user",
		id: 0,
		keyword: "",
		date: ""
	},
	transactions: {
		page: 1,
		limit: 20,
		school: "",
		keyword: "",
		date: ""
	},
	supports: {
		page: 1,
		limit: 20,
		school: "",
		keyword: ""
	},
	drivers: {
		page: 1,
		limit: 20,
		school: null,
		keyword: ""
	}
};