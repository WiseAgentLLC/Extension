(function () {
    // NOTE: Always use the latest version of gmail.js from
    // https://github.com/KartikTalwar/gmail.js

    var popupDiv; // the root div for the popup. all html is inside this
    var toolBarDiv; // div that the root div is appended after (gmail toolbar)
    var clientsDiv; // child of popup div, gives structure to html
    var wiseBtn; // the "add to wise agent button" that is added to the tool bar
    var userGmail; // the user's email address
    var apiKeyIsValid = true; // keeps track of if the api key is valid
    var sourceSelect;
    var categorySelect;
    var extensionId = "elpiekaehikfeikdafacpofkjenfipke"

    // does all the initial setup when the page loads
    // on page load, it keeps calling itself until content.js load gmail.js and jquery
    initializeExtension = function () {
        // wait for content.js to append Gmail.js and JQuery to the page
        if (typeof Gmail != "function" || typeof $ != "function") {
            setTimeout('initializeExtension()', 10);
            return;
        }

        getSourceAndCategory();
        gmail = new Gmail();
        userGmail = gmail.get.user_email();

        gmail.observe.on("view_thread", function () {
            console.log("loading page");
            initializePage();
        });

        /**
         * This was needed for inbox, but since inbox no longer works, it is commented out for now
         * until the gmail.js library is fixed.
         */
        // window.onhashchange = () => {
        // 	console.log("changing page");
        // 	initializePage();
        // };
    }

    // Messages background.js to get json for source and category from server
    // If it wasn't successful, sets error flag that api key is bad
    // THE APIKEY CHECK NEEDS TO BE DECOUPLED FROM THE CATEGORY AND SOURCE
    function getSourceAndCategory() {
        chrome.runtime.sendMessage(extensionId, {
                "action": "getSourceJson",
                "data": ""
            },
            function (json) {
                if (json == "invalid") {
                    apiKeyIsValid = false;
                } else {
                    buildSourceSelect(JSON.parse(json));
                }
            }
        );

        chrome.runtime.sendMessage(extensionId, {
                "action": "getCategoryJson",
                "data": ""
            },
            function (json) {
                if (json == "invalid") {
                    apiKeyIsValid = false;
                } else {
                    buildCategorySelect(JSON.parse(json));
                }
            }
        );
    }

    function buildSourceSelect(sourceJson) {
        var select = $("<select></select>")
            .attr("name", "Source")
            .addClass("form-inputs")
            .css({
                "width": "100%"
            });
        select.append($("<option value=''>Source</option>"));

        for (var index in sourceJson) {
            var currentCategory = sourceJson[index];
            var currentText = currentCategory.name;

            select.append($("<option></option>").val(currentText).text(currentText));
        }

        sourceSelect = select;
    }

    function buildCategorySelect(categoryJson) {
        var select = $("<select></select>")
            .attr("name", "Category")
            // .attr("multiple", "")
            .addClass("form-inputs")
            .css({
                "width": "100%"
            });
        select.append($("<option value=''>Category</option>"));

        for (var index in categoryJson) {
            currentCategory = categoryJson[index];
            currentVal = currentCategory.id;
            currentText = currentCategory.name;

            select.append($("<option></option>").val(currentVal).text(currentText));
        }

        categorySelect = select;
    }

    function initializePage() {
        if (popupDiv)
            popupDiv.remove();

        toolBarDiv = $("#\\:4");
        initializeAddClientView();
        renderAddClientsBtn();
    }

    function initializeAddClientView() {
        popupDiv = $("<div><div>")
            .attr("id", "popup")
            .addClass("popup");

        clientsDiv = $("<div><div>")
            .attr("id", "clients-div")
            .addClass("clients-div");

        popupDiv.append(clientsDiv)
        toolBarDiv.after(popupDiv);
    }

    function renderAddClientsBtn() {
        // set timeout fixes button not rendering when using back/forward to switch views
        setTimeout(function () {

            if (wiseBtn)
                wiseBtn.remove();

            wiseBtn = gmail.tools.add_toolbar_button('Add to Wise Agent', function () {
                renderPopup();
            }, 'Dj');
        }, 50);
    }

    function renderPopup() {
        clientsDiv.html("");

        if (popupDiv.children().length == 2) {
            var popupHead = $("<div class='wa-header'></div>")
                .append($("<span class='wa-title'></span>"));

            var popupClose = $("<div class='popup-close'>✕</div>")
                .on("click", function () {
                    popupDiv.hide();
                });

            var logoLink = $("<a href='https://www.thewiseagent.com/secure/client/ClientWelcome.asp'></a>")
                .append(
                    $("<img></img>").attr("src", "chrome-extension://" + extensionId + "/MenuLogo-blue.png"));

            var topCaret = $("<div></div>")
                .addClass("wa-caret");

            popupHead.append(popupClose)
                .prepend(logoLink);

            popupDiv.prepend(popupHead)
                .append(topCaret);
        }

        if (apiKeyIsValid) {
            renderClientView();
        } else {
            renderInvalidHtml();
        }

        popupDiv.show();
    }

    function renderClientView() {
        if (gmail.get.current_page() == "email")
            addClientsFromEmailPage();
        else
            addClientsFromCheckedEmails();
    }

    function addClientsFromEmailPage() {
        var client = gmail.get.displayed_email_data().people_involved;

        for (var j = 0; j < client.length; j++) {
            var name = client[j][0];
            var email = client[j][1];

            if (isValidEmail(email)) {
                addClientToPopup(name, email, 0);
            }
        }
    }

    function addClientsFromCheckedEmails() {
        var emails = gmail.get.selected_emails_data();


        var x = gmail.new.get.email_id();

        console.log("selected emails: ", x)

        if (emails.length == 0) {
            var newDiv = $("<div>Please check an email you want to add contacts from.</div>")
                .addClass("client-row success");
            clientsDiv.append(newDiv);
        } else {
            var newDiv = $("<div>Could not find any email addresses. (no-reply is ignored)</div>")
                .addClass("client-row success");
            clientsDiv.append(newDiv);
        }

        for (var i = 0; i < emails.length; i++) {
            var client = emails[i].people_involved;

            for (var j = 0; j < client.length; j++) {

                var name = client[j][0];
                var email = client[j][1];

                if (isValidEmail(email)) {
                    addClientToPopup(name, email);
                    $(".client-row.success").hide();
                }
            }
        }
    }

    function isValidEmail(email) {
        var inValidStrings = ["no-reply", "noreply", "wiseagentmail.com", userGmail];

        if (email.length == 0)
            return false;

        for (var i = 0; i < inValidStrings.length; i++) {
            if (email.includes(inValidStrings[i]))
                return false;
        }

        return true;
    }

    function addClientToPopup(name, email) {
        var clientDiv = $("<div></div>")
            .attr("name", name)
            .attr("emailAddress", email)
            .addClass("client-row");

        name = name.length == 0 ? email : name;

        var clientNameDiv = $("<div></div>")
            .text(name)
            .addClass("clientName");

        var detailsButton = $("<button></button>")
            .text("Details")
            .addClass("wise-btn btn-blue")
            .on("click", makeFormHtml);

        var successMsgDiv = $("<div></div>")
            .text("Success!")
            .addClass("success")
            .css("display", "none");

        var duplicateMsgDiv = $("<div></div>")
            .text("Sorry, a contact with that email address already exists.")
            .addClass("error")
            .attr("name", "duplicate")
            .css("display", "none");

        var errorMsgDiv = $("<div></div>")
            .text("There was an error adding your contact.")
            .addClass("error")
            .attr("name", "error")
            .css("display", "none");

        var loader = $("<div></div>")
            .addClass("loader")
            .css("display", "none");

        var btnDiv = $("<div></div>")
            .addClass("btnDiv")
            .append(detailsButton)
            .append(loader);

        clientDiv.append(clientNameDiv)
            .append(btnDiv)
            .append(successMsgDiv)
            .append(duplicateMsgDiv)
            .append(errorMsgDiv);

        clientsDiv.append(clientDiv);
    }

    function makeFormHtml() {
        $(this).blur();
        var parent = $(this).parent().parent();
        var name = parent.attr("name");
        var email = parent.attr("emailAddress");

        var form = createAddClientForm(name, email);
        var phoneRadios = createPhoneRadios();

        var textArea = $("<textarea/>")
            .addClass("extra-details")
            .attr("name", "extraDetails")
            .attr("placeholder", "Extra Details");
        var btn = $("<input type='button' value='Add to Wise Agent'>")
            .addClass("wise-btn btn-green")
            .on("click", addContactToWiseAgent);
        var btnDiv = $("<div></div>")
            .addClass("btnDiv")
            .append(btn);

        form.append(phoneRadios)
            .append(textArea)
            .append(btnDiv);

        parent.after(form);

        $(this)
            .text("Hide")
            .addClass("btn-yellow")
            .removeClass("btn-blue")
            .off('click').on("click", function () {
                $(this).closest(".client-row").next().remove();

                $(this).blur();

                $(this)
                    .off('click').on("click", makeFormHtml)
                    .text("Details")
                    .removeClass("btn-yellow")
                    .addClass("btn-blue");
            });

        $("input[name=Name]").focus();
    }

    function createPhoneRadios() {
        return $("<div></div>")
            .addClass("phoneType")
            .append("<input type='radio' name='phone-type' tabindex='-1' value='Mobile' checked=''>")
            .append("<label class='radioLabel' for='phone-type'>Mobile</label>")
            .append("<input type='radio' name='phone-type' tabindex='-1' value='Business'>")
            .append("<label class='radioLabel' for='phone-type'>Work</label>")
            .append("<input type='radio' name='phone-type' tabindex='-1' value='Home'>")
            .append("<label class='radioLabel' for='phone-type'>Home</label>");
    }

    function createAddClientForm(name, email) {
        return $("<form></form>")
            .addClass("formDiv")
            .append("<input type='text' class='form-inputs' name='Name' placeholder='Name' value='" + name + "'>")
            .append("<input type='text' class='form-inputs' name='Email' placeholder='Email' value='" + email + "'>")
            .append("<input type='text' class='form-inputs' name='Title' placeholder='Title'>")
            .append("<input type='text' class='form-inputs' name='Company' placeholder='Company'>")
            .append(categorySelect.clone())
            .append(sourceSelect.clone())
            .append("<input type='text' class='form-inputs' name='Phone' placeholder='Phone Number'>")
    }

    function addContactToWiseAgent() {
        var form = $(this).closest("form");

        chrome.runtime.sendMessage(extensionId, {
                "action": "addContact",
                "data": $(this).parent().parent().serialize()
            },
            function (clientId) {
                form.prev().find(".loader").hide();

                if (isValidClientId(clientId)) {
                    form.prev().find(".success").show();
                    var thisBtn = form.prev().find(".btnDiv").find("button");
                    var clientLink = $("<a></a>")
                        .attr("href", "https://www.thewiseagent.com/secure/client/SUMMARY.asp?ClientID=" + clientId)
                        .text("View")
                        .addClass("wise-btn btn-green a-btn");

                    thisBtn.after(clientLink);
                } else if (clientId == "-1") {
                    form.prev().find("[name=duplicate]").show();
                } else {
                    form.prev().find("[name=error]").show();
                }
            }
        );

        form.hide();
        form.prev().find(".loader").show();
        form.prev().find(".wise-btn").hide()
    }

    function isValidClientId(clientId) {
        return !isNaN(clientId) && parseInt(clientId) > 0;
    }

    function renderInvalidHtml() {
        clientsDiv.append(
            $("<div>Your API key is invalid. Please check that it was entered correctly.</div>")
            .addClass("client-row error")
        );
    }

    initializeExtension();
})();
