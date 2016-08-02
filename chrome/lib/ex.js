function loadData() {
	var loadSaved = localStorage.getItem('exh_sddd');
	
	if(loadSaved == '1') {
		$('#saveLogin').attr('checked', 'checked');
	} else {
		return; // We're not reviving!
	}
	
	var savedUser = localStorage.getItem('exh_user');
	var savedPass = localStorage.getItem('exh_pass');
	
	if(savedUser != null && savedPass != null) {
		$('#usernameInput').val(savedUser);
		$('#passwordInput').val(savedPass);
	}
}

function saveData() {
	if($('#saveLogin').is(':checked')) {
		localStorage.setItem('exh_user', $('#usernameInput').val());
		localStorage.setItem('exh_pass', $('#passwordInput').val());
		localStorage.setItem('exh_sddd', '1');
	} else {
		localStorage.removeItem('exh_user');
		localStorage.removeItem('exh_pass');
		localStorage.removeItem('exh_sddd');
	}
}

function displayError(e) {
	$('#errorMsg').css('visibility', 'visible').html('<b>Error</b>: ' + e).hide().fadeIn('slow');
}

function disableLoginForm(msg) {
	$('#loginbutton').addClass('disabled');
	$('#loginbutton').html(msg);
	$('#usernameInput').prop('disabled', true);
	$('#passwordInput').prop('disabled', true);
	$('#saveLogin').prop('disabled', true);
}

function resetLoginForm() {
	$('#loginbutton').removeClass('disabled');
	$('#loginbutton').html('Sign in');
	$('#usernameInput').prop('disabled', false);
	$('#passwordInput').prop('disabled', false);
	$('#saveLogin').prop('disabled', false);
}

function reloadPage() {
	browser.runtime.sendMessage('reload', function(){});
}

function onReturnMessage(status) {
	if(status == 'ok') {
		saveData();
		reloadPage();
	} else {
		displayError(status);
		resetLoginForm();
	}
}

function handleLoginClick() {
	disableLoginForm('Logging in...');

	var username = encodeURIComponent($('#usernameInput').val());
	var password = encodeURIComponent($('#passwordInput').val());
	
	if(username.length == 0 || password.length == 0) {
		displayError('Username and Password required!');
		resetLoginForm();
	} else {
		$.post('https://forums.e-hentai.org/index.php?act=Login&CODE=01', 
			'referer=https://forums.e-hentai.org/index.php&UserName=' + username + '&PassWord=' + password + '&CookieDate=1', function(x) {
			if(x.indexOf('Username or password incorrect') != -1) {
				displayError('Login failure!');
				resetLoginForm();
			} else if(x.indexOf('You must already have registered for an account before you can log in') != -1) {
				displayError('No account exists with name "' + username + '"');
				resetLoginForm();
			} else if(x.indexOf('You are now logged in as:') != -1) {
				browser.runtime.sendMessage('cookieDataSet', onReturnMessage);
			} else {
				displayError('Error parsing login result page!');
				resetLoginForm();
			}
		}).error(function() {
			displayError('Error sending POST request to forums.e-hentai.org!');
			resetLoginForm();
		});
	}
}

function makeLoginForm() {
	var b = $('body');
	
	b.html(
		'<div align="center">' + 
		b.html() +
		'<div id="errorMsg" class="alert alert-danger" style="visibility:hidden; text-align: left;"><b>Error</b>: Hello!</div>' + 
		'</div>' + 
		'<div class="container">' +
			'<div class="form-signin">' + 
				'<input id="usernameInput" type="text" class="form-control" placeholder="Username" required autofocus>' + 
				'<input id="passwordInput" type="password" class="form-control" placeholder="Password" required>' + 
				'<label class="checkbox">' + 
					'<input id="saveLogin" type="checkbox" value="remember-me"> Remember me' + 
				'</label>' + 
				'<button id="loginbutton" class="btn btn-lg btn-success btn-block">Sign in</button>' + 
				'<div align="center" style="margin-top: 12px; font-size: 12px;">' + 
					'<a href="http://haruhichan.com/" target="_blank">Presented by Haruhichan and Toby</a><br />' +
					'<a href="bitcoin:1M79tGdeQrhuwqP1wa9oWpgWoWo86EyoaC">Bitcoin</a>: 1M79tGdeQrhuwqP1wa9oWpgWoWo86EyoaC<br />' + 
					'<a href="litecoin:LRoSWbEPBUzFqawbXHXwLRLPN6L17ypEck">Litecoin</a>: LRoSWbEPBUzFqawbXHXwLRLPN6L17ypEck' + 
				'</div>' + 
			'</div>' + 
		'</div>');
	
	loadData();
	
	$('#loginbutton').click(handleLoginClick);
	$(document).keypress(function(e) {
		if(e.which == 13) {
			$('#loginbutton').click();
		}
	});
}

$(document).ready(function() {
	var exSrc = $("img[src='" + document.URL + "']"); // This is not right!
	
	if(exSrc.length) {
		makeLoginForm();
	}
});