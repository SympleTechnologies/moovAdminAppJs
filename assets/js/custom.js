//localStorage.setItem('token', '5a1365473e1490c4a1f40054f9e1b360610a06ff2bbe2dd017412335f490dabe');




const msg = {
	success: message => {
		$.notify(message, {
			//position: "right",
			className: "info",
			autoHide: false,
			arrowSize: 5,
			arrowShow: true,
			position: "top right"
		});
	},
	error: message => {
		$.notify(message, {
			//position: "right",
			className: "error",
			autoHide: false,
			arrowSize: 5,
			arrowShow: true,
			position: "top right"
		});
	},
	/**
	 * @param {String} msg
	 * @param {String} title
	 * @returns {Promise<Boolean>} The result of the confirmation
	 */
	confirm: async (msg, title = 'Confirmation!') => {
		return new Promise((resolve, reject) => {
			alertify.confirm(title, msg, function () {
				resolve(true)
			}, function () {
				resolve(false)
			}).resizeTo(100, 100);
		})

	},
	/**
	 * @param {String} title  
	 * @param {String} defaultValue
	 * @returns {Promise<Boolean>} The result of the confirmation
	 */
	prompt: async (title = 'Prompt!', defaultValue = '') => {
		return new Promise((resolve, reject) => {
			alertify.prompt(title, defaultValue, function (ev, value) {
				resolve(value)
			}, function () {
				reject(new Error("Cancled!"))
			}).resizeTo(100, 100);
		})

	},
	/**
	 * 
	 * @returns {Promise<Boolean>} The result of the confirmation
	 */
	closeAll: async (msg) => {
		return new Promise((resolve, reject) => {
			alertify.closeAll(function () {
				resolve(true)
			});
		});
	},
	/**
	 * @param {string} msg
	 * @param {string} title
	 * @param {{basic:Boolean,padding:Boolean,frameless:Boolean}} config
	 * @returns {Promise<Boolean>} The result of the confirmation
	 */
	alert: async (msg, title = 'Message!', config) => {
		/**
		 * , function () {
				reject(new Error("Modal canciled!"))
			}
		 */
		return new Promise((resolve, reject) => {
			alertify.alert(title, msg, function () {
				resolve(true)
			}).set('basic', config ? config.basic : false).set('padding', config ? config.padding : true).set('frameless', config ? config.frameless : false);
		})

	}
};

function toggleCheckbox(sourceElement, className) {
	checkboxes = document.getElementsByClassName(className);
	for (var i = 0, n = checkboxes.length; i < n; i++) {
		checkboxes[i].checked = sourceElement.checked;
	}
}
const filterUser=(status)=>{
      switch(status){
        case 'all':{
			filters.users.a = false;
			filters.users.s = false;
			filters.users.d = false;
			app.getUsers()
           break;
        }
        case 'active':{
			filters.users.a = true; filters.users.s = false; filters.users.d = false; app.getUsers()
           break;
        }
        case 'deactivated':{
			filters.users.d = true; filters.users.a = false; filters.users.s = false; app.getUsers()
           break;
        }
        case 'suspended':{
			filters.users.s = true; filters.users.a = false; filters.users.d = false; app.getUsers()
           break;
		}
		default:{
			console.error("Wrong choice:",status)
		}

        
      }
};

let app = {
	api: CONFIG.BASEURL, //"http://themoovapp.com/api/v2",
	banks: null,
	getBanksLists: async () => {
		try {
			if (app.banks) return app.banks;
			app.loading();
			let route = `${app.api}/wallet/banks`;
			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "GET"
			});
			resp = await result.json();
			let banks = [];
			if (resp.status == true) {
				banks = resp.data;
			} else {
				msg.error(
					"Error occured while processing your request, please check your n"
				);
				return;
			}
			app.banks = banks;
			return banks;
		}
		/* catch(e){
				console.error(e)
				return null;
			} */
		finally {
			app.finished();
		}
	},
	login: async () => {
		app.loading();
		try {
			let data = {
				username: document.getElementById("username").value,
				password: document.getElementById("password").value
			};
			result = await fetch(app.api + "/admin", {
				headers: new Headers({
					"Content-Type": "application/json",
					mode: "no-cors"
				}),
				method: "POST",
				body: JSON.stringify(data)
			});
			resp = await result.json();

			app.finished();

			if (resp.status == 200) {
				localStorage.setItem("token", resp.token);
				localStorage.setItem("home", location.href);
				location.href = "dashboard.html";
			} else {
				msg.error(resp.message);
			}
		} catch (e) {
			app.finished();
		}
	},
	showadduser: async role => {
		switch (role) {
			case "ADMIN":
			case "USER":
			case "DRIVER":
			case "TESTER":
				await app.getSchoolsBackground(document.getElementById("selectschool"));
				document.getElementById("schooldiv").classList.remove("hidden");
				break;
			default:
				document.getElementById("schooldiv").classList.add("hidden");
		}

		msg.alert("<div id='activeModal'>" + $("#addusermodal").html() + "</div>", `Add ${role}`, {
			basic: true,
			padding: false
		})
		$('#activeModal input[name=role]').val(role);
		//.classList.remove("hidden");
	},
	closeadduser: () => {
		//document.getElementById("schooldiv").classList.add("hidden");
		//document.getElementById("addusermodal").classList.add("hidden");
		msg.closeAll()
	},

	getUsers: async () => {
		app.loading();

		try {
			search = "?";
			if(filters.users.filter_role)
				search+=`filter_role=${filters.users.filter_role}&`;


			if (filters.users.keyword) {
				search += `keyword=${filters.users.keyword}`;
			} else if (filters.users.a) {
				search += "active=1";
			} else if (filters.users.s) {
				search += "suspended=1";
			} else if (filters.users.d) {
				search += "deactivated=1";
			}

			
			let route = `${app.api}/admin/users/${filters.users.page}/${
        filters.users.limit
      }${search}`;

			if (filters.users.school != null) {
				route = `${app.api}/admin/school/users/${filters.users.school}/${
          filters.users.page
        }/${filters.users.limit}${search}`;
			}

			result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "GET"
			});
			resp = await result.json();

			let html = "";
			if (resp.users) {
				for (i in resp.users) {
					user = resp.users[i];
					html += `
						<tr onclick="app.userDetails(event, ${user.id})">
							<td>${user.id}</td>
							<td>${user.firstname}</td>
							<td>${user.lastname}</td>
							<td>${user.email}</td>
							<td class='sch_hide'>
								<div class="dropdown">
								  <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								    Actions
								  </button>
								  <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
								    <a class="dropdown-item" href="#" onclick="app.activateUser(${user.id}, '${
            user.firstname
          } ${user.lastname}')">Reactivate User</a>
								    <a class="dropdown-item" href="#" onclick="app.deactivateUser(${
                      user.id
                    }, '${user.firstname} ${
            user.lastname
          }')">Deactivate User</a>
								    <a class="dropdown-item" href="#" onclick="app.resetUserPassword(${
                      user.id
                    }, '${user.firstname} ${
            user.lastname
          }')">Reset User Password</a>
								    <a class="dropdown-item" href="transactions.html?user=${
                      user.id
                    }">View User's Rides</a>
								  </div>
								</div>

							</td>
						</tr>
					`;
				}

				/* --------- PAGINATION ------------------- find a way to abstract this for all lists */
				let page = resp.page;
				let totalPages = resp.totalPages;
				if (totalPages > page) {
					if (page == 1) {
						let row = `
							<tr>
								<td> <button class='btn btn-info' onclick="filters.users.page++; app.getUsers()">Next</button> </td>
							</tr>
						`;
						html += row;
					} else {
						let row = `
							<tr>
								<td> <button class='btn btn-info' onclick="if(filters.users.page == 1){ return; } filters.users.page--; app.getUsers();">Prev</button> </td>
								<td> </td>
								<td> </td>
								<td> <button class='btn btn-info' onclick="filters.users.page++; app.getUsers()">Next</button> </td>
							</tr>
						`;
						html += row;
					}
				} else {
					let row = `
						<tr>
							<td> <button class='btn btn-info' onclick="if(filters.users.page == 1){ return; } filters.users.page--; app.getUsers();">Prev</button> </td>
						</tr>
					`;
					html += row;
				}
				/* ----------- END PAGINATION ============== */

				document.getElementById("usersbody").innerHTML = html;
			}

			app.finished();
		} catch (e) {
			app.finished();
		}
	},

	addUser: async () => {
		app.loading();

		try {
			let data = {
				firstname: $('#activeModal input[name=cfirstname]').val(),
				lastname: $('#activeModal input[name=clastname]').val(),
				email: $('#activeModal input[name=cemail]').val(),
				password: $('#activeModal input[name=cpassword]').val(),
				role: $('#activeModal input[name=role]').val()
			};

			if (data.role != "SUPERADMIN" && data.role != "SCHOOL") {
				data.school = $('#activeModal select[name=cschool]').val();
			}

			result = await fetch(app.api + "/admin/user", {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "POST",
				body: JSON.stringify(data)
			});
			resp = await result.json();

			if (resp.status == 200) {
				app.closeadduser();
				msg.success("User Added");
			} else {
				msg.error(resp.message);
			}

			app.finished();
			app.getUsers();
		} catch (e) {
			console.error("Add User error", e)
			app.finished();
		}
	},

	logout: () => {
		localStorage.removeItem("token");
		location.href = localStorage.getItem("home");
	},

	loading: () => {
		ld = document.createElement("div");
		ld.id = "loaderdiv";
		ld.innerHTML =
			'<div class="loader"> <img src="assets/img/loader.gif" width="90px" /> </div>';
		document.body.appendChild(ld);
	},

	finished: () => {
		let $loader = document.getElementById("loaderdiv");
		$loader && $loader.remove();
	},

	// Rides
	getRides: async () => {
		if (filters.rides.for == "user") {
			await app.getUserRides();
		}
		if (filters.rides.for == "driver") {
			await app.getDriverRides();
		}
		if (filters.rides.for == "school") {
			await app.getSchoolRides();
		}
		if (filters.rides.for == "all") {
			await app.getAllRides();
		}
	},
	getUserRides: async () => {
		let route = `${app.api}/admin/rides/user/${filters.rides.id}/${
      filters.rides.page
    }/${filters.rides.limit}`;

		app.loading();

		result = await fetch(route, {
			headers: new Headers({
				"Content-Type": "application/json",
				Token: localStorage.getItem("token")
			}),
			method: "GET"
		});
		resp = await result.json();

		app.renderRides(document.getElementById("rides"), resp.rides);

		app.finished();
	},

	getSchoolRides: async () => {
		let route = `${app.api}/admin/rides/school/${filters.rides.id}/${
      filters.rides.page
    }/${filters.rides.limit}`;

		app.loading();

		result = await fetch(route, {
			headers: new Headers({
				"Content-Type": "application/json",
				Token: localStorage.getItem("token")
			}),
			method: "GET"
		});
		resp = await result.json();

		app.renderRides(document.getElementById("rides"), resp.rides);

		app.finished();
	},

	getDriverRides: async () => {
		let route = `${app.api}/admin/rides/driver/${filters.rides.id}/${
      filters.rides.page
    }/${filters.rides.limit}`;

		app.loading();

		result = await fetch(route, {
			headers: new Headers({
				"Content-Type": "application/json",
				Token: localStorage.getItem("token")
			}),
			method: "GET"
		});
		resp = await result.json();

		app.renderRides(document.getElementById("rides"), resp.rides);

		app.finished();
	},

	getAllRides: async () => {
		let route = `${app.api}/admin/rides/all/${filters.rides.page}/${
      filters.rides.limit
    }?keyword=${filters.rides.keyword}&date=${filters.rides.date}`;

		app.loading();

		result = await fetch(route, {
			headers: new Headers({
				"Content-Type": "application/json",
				Token: localStorage.getItem("token")
			}),
			method: "GET"
		});
		resp = await result.json();

		app.renderRides(document.getElementById("rides"), resp.rides);

		app.finished();
	},

	renderRides: (container, rides) => {
		let html = "";
		for (i in rides) {
			let ride = rides[i];
			let row = `
				<tr>
					<td>${ride.id}</td>
					<td>${ride.username}</td>
					<td>${ride.amount}</td>
					<td>${ride.date}</td>
					<td>${ride.payment}</td>
					<td>${ride.status}</td>
				</tr>
			`;
			html += row;
		}
		/* --------- PAGINATION ------------------- find a way to abstract this for all lists */
		let page = resp.page;
		let totalPages = resp.totalPages;
		if (totalPages > page) {
			if (page == 1) {
				let row = `
							<tr>
								<td> <button class='btn btn-info' onclick="filters.rides.page++; app.getAllRides()">Next</button> </td>
							</tr>
						`;
				html += row;
			} else {
				let row = `
							<tr>
								<td> <button class='btn btn-info' onclick="if(filters.rides.page == 1){ return; } filters.rides.page--; app.getAllRides();">Prev</button> </td>
								<td> </td>
								<td> </td>
								<td> <button class='btn btn-info' onclick="filters.rides.page++; app.getAllRides()">Next</button> </td>
							</tr>
						`;
				html += row;
			}
		} else {
			let row = `
						<tr>
							<td> <button class='btn btn-info' onclick="if(filters.rides.page == 1){ return; } filters.rides.page--; app.getAllRides();">Prev</button> </td>
						</tr>
					`;
			html += row;
		}
		/* ----------- END PAGINATION ============== */

		container.innerHTML = html;
	},
	getAllTransactions: async () => {
		let route = `${app.api}/admin/transactions/${filters.transactions.page}/${
      filters.transactions.limit
    }?keyword=${filters.transactions.keyword}&school=${
      filters.transactions.school
    }&date=${filters.transactions.date}`;

		app.loading();

		result = await fetch(route, {
			headers: new Headers({
				"Content-Type": "application/json",
				Token: localStorage.getItem("token")
			}),
			method: "GET"
		});
		resp = await result.json();

		app.renderTransactions(
			document.getElementById("transactions"),
			resp.transactions
		);

		app.finished();
	},
	renderTransactions: (container, transactions) => {
		let html = "";
		for (i in transactions) {
			let transaction = transactions[i];
			let row = `
				<tr>
					<td>${transaction.t_id}</td>
					<td>${transaction.user.first_name} ${transaction.user.last_name}</td>
					<td>${transaction.amount}</td>
					<td>${new Date(transaction.date).toLocaleString()}</td>
					<td>${Humanize.capitalize(transaction.type.replace("_", " "))}</td>
					<td>${Humanize.capitalize(transaction.status)}</td>
				</tr>
			`;
			html += row;
		}

		/* --------- PAGINATION ------------------- find a way to abstract this for all lists */
		let page = resp.page;
		let totalPages = resp.totalPages;
		if (totalPages > page) {
			if (page == 1) {
				let row = `
							<tr>
								<td> <button onclick="filters.transactions.page++; app.getAllTransactions()">Next</button> </td>
							</tr>
						`;
				html += row;
			} else {
				let row = `
							<tr>
								<td> <button onclick="if(filters.transactions.page == 1){ return; } filters.transactions.page--; app.getAllTransactions();">Prev</button> </td>
								<td> </td>
								<td> </td>
								<td> <button onclick="filters.transactions.page++; app.getAllTransactions()">Next</button> </td>
							</tr>
						`;
				html += row;
			}
		} else {
			let row = `
						<tr>
							<td> <button onclick="if(filters.transactions.page == 1){ return; } filters.transactions.page--; app.getAllTransactions();">Prev</button> </td>
						</tr>
					`;
			html += row;
		}
		/* ----------- END PAGINATION ============== */

		container.innerHTML = html;
	},
	/* renderDriversPayoutButton: ( container, drivers ) => {
		let html = "";//"<select id='selectDriver' class='form-control' onchange='selectedDriver = this.value'>"
		for(i in drivers){
			let driver = drivers[i]
			html += `<button onclick="alert('${driver.id}')">Payout</button>`
		}
		html += ""
		container.innerHTML = html
	}, */
	// drivers

	getDrivers: async (container, astable = true, withPayout = false) => {
		let route = app.api + "/admin/drivers";

		if (filters.drivers.school != null) {
			route = `${
        app.api
      }/admin/drivers/school/${filters.drivers.school.toString()}/${
        filters.drivers.page
      }/${filters.drivers.limit}`;
		}
		if (filters.drivers.keyword) route += `?search=${filters.drivers.keyword}`;
		app.loading();

		try {
			result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "GET"
			});
			resp = await result.json();
			app.drivers.list = resp.drivers;
			if (resp.status == 200) {
				if (astable)
					app.renderDriversAsTable(container, resp.drivers, withPayout);
				else app.renderDriversAsDropDown(container, resp.drivers);
			} else {
				msg.error(resp.message);
			}
			app.finished();
		} catch (e) {
			app.finished();
		}
	},
	renderDriversAsTable: (
		container = document.getElementById("driverslist"),
		drivers,
		isPayoutTable = false
	) => {
		let html = "";
		try {
			for (i in drivers) {
				let driver = drivers[i];
				let actionFirstHtml = null;
				let actionLastHtml = null;
				if (isPayoutTable) {
					//onclick="app.drivers.payout(${driver.id})"
					actionFirstHtml = `<input type='checkbox' data-driver-id='${
            driver.id
          }'  class='btn btn-info btn-sm driver-checkbox' onclick="console.log('Hello world')" />`;
				} else {
					actionLastHtml = `<div class="dropdown sch_hide">
				<button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				  Actions
				</button>
				<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
				  <a class="dropdown-item" href="#" onclick="app.drivers.activate(${
            driver.id
          }, '${driver.firstname}')">Activate Driver</a>
				  <a class="dropdown-item" href="#" onclick="app.drivers.deactivate(${
            driver.id
          }, '${driver.firstname}')">Deactivate Driver</a>
				  <a class="dropdown-item cadhide" href="#" onclick="app.drivers.fundWallet(${
            driver.id
          }, '${driver.firstname}')">Fund Driver's Wallet</a>
				  <a class="dropdown-item" href="transactions.html?driver=${
            driver.id
          }">View Driver's Rides</a>
				</div>
			  </div>`;
				}
				let rowMiddle = `
					<td>${driver.id}</td>
					<td>${driver.firstname}</td>
					<td>${driver.lastname}</td>
					<td>${driver.approved}</td>`;
				if (actionFirstHtml) {
					rowMiddle = `<td>${actionFirstHtml}</td>` + rowMiddle;
				}
				if (actionLastHtml) {
					rowMiddle = rowMiddle + `<td>${actionLastHtml}</td>`;
				}

				let row = `
				<tr onclick="app.driverDetails(event, ${driver.id})">
					${rowMiddle}
				</tr>
			`;
				html += row;
			}
		} catch (e) {
			console.error("Error", e);
		}

		/* --------- PAGINATION ------------------- find a way to abstract this for all lists */
		let page = resp.page;
		let totalPages = resp.totalPages;
		if (totalPages > page) {
			if (page == 1) {
				let row = `
							<tr>
								<td> <button class='btn btn-info' onclick="filters.drivers.page++; app.getDrivers()">Next</button> </td>
							</tr>
						`;
				html += row;
			} else {
				let row = `
							<tr>
								<td> <button class='btn btn-info' onclick="if(filters.drivers.page == 1){ return; } filters.drivers.page--; app.getDrivers();">Prev</button> </td>
								<td> </td>
								<td> </td>
								<td> <button class='btn btn-info' onclick="filters.drivers.page++; app.getDrivers()">Next</button> </td>
							</tr>
						`;
				html += row;
			}
		} else {
			let row = `
						<tr>
							<td> <button class='btn btn-info' onclick="if(filters.drivers.page == 1){ return; } filters.drivers.page--; app.getDrivers();">Prev</button> </td>
						</tr>
					`;
			html += row;
		}
		/* ----------- END PAGINATION ============== */

		container.innerHTML = html;
	},

	renderDriversAsDropDown: (container, drivers) => {
		let html =
			"<select id='selectDriver' class='form-control' onchange='selectedDriver = this.value'>";
		for (i in drivers) {
			let driver = drivers[i];
			html += `<option value="${driver.id}">${driver.firstname} ${
        driver.lastname
      }</option>`;
		}
		html += "</select>";
		container.innerHTML = html;
	},

	// schools
	getSchoolsBackground: async container => {
		let route = app.api + "/admin/schools?all=1";
		result = await fetch(route, {
			headers: new Headers({
				"Content-Type": "application/json",
				Token: localStorage.getItem("token")
			}),
			method: "GET"
		});
		resp = await result.json();

		let html = "<select name='cschool' class='form-control'>";
		for (let i in resp.schools) {
			let school = resp.schools[i];
			html += `<option value="${school.id}">${school.name}</option>`;
		}
		html += "</select>";
		if (!container)
			return html;
		container.innerHTML = html;
	},

	getRolesBackground: async container => {},
	renderSchoolsPayoutDropdown: async (selectEmpty = false) => {
		let route = app.api + "/admin/schools/1/10000";
		app.loading();

		try {
			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "GET"
			});
			let resp = await result.json();

			if (resp.status == 200) {
				let html = "";
				app.finished();
				if (selectEmpty)
					html += `<option  selected value=''>All Schools</option>`;
				resp.schools.forEach(school => {
					html += `<option value='${school.id}'>${school.name}</option>`;
				});
				document.getElementById("selectSchools").innerHTML = html;
			} else {
				msg.error(resp.message);
			}

			app.finished();
		} catch (e) {
			app.finished();
		}
	},

	getSchools: async (container, astable = true, isPayoutTable = false) => {
		let route = app.api + "/admin/schools";
		app.loading();

		try {
			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "GET"
			});
			let resp = await result.json();

			if (resp.status == 200) {
				if (astable)
					app.renderSchoolsAsTable(container, resp.schools, isPayoutTable);
				else app.renderSchoolsAsDropDown(container, resp.schools);
			} else {
				msg.error(resp.message);
			}

			app.finished();
		} catch (e) {
			console.error(e);
			app.finished();
		}
	},

	renderSchoolsAsTable: (container, schools, isPayoutTable) => {
		let html = "";

		for (let i in schools) {
			let school = schools[i];
			let actionFirstHtml = "";
			if (isPayoutTable) {
				actionFirstHtml = `<td><input type='checkbox' data-school-id='${
          school.id
        }'  class='btn btn-info btn-sm school-checkbox' /></td>`;
			}
			let row = `
				<tr onclick="app.schoolDetails(event, ${school.id})">
					${actionFirstHtml}
					<td>${school.id}</td>
					<td>${school.name}</td>
					<td>${school.address}</td>
					<td class="cadhide" style="display:${isPayoutTable ? "none" : "block"}">
						<div class="dropdown cadhide">
	                      <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
	                        ACTIONS
	                      </button>
	                      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
	                      	<a class="dropdown-item cadhide" href="#" onclick="app.schools.creditSchoolWallet(${
                            school.id
                          },'${school.name}')">Fund School Wallet </a>
							<a class="dropdown-item cadhide" href="#" onclick="app.schools.resetSchoolPassword(${
                school.id
              }, '${school.name}')">Reset School Password </a>
							<a class="dropdown-item cadhide" href="#" onclick="app.schools.addSchoolAccountDetails(${
                school.id
              }, '${school.name}')">Set Account details </a>
	                      </div>
	                    </div>
					</td>
				</tr>
			`;
			html += row;
		}

		container.innerHTML = html;
		app.inituser();
	},

	renderSchoolsAsDropDown: (container, schools) => {
		let html =
			"<select id='selectSchool' class='form-control' onchange='selectedSchool = this.value'>";
		for (let i in schools) {
			let school = schools[i];
			html += `<option value="${school.id}">${school.name}</option>`;
		}
		html += "</select>";
		container.innerHTML = html;
	},

	renderUsersAsDropDown: (container, users) => {
		let html =
			"<select id='selectUser' class='form-control' onchange='selectedUser = this.value'>";
		for (i in users) {
			let user = users[i];
			html += `<option value="${user.id}">${user.firstname}</option>`;
		}
		html += "</select>";
		container.innerHTML = html;
	},

	drivers: {
		list: [],
		retrieveDriverById: id => {
			return app.drivers.list.find(driver => driver.id == id);
		},
		activate: async (id, name) => {
			let c = await msg.confirm("Are you sure you want to activate Driver " + name);
			if (!c) return;

			app.loading();

			try {
				req = await fetch(app.api + "/admin/driver/activate/" + id, {
					headers: new Headers({
						"Content-Type": "application/json",
						Token: localStorage.getItem("token")
					}),
					method: "PUT"
				});
				resp = await req.json();

				if (resp.status == 200) {
					msg.success(resp.message);
					app.getDrivers(document.getElementById("driverslist"));
				}

				app.finished();
			} catch (e) {
				app.finished();
			}
		},

		deactivate: async (id, name) => {
			c = await msg.confirm("Are you sure you want to deactivate Driver " + name);
			if (!c) return;

			app.loading();

			try {
				req = await fetch(app.api + "/admin/driver/deactivate/" + id, {
					headers: new Headers({
						"Content-Type": "application/json",
						Token: localStorage.getItem("token")
					}),
					method: "PUT"
				});
				resp = await req.json();

				if (resp.status == 200) {
					msg.success(resp.message);
					app.getDrivers(document.getElementById("driverslist"));
				}

				app.finished();
			} catch (e) {
				app.finished();
			}
		},

		fundWallet: async (id, name) => {
			let p = await msg.prompt(
				"How much would you like to fund " + name + "'s wallet with"
			);
			let amount = Number.parseInt(p);
			if (isNaN(amount)) {
				return msg.error("Please enter a valid number");
			}

			app.loading();

			req = await fetch(`${app.api}/admin/driver/wallet/${id}/${amount}`, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "PUT"
			});
			resp = await req.json();

			app.finished();

			if (resp.status == 200) {
				msg.success("Driver's Wallet Has been funded");
			}
		},
		payoutSchoolAndDrivers: async (driver_id_list, school_id, user_email) => {
			c = await msg.confirm("Are you sure you want to payout Driver");
			if (!c) return;
			//let driver = app.drivers.retrieveDriverById(driver_id)
			try {
				app.loading();
				req = await fetch(`${app.api}/wallet/payout/school`, {
					headers: new Headers({
						"Content-Type": "application/json",
						Token: localStorage.getItem("token")
					}),
					method: "POST",
					body: JSON.stringify({
						driver_id_list: driver_id_list,
						school_id: school_id,
						user_email: user_email
					})
				});
				resp = await req.json();
				//console.log(resp)
				if (resp.status === true) {
					console.log(resp);
					msg.success(resp.message);
					//app.schools.hideAddSchool();
				} else {
					msg.error(resp.message);
				}
			} catch (e) {
				msg.error("Unknown Error Occurred");
				console.error("Payout error:", e);
			} finally {
				app.finished();
			}
		}
	},
	userDetails: async (event, id) => {
		if (event.target.tagName != "TD") {
			return;
		}
		app.loading();

		req = await fetch(`${app.api}/admin/details/user/${id}`, {
			headers: new Headers({
				"Content-Type": "application/json",
				Token: localStorage.getItem("token")
			}),
			method: "GET"
		});
		resp = await req.json();

		app.finished();

		if (resp.status !== 200) {
			return;
		}

		let html = `
				<div class="row justify-content-md-center">
				  <div class="col-md-12">
				    <div class=""> 
				      <div class="card-body">
				        <h4 class="card-title"><strong class='purple-text'>Name:</strong> ${resp.user.name}</h4>
				        <h4 class="card-title"><strong  class='purple-text'>Email:</strong> ${resp.user.email}</h4>
				        <h4 class="card-title"><strong  class='purple-text'>Wallet Balance:</strong> ${resp.user.wallet_balance}</h4>
				        <h4 class="card-title"><strong   class='purple-text'>School:</strong> ${resp.user.school}</h4>
				      </div>
				    </div>
				  </div>
				</div>
			
		`;

		/* let cdiv = document.createElement("div");
		cdiv.className = "custommodal";
		cdiv.addEventListener(
			"click",
			function () {
				document.getElementById("user_detail_modal").remove();
			},
			false
		);
		cdiv.id = "user_detail_modal"; */
		msg.alert(html, "User Details")
		//cdiv.innerHTML = html;

		//document.body.appendChild(cdiv);
	},
	schoolDetails: async (event, id) => {
		if (event.target.tagName != "TD") {
			return;
		}
		app.loading();

		req = await fetch(`${app.api}/admin/details/school/${id}`, {
			headers: new Headers({
				"Content-Type": "application/json",
				Token: localStorage.getItem("token")
			}),
			method: "GET"
		});
		resp = await req.json();

		app.finished();

		if (resp.status !== 200) {
			return;
		}

		let html = `
				<div class="row justify-content-md-center">
				  <div class="col-md-12">
				    <div class=""> 
				      <div class="card-body">
				        <h4 class="card-title"><strong class='purple-text'>Name:</strong> ${resp.school.name}</h4>
				        <h4 class="card-title"><strong class='purple-text'>Email:</strong> ${resp.school.email}</h4>
				        <h4 class="card-title cadhide"><strong class='purple-text'>Wallet Balance:</strong> ${
                  resp.school.wallet_balance
                }</h4>
				      </div>
				    </div>
				  </div>
				</div>
			
		`;

		msg.alert(html, "School Details")
	},
	driverDetails: async (event, id) => {
		if (event.target.tagName != "TD") {
			return;
		}
		app.loading();

		req = await fetch(`${app.api}/admin/details/driver/${id}`, {
			headers: new Headers({
				"Content-Type": "application/json",
				Token: localStorage.getItem("token")
			}),
			method: "GET"
		});
		resp = await req.json();

		app.finished();

		if (resp.status !== 200) {
			resp.message && msg.error(resp.message);
			return;
		}

		let html = `
				<div class="row justify-content-md-center">
				  <div class="col-md-12">
				    <div class="card"> 
				      <div class="card-body">
				        <h4 class="card-title"><strong class='purple-text'>Name:</strong> ${resp.driver.name}</h4>
				        <h4 class="card-title"><strong class='purple-text'>Email:</strong> ${resp.driver.email}</h4>
				        <h4 class="card-title"><strong class='purple-text'>Wallet Balance:</strong> ${
                  resp.driver.wallet_balance
                }</h4>
				        <h4 class="card-title"><strong class='purple-text'>School:</strong> ${resp.driver.school}</h4>
				      </div>
				    </div>
				  </div>
				</div>
			
		`;
		msg.alert(html, "Driver Details")
		/* let cdiv = document.createElement("div");
		cdiv.className = "custommodal";
		cdiv.addEventListener(
			"click",
			function () {
				document.getElementById("user_detail_modal").remove();
			},
			false
		);
		cdiv.id = "user_detail_modal";
		cdiv.innerHTML = html;

		document.body.appendChild(cdiv); */
	},
	schools: {
		payoutSchools: async school_id_list => {
			try {
				c = await msg.confirm("Are you sure you want to payout School(s)");
				if (!c) return;
				app.loading();
				req = await fetch(`${app.api}/wallet/payout/school`, {
					headers: new Headers({
						"Content-Type": "application/json",
						Token: localStorage.getItem("token")
					}),
					method: "POST",
					body: JSON.stringify({
						school_id_list: school_id_list
					})
				});
				resp = await req.json();
				//console.log(resp)
				if (resp.status === true) {
					console.log(resp);
					msg.success(resp.message);
					//app.schools.hideAddSchool();
				} else {
					msg.error(resp.message);
				}
			} catch (e) {
				console.error(e);
				msg.error("Unknown error occurred  while paying out!");
			} finally {
				app.finished();
			}
		},
		showAddSchool: () => {
			msg.alert("<div id='activeModal'>" + $("#add_school_modal").html() + "</div>", null, {
				basic: true,
				padding: false
			})
			//document.getElementById("add_school_modal").classList.remove("hidden");
			//document.body.style.overflow = "hidden";
		},
		hideAddSchool: () => {
			msg.closeAll()
			//document.getElementById("add_school_modal").classList.add("hidden");
			//document.body.style.overflow = "visible";
		},
		async addSchoolAccountDetails(school_id, school_name) {
			let banks = await app.getBanksLists();
			let banksHtml = banks
				.map(bank => {
					return `<option value='${bank.id}'>${bank.name}</option>`;
				})
				.join("");
			let html = `
					<div class="row justify-content-md-center">
					  <div class="col-md-12">
						<div class=""> 
						  <div class="card-body">
						  <form onsubmit='app.schools.saveSchoolAccountDetails(this);return false;'>
						  
							<input name='institution_id' value='${school_id}' class='form-control' type='hidden' required/>  
						  	<div class='form-group'>
								   <label>Account Name</label>
								 <input name='account_name' class='form-control' type='text' required/>  
						   	</div>
						   	<div class='form-group'>
								   <label>Account Number</label>
								 <input name='account_number' class='form-control' type='number' required/>  
						   	</div>
						   	<div class='form-group'>
								   <label>Bank</label>
								 <select name='bank_id' class='form-control' required>
								 	${banksHtml}
								 </select>
						   	</div>

						   	<button type='submit' class='btn btn-info' >Save</button>
						   </form>
						  </div>
						</div>
					  </div>
					</div>
				
			`;

			msg.alert("<div id='activeModal'>" + html + "</div>", null, {
				basic: true,
				padding: false
			})
		},
		async saveSchoolAccountDetails(form) {
			try {
				let formData = $(form).serializeArray();
				formData = formData.reduce((previous, current) => {
					previous[current.name] = current.value;
					return previous;
				}, {});
				let bank = app.banks.find(bank => {
					return Number(formData.bank_id) == bank.id;
				});
				formData["bank_name"] = bank.name;
				formData["bank_code"] = bank.code;

				app.loading();

				let route = `${app.api}/admin/schools/${formData.institution_id}/payment_details`;
				let result = await fetch(route, {
					headers: new Headers({
						"Content-Type": "application/json",
						Token: localStorage.getItem("token")
					}),
					method: "POST",
					body: JSON.stringify(formData)
				});
				resp = await result.json();

				if (resp.status == 200) {
					msg.success("Account details added successfully");
				} else {
					msg.error(resp.message);
				}
			} catch (e) {
				console.error("Error:", e);
			}
			app.finished();
			msg.closeAll()
			//document.getElementById("user_detail_modal").remove();

			//alert("School details saved successfully")
			//document.getElementById('user_detail_modal').remove();
		},
		addSchool: async () => {
			/* if (
				document.getElementById("school_password").value !=
				document.getElementById("school_password2").value
			) {
				return msg.error("Password confirmation does not match");
			} */

			app.loading();

			let route = `${app.api}/admin/schools`;
			let data = {
				name: $('#activeModal input[name=school_name]').val(),
				address: $('#activeModal input[name=school_address]').val(),
				location: $('#activeModal input[name=school_location]').val(),
				phone: $('#activeModal input[name=school_phone]').val(),
				email: $('#activeModal input[name=school_email]').val(),
				password: $('#activeModal input[name=school_password]').val()
			};

			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "POST",
				body: JSON.stringify(data)
			});
			resp = await result.json();

			if (resp.status == 200) {
				msg.success("School Added");
				app.schools.hideAddSchool();
			} else {
				msg.error(resp.message);
			}

			app.finished();

			app.getSchools(document.getElementById("schoollist"));
		},

		creditSchoolWallet: async (id, name) => {
			let p = await msg.prompt(
				"Please enter amount you'd like to fund " + name + "'s wallet with"
			);
			let amount = Number.parseInt(p);
			if (isNaN(amount)) {
				return msg.error("Please enter a valid number");
			}

			let route = `${app.api}/admin/school/wallet/${id}/${amount}`;
			try {
				app.loading();
				let result = await fetch(route, {
					headers: new Headers({
						"Content-Type": "application/json",
						Token: localStorage.getItem("token")
					}),
					method: "PUT"
				});
				let resp = await result.json();

				app.finished();

				if (resp.status == 200) {
					msg.success("School wallet has been funded");
				} else {
					msg.error(resp.message);
				}
			} catch (e) {
				app.finished();
				msg.error("Unknown error occured while processing your request!");
			}
		},

		resetSchoolPassword: async (id, name) => {
			c = await msg.confirm("Are you sure you want to reset password!");
			if (!c) return;
			let route = `${app.api}/admin/school/reset/${id}`;
			try {
				app.loading();
				let result = await fetch(route, {
					headers: new Headers({
						"Content-Type": "application/json",
						Token: localStorage.getItem("token")
					}),
					method: "PUT"
				});
				let resp = await result.json();
				app.finished();

				if (resp.status == 200) {
					msg.success(
						"New Auto Generated School Password is: " + resp.password
					);
				} else {
					msg.error(resp.message);
				}
			} catch (e) {
				app.finished();
				msg.error("Unknown error occured while processing your request!");
			}
		}
	},
	activateUser: async (id, fullname) => {
		let c = await msg.confirm(
			"Are you sure you want to Activate " + fullname + "'s account"
		);
		if (!c) {
			return;
		}

		let route = `${app.api}/admin/user/activate/${id}`;
		try {
			app.loading();
			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "PUT"
			});
			let resp = await result.json();

			app.finished();
			msg.success(resp.message);
		} catch (e) {
			app.finished();
			msg.error(e.message);
		}
	},
	deactivateUser: async (id, fullname) => {
		let c = await msg.confirm(
			"Are you sure you want to Deactivate " + fullname + "'s account"
		);
		if (!c) {
			return;
		}

		let route = `${app.api}/admin/user/deactivate/${id}`;
		try {
			app.loading();
			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "PUT"
			});
			let resp = await result.json();

			app.finished();
			msg.success(resp.message);
		} catch (e) {
			app.finished();
			msg.error(e.message);
		}
	},
	resetUserPassword: async (id, fullname) => {
		let c = await msg.confirm(
			"Are you sure you want to Reset " + fullname + "'s account password"
		);
		if (!c) {
			return;
		}

		let route = `${app.api}/admin/user/reset/${id}`;
		try {
			app.loading();
			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "PUT"
			});
			let resp = await result.json();

			app.finished();
			if (resp.status == 200) {
				msg.success(
					"New Auto Generated User Password is: " + resp.new_password
				);
			} else {
				msg.error(resp.message);
			}
		} catch (e) {
			app.finished();
			msg.error(e.message);
		}
	},
	suspendUser: async id => {
		let route = `${app.api}/admin/user/suspend/${id}`;
		try {
			app.loading();
			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "PUT"
			});
			let resp = await result.json();

			app.finished();
			msg.success(resp.message);
		} catch (e) {
			app.finished();
			msg.error(e.message);
		}
	},

	dashboards: {
		stats: async () => {
			let route = `${app.api}/admin/stats`;

			app.loading();

			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "GET"
			});
			let resp = await result.json();

			app.finished();

			document.getElementById("users").innerHTML = resp.users;
			document.getElementById("schools").innerHTML = resp.schools;
			document.getElementById("drivers").innerHTML = resp.drivers;
			document.getElementById("rides").innerHTML = resp.rides;
		}
	},

	inituser: async () => {
		try {
			let route = `${app.api}/admin/inituser`;
			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "GET"
			});
			let resp = await result.json();

			if (resp.status == 200 && resp.role == 1) {
				let items = document.querySelectorAll(".cadhide");
				items.forEach(item => {
					item.classList.remove("cadhide");
				});

				var style = document.createElement("style");
				style.type = "text/css";
				style.innerHTML = `.cadhide {display: block !important; } 
						a.dropdown-item.cadhide{ display: block !important; }
		   				li.nav-item.cadhide{ display: block !important; }`;
				document.getElementsByTagName("head")[0].appendChild(style);
			} else if ((resp.status == 200 && resp.role == 3) || resp.status == 401) {
				msg.error("Unauthorized");
				localStorage.removeItem("token");
				location.href = "index.html";
			}
			/* else {
				 localStorage.setItem('institution_id',resp.institution_id)
				localStorage.setItem('role',resp.role) 

			} */
		} catch (e) {
			if (
				await msg.confirm(
					"There was a problem initializing this page, do you want to reload?"
				)
			)
				document.location.reload();
		}
	},

	priceshare: {
		method: "add",
		showadd: () => {
			app.priceshare.method = "add";
			msg.alert("<div id='activeModal'>" + $("#addpriceshare").html() + "</div>", null, {
				basic: true,
				padding: false
			})
			//document.getElementById("addpriceshare").classList.remove("hidden");
		},
		hideadd: () => {
			msg.closeAll()
			//document.getElementById("addpriceshare").classList.add("hidden");
			//document.getElementById("cschool").removeAttribute("disabled");
		},
		add: async () => {
			let route;
			let data;
			let rmethod;

			try {
				let school_id = $('#activeModal select[name=cschool]').val();
				let moovShare = $('#activeModal input[name=moov]').val();
				let driverShare = $('#activeModal input[name=driver]').val();
				let schoolShare = $('#activeModal input[name=schoolp]').val()
				console.log(app.priceshare.method)
				if (app.priceshare.method == "add") {
					route = `${app.api}/admin/price/share`;
					data = {
						school_id: school_id,
						moov: moovShare,
						driver: driverShare,
						school: schoolShare
					};
					rmethod = "POST";
				} else {
					route = `${app.api}/admin/price/share/${school_id}`;
					data = {
						moov: moovShare,
						driver: driverShare,
						institution: schoolShare
					};
					rmethod = "PUT";
				}

				let dmoov = Number.parseInt(moovShare);
				if (isNaN(dmoov)) {
					return msg.error("Please enter a number for Moov Percentage");
				}
				let ddriver = Number.parseInt(driverShare);
				if (isNaN(ddriver)) {
					return msg.error("Please enter a number for Driver Percentage");
				}
				let dschool = Number.parseInt(schoolShare);
				if (isNaN(dschool)) {
					return msg.error("Please enter a number for School Percentage");
				}

				if (dmoov + ddriver + dschool !== 100) {
					return msg.error("Error. Percentage total not equal to 100");
				}

				app.loading();

				let result = await fetch(route, {
					headers: new Headers({
						"Content-Type": "application/json",
						Token: localStorage.getItem("token")
					}),
					method: rmethod,
					body: JSON.stringify(data)
				});
				let resp = await result.json();

				app.finished();

				if (resp.status == 200 && app.priceshare.method == "add") {
					msg.success("Percentage details have been added");
					app.priceshare.list();
					app.priceshare.hideadd();

					/* document.getElementById("moov").value = "";
					document.getElementById("driver").value = "";
					document.getElementById("schoolp").value = ""; */
				} else if (resp.status == 200) {
					msg.success("Percentage details have been Updated");
					app.priceshare.list();
					app.priceshare.hideadd();

					/* document.getElementById("moov").value = "";
					document.getElementById("driver").value = "";
					document.getElementById("schoolp").value = ""; */
				} else {
					msg.error(resp.message);
				}
			} catch (e) {
				app.finished();
				console.log(e);
				msg.error("error");
			}

			//app.priceshare.method = "add";
			//document.getElementById("label").innerHTML = " Add Percentage Details ";
		},

		update: async (id, name, school, driver, moov) => {
			app.priceshare.method = "update";
			msg.alert("<div id='activeModal'>" + $("#addpriceshare").html() + "</div>", null, {
				basic: true,
				padding: false
			})
			$('#activeModal .school-list').html(schoolsListHtml)
			$('#activeModal select[name=cschool]').attr("disabled", "true").val(id);
			$('#activeModal input[name=moov]').val(moov);
			$('#activeModal input[name=driver]').val(driver);
			$('#activeModal input[name=schoolp]').val(school)

			//document.getElementById("cschool").value = id;
			//document.getElementById("cschool").setAttribute("disabled", "true");

			document.getElementById("label").innerHTML =
				" Update School Percentage Info ";

		},
		list: async () => {
			let route = `${app.api}/admin/price/share`;

			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "GET"
			});
			let resp = await result.json();

			let html = "";

			for (let i in resp.price_shares) {
				let priceshare = resp.price_shares[i];

				let row = `<tr>
					<td>${priceshare.schoolid}</td>
					<td>${priceshare.schoolname}</td>
					<td>${priceshare.school}</td>
					<td>${priceshare.driver}</td>
					<td>${priceshare.moov}</td>
					<td>
						<div class="dropdown">
	                      <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
	                        ACTIONS
	                      </button>
	                      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
	                      	<a class="dropdown-item" href="#" onclick="app.priceshare.update(${
                            priceshare.schoolid
                          },'${priceshare.schoolname}', ${priceshare.school}, ${
          priceshare.driver
        }, ${priceshare.moov})"> Update </a>
	                      </div>
	                    </div>
					</td>
				</tr>
				`;

				html += row;
			}
			document.getElementById("priceshares").innerHTML = html;
		}
	},

	ridefilters: {
		filterUsers: async () => {
			let s = document.getElementById("filterUsers").value;
			let q = "";
			if (s != "") {
				q = "?search=" + s;
			}
			let route = `${app.api}/admin/filter/user${q}`;

			app.loading();
			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "GET"
			});
			let resp = await result.json();

			app.finished();
			let html = "";
			resp.users.forEach(user => {
				html += `<option value='${user.id}'>${user.name}</option>`;
			});
			document.getElementById("selectUsers").innerHTML = html;
		},
		filterSchools: async () => {
			let s = document.getElementById("filterSchools").value;
			let q = "";
			if (s != "") {
				q = "?search=" + s;
			}

			let route = `${app.api}/admin/filter/school${q}`;

			app.loading();
			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "GET"
			});
			let resp = await result.json();

			let html = "";
			app.finished();
			resp.schools.forEach(school => {
				html += `<option value='${school.id}'>${school.name}</option>`;
			});
			document.getElementById("selectSchools").innerHTML = html;
		},
		filterDrivers: async () => {
			let s = document.getElementById("filterDrivers").value;
			let q = "";
			if (s != "") {
				q = "?search=" + s;
			}

			let route = `${app.api}/admin/filter/driver${q}`;
			app.loading();
			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "GET"
			});
			let resp = await result.json();
			app.finished();
			let html = "";
			resp.drivers.forEach(driver => {
				html += `<option value='${driver.id}'>${driver.name}</option>`;
			});
			document.getElementById("selectDrivers").innerHTML = html;
		},

		filterByUser: async () => {
			filters.rides.for = "user";
			filters.rides.id = document.getElementById("selectUsers").value;
			app.getRides();
		},

		filterBySchool: async () => {
			filters.rides.for = "school";
			filters.rides.id = document.getElementById("selectSchools").value;
			app.getRides();
		},

		filterByDriver: async () => {
			filters.rides.for = "driver";
			filters.rides.id = document.getElementById("selectDrivers").value;
			app.getRides();
		}
	},

	rideDetail: async id => {
		let route = `${app.api}/admin/rides/detail/${id}`;
		app.loading();
		let result = await fetch(route, {
			headers: new Headers({
				"Content-Type": "application/json",
				Token: localStorage.getItem("token")
			}),
			method: "GET"
		});
		let resp = await result.json();
		app.finished();
		let html = "";

		if (resp.status == 200) {
			$("#user_name").text(resp.ride.user.name);
			$("#user_phone").text(resp.ride.user.phone);
			$("#user_email").text(resp.ride.user.email);
			$("#driver_name").text(resp.ride.driver && resp.ride.driver.name);
			$("#driver_phone").text(resp.ride.driver && resp.ride.driver.phone);
			$("#driver_email").text(resp.ride.driver && resp.ride.driver.email);
			$("#date").text(resp.ride.book_date);
			$("#from_loc").text(resp.ride.from);
			$("#to_loc").text(resp.ride.to);
			$("#amount").text(resp.ride.amount);
			$("#payment_status").text(resp.ride.payment_status);
		} else {
			msg.error(resp.message);
		}
	},

	email: {
		recipients: [],
		addToRecipient: () => {
			let userid = document.getElementById("selectUsers").value;
			if (app.email.recipients.includes(userid)) {
				return;
			}

			let sel = document.getElementById("selectUsers");
			let name = sel.options[sel.selectedIndex].innerHTML;

			app.email.recipients.push(userid);
			let key = app.email.recipients.length - 1;

			let html = `
			<span class="badge badge-pill badge-primary" id="user${key}"> 
				${name} 
				<a href='#' onclick="app.email.deleteRecipient(event, ${key}, '${name}')">x</a>
			</span>
			`;
			document.getElementById("recipients").innerHTML += html;
		},

		deleteRecipient: (evt, key, name) => {
			evt.preventDefault();
			evt.stopPropagation();

			//let r = confirm('Delete ' + name)
			//if(!r){ return; }
			app.email.recipients.splice(key, 1);

			document.getElementById("user" + key.toString()).remove();
		},

		sendEmail: async () => {
			if (app.email.recipients.length == 0) {
				return msg.error("No Users added to recipient yet");
			}

			let data = {
				title: $("#title").val(),
				message: $("#message").val(),
				userids: app.email.recipients.join(",")
			};

			let route = `${app.api}/admin/email`;
			app.loading();
			let result = await fetch(route, {
				headers: new Headers({
					"Content-Type": "application/json",
					Token: localStorage.getItem("token")
				}),
				method: "POST",
				body: JSON.stringify(data)
			});
			let resp = await result.json();
			app.finished();

			if (resp.status == 200) {
				msg.success("message sent successfully");
				$("#title").val("");
				$("#message").val("");
				app.email.recipients = [];
				document.getElementById("recipients").innerHTML = "";
			} else {
				msg.error("There was an error sending message. Please try again");
			}
		}
	}
};