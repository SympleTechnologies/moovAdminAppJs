//localStorage.setItem('token', '5a1365473e1490c4a1f40054f9e1b360610a06ff2bbe2dd017412335f490dabe');

/* filters = {
	users: {page:1, limit: 20},
	drivers: { page:1, limit: 20 }
}; */

app = {
	...app,
	current_user:{institution_id:null},
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
			if (resp.status == 200 && resp.role == 3) {
				app.institution_id=resp.institution_id;
				app.showNavbar()
				var style = document.createElement("style");
				style.type = "text/css";
				style.innerHTML = `.sch_hide {display: none !important; } 
						`;
				document.getElementsByTagName("head")[0].appendChild(style);
			} else {
				msg.error("Unauthorized");
				localStorage.removeItem("token");
				location.href = "index.html";
			}
			//else if (resp.status == 401)
			/* else {
				 localStorage.setItem('institution_id',resp.institution_id)
				localStorage.setItem('role',resp.role) 

			} */
		} catch (e) {
			if (await msg.confirm("There was a problem initializing this page, do you want to reload?"))
				document.location.reload();
		}
	},
	getStudents(){
		filters.users.filter_role='user'
		app.getUsers()
	},
	getAdmins(){
		filters.users.filter_role='admin'
		app.getUsers()
	},
	showNavbar() {
		let fileName = document.location.pathname.split('/').pop();
		let navbar = ` 
		<ul class="nav">
			<li class="nav-item ${fileName=='dashboard.html'?'active':''}">
		  		<a class="nav-link" href="./dashboard.html">
					<i class="material-icons">dashboard</i>
					<p>Dashboard</p>
		  		</a>
			</li>
			<li class="nav-item ${fileName=='user.html'?'active':''}">
		  		<a class="nav-link" href="./user.html">
					<i class="material-icons">person</i>
					<p>Students</p>
		  		</a>
			</li>
			<li class="nav-item ${fileName=='admin.html'?'active':''}">
		  		<a class="nav-link" href="./admin.html">
					<i class="material-icons">person</i>
					<p>Administrators</p>
		  		</a>
			</li>
			<li class="nav-item ${fileName=='drivers.html'?'active':''}">
		  		<a class="nav-link" href="./drivers.html">
					<i class="material-icons">person</i>
					<p>Drivers</p>
		  		</a>
			</li>
			<li class="nav-item ${fileName=='rides.html'?'active':''}">
		  		<a class="nav-link" href="./rides.html">
					<i class="material-icons">tram</i>
					<p>Trips</p>
		  		</a>
			</li>
			<li class="nav-item ${fileName=='support.html'?'active':''}">
		  		<a class="nav-link" href="./support.html">
					<i class="material-icons">person</i>
					<p>Support</p>
		  		</a>
			</li>
			<li class="nav-item ">
		  		<a class="nav-link" href="#" onclick="app.logout()">
					<i class="material-icons">logout</i>
					<p>Logout</p>
		  		</a>
			</li>
	  	</ul>
		`
		$('#sidebar').html(navbar)
	},
	login: async () => {
		app.loading();

		try {
			let data = {
				username: document.getElementById('username').value,
				password: document.getElementById('password').value
			};
			result = await fetch(app.api + "/school", {
				headers: new Headers({
					'Content-Type': 'application/json'
				}),
				method: 'POST',
				body: JSON.stringify(data)
			})
			resp = await result.json()

			app.finished()

			if (resp.status == 200) {
				localStorage.setItem('token', resp.token);
				localStorage.setItem('home', location.href);
				location.href = "dashboard.html";
			} else {
				alertify.alert(resp.message)
			}
		} catch (e) {
			app.finished();
		}
	},

	logout: () => {
		localStorage.removeItem('token');
		location.href = localStorage.getItem('home');
	},

	loading: () => {
		ld = document.createElement("div");
		ld.id = "loaderdiv";
		ld.innerHTML = '<div class="loader"> <img src="../assets/img/loader.gif" width="90px" /> </div>';
		document.body.appendChild(ld);
	},

	finished: () => {
		document.getElementById('loaderdiv').remove();
	},


	stats: async () => {
		app.loading();

		result = await fetch(`${app.api}/school/stats`, {
			headers: new Headers({
				'Content-Type': 'application/json',
				'Token': localStorage.getItem('token')
			}),
			method: 'GET'
		})
		resp = await result.json()

		if (resp.status == 200) {
			$('#t1').text(resp.totalUsers);
			$('#t2').text(resp.totalDrivers);
			$('#t3').text(resp.wallet_balance);
			$('#t4').text(resp.price_share.moov);
			$('#t5').text(resp.price_share.driver);
			$('#t6').text(resp.price_share.school);
			$('#schoolname').text(resp.name);
		} else {
			alertify.alert(resp.message);
		}

		app.finished();
	}
}