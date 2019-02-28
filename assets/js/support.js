app = {
    ...app,
    support_messages: null,
    getAllSupportMessages: async (supportType='user') => {
        try{
        let route = `${app.api}/admin/supports/${filters.supports.page}/${
            filters.supports.limit
        }?keyword=${filters.supports.keyword}&school=${
            filters.supports.school
        }&message_type=${supportType}`;
        app.loading();
        result = await fetch(route, {
            headers: new Headers({
                "Content-Type": "application/json",
                Token: localStorage.getItem("token")
            }),
            method: "GET"
        });
        resp = await result.json();
        app.support_messages = resp.messages;
        
        app.renderSupportMessages(
            document.getElementById("support_messages"),
            resp.messages,
            supportType
        );
        }catch(e){
            msg.error("Sorry, an error occured while fetching messages!");
        }
        finally{
            app.finished();
        }

       
    },
    async showMessageDetailsPopup(messageID) {
        const message = this.support_messages.find((message) => message.id === messageID);
        let html = `
				<div class="row justify-content-md-center">
				  <div class="col-md-12">
				    <div class=""> 
				      <div class="card-body">
				        <h4 class="card-title"><strong class='purple-text'>${message.user?'Name: ':'School: '}</strong>${message.user?(message.user.first_name+" "+message.user.last_name):message.school.name}</h4>
                        <h4 class="card-title"><strong  class='purple-text'>Email:</strong> ${message.user?message.user.email:message.school.email}</h4>
                        <h4 class="card-title"><strong  class='purple-text'>Date/Time:</strong> ${message.created_at}</h4>
				        <h4 class="card-title"><strong  class='purple-text'>Subject:</strong> ${message.subject}</h4>
				        <h4 class="card-title"><strong   class='purple-text'>Message:</strong> <div class='pre-wrap'>${message.message}</div></h4>
				      </div>
				    </div>
				  </div>
				</div>
			
		`;
        await msg.alert(html, 'Message Details', {
            padding: true
        })
    },
    async showReplyMessagePopup(messageID) {
        const message = this.support_messages.find((message) => message.id === messageID);
        let html = `
            <div id='activeModal'>
				<div class="row justify-content-md-center">
				  <div class="col-md-12">
				    <div class=""> 
                      <div class="card-body">
                        <form onsubmit='app.submitSupportMessage();return false;'>
                            <div class='form-group'>
                                <label>Subject *</label>
                                <input required class='form-control' name='subject' value='Reply: ${message.subject}' />
                            </div>
                            <div class='form-group'>
                                <label>Message *</label>
                                <textarea required name='message' class='form-control'  rows='5' placeholder='Your messages goes here.......'></textarea>
                            </div>
                            <input type='hidden' required class='form-control' name='recipient_name' value='${message.user?(message.user.first_name+" "+message.user.last_name):message.school.name}' />
                            <input type='hidden' required class='form-control' name='recipient_email' value='${message.user?(message.user.email):message.school.email}' />
                            <div style="display: flex;justify-content: center;width: 100%;">
                                <button type='submit' class="btn btn-primary"><i class="material-icons">mail</i> Send </button>
                            </div>
                        </form>
				      </div>
				    </div>
				  </div>
				</div>
			</div>
        `;

        msg.alert(html, 'Reply Message', {
            basic: true,
            padding: false
        })

    },
     submitSupportMessage: async() => {
        try {
            let data = {
                subject: $('#activeModal input[name=subject]').val(),
                message: $('#activeModal textarea[name=message]').val(),
				institution_id:app.institution_id
            }
            let route = `${app.api}/admin/support/email`;
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
            if (resp.status == 200) {
                msg.closeAll()
                msg.success(resp.message);
            } else {
                msg.error(resp.message);
            }
        } catch (e) {
            console.error("Submit support message",e)
            msg.error("Unknown error occured while processing your request!");
        }
        finally{
            app.finished();
        }
    },
    sendUserSupportMessage: async(support_type='school') => {
        try {
            let data = {
                subject: $('#schoolSupport input[name=subject]').val(),
                message: $('#schoolSupport textarea[name=message]').val(),
                school_id:app.institution_id,
                message_type:support_type,
                from:""
            }
            let route = `${app.api}/support/email`;
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
            if (resp.status == true) {
                msg.closeAll()
                msg.success(resp.message);
            } else {
                msg.error(resp.message);
            }
        } catch (e) {
            console.error("Submit support message",e)
            msg.error("Unknown error occured while processing your request!");
        }
        finally{
            app.finished();
        }
    },
    sendSchoolSupport: async() => {
        try {
            let data = {
                
                subject: $('#schoolSupport input[name=subject]').val(),
                message: $('#schoolSupport textarea[name=message]').val(),
                institution_id: $('#schoolSupport textarea[name=message]').val()
            }
            let route = `${app.api}/admin/support/email`;
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
            if (resp.status == 200) {
                msg.closeAll()
                msg.success(resp.message);
            } else {
                msg.error(resp.message);
            }
        } catch (e) {
            console.error("Submit support message",e)
            msg.error("Unknown error occured while processing your request!");
        }
        finally{
            app.finished();
        }
    },
    renderSupportMessages: (container, supports,message_type) => {
        let html = "";
        /* <td>${transaction.user.first_name} ${transaction.user.last_name}</td>
        			<td>${transaction.amount}</td>
        			<td>${transaction.date}</td>
        			<td>${Humanize.capitalize(transaction.type.replace("_", " "))}</td>
                    <td>${Humanize.capitalize(transaction.status)}</td> */
        html+=app.renderErrorMessageWhenEmpty(supports,'supports')
        for (i in supports) {
            let message = supports[i];
            let row = `
				<tr>
					<td>${message.id}</td>
					<td>${message.user?(message.user.first_name+" "+message.user.last_name):message.school.name}</td>
					<td>${message.subject}</td>
					<td>${message.created_at}</td>
					<td>
						<button class='btn btn-sm btn-info' onclick='app.showMessageDetailsPopup(${message.id})'>Details</button>
						<button class='btn btn-sm btn-warning' onclick='app.showReplyMessagePopup(${message.id})'><i class="material-icons">mail</i> Reply</button>
					</td>
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
								<td> <button class='btn btn-primary' onclick="filters.supports.page++; app.getAllSupportMessages()">Next</button> </td>
							</tr>
						`;
                html += row;
            } else {
                let row = `
							<tr>
								<td> <button class='btn btn-primary' onclick="if(filters.supports.page == 1){ return; } filters.supports.page--; app.getAllSupportMessages();">Prev</button> </td>
								<td> </td>
								<td> </td>
								<td> <button class='btn btn-primary' onclick="filters.supports.page++; app.getAllSupportMessages()">Next</button> </td>
							</tr>
						`;
                html += row;
            }
        } else {
            let row = `
						<tr>
							<td> <button class='btn btn-primary' onclick="if(filters.supports.page == 1){ return; } filters.supports.page--; app.getAllSupportMessages();">Prev</button> </td>
						</tr>
					`;
            html += row;
        }
        /* ----------- END PAGINATION ============== */

        container.innerHTML = html;
    }

}