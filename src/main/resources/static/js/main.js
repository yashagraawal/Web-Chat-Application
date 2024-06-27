'use strict';

var usernamePage = document.querySelector('#username-page');
var usernameForm = document.querySelector('#usernameForm');

var chatPage = document.querySelector('#chat-page');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');

var connectingElement = document.querySelector('.connecting');

var loginPage = document.querySelector('#Login-page');
var loginForm = document.querySelector('#loginForm');
var LoginRedirectButton = document.querySelectorAll('.RedirectLogin');

var registerForm = document.querySelector('#registerForm');
var registerPage = document.querySelector('#Register-page');
var RegisterRedirectButton = document.querySelectorAll('.Redirectregister');


var logoutButtons = document.querySelectorAll('.logoutButton');


var stompClient = null;
var username = null;
var email = null;
var password = null;
var confpassword = null;

var colors = [
	'#2196F3', '#32c787', '#00BCD4', '#ff5652',
	'#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function login(event) {
	event.preventDefault(); // Prevent the default form submission

	email = document.querySelector('#email').value.trim();
	password = document.querySelector('#password').value.trim();

	if (email && password) {
		fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email: email, password: password })
		})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					localStorage.setItem('loggedIn', 'true');
					loginPage.classList.add('hidden');
					usernamePage.classList.remove('hidden');
				} else {
					alert('Invalid login credentials. Please try again.');
					document.querySelector('#password').value = ''; // Clear password field
				}
			})
			.catch(error => console.error('Error:', error));
	}
}

function register(event) {
	event.preventDefault(); // Prevent the default form submission

	email = document.querySelector('#email').value.trim();
	password = document.querySelector('#password').value.trim();
	confpassword = document.querySelector('#confpassword').value.trim();

	if (email && password) {
		fetch('/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email: email, password: password, confpassword: confpassword })
		})
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				if (data.success) {
					alert('Registration successful! Please login.');
					RegisterRedirect(); // Redirect to login after successful registration
				} else {
					alert('Something went wrong during registration.');
					document.querySelector('#email').value = '';
					document.querySelector('#password').value = '';
					document.querySelector('#confpassword').value = '';
				}
			})
			.catch(error => {
				console.error('Error:', error);
				alert('There was an error registering. Please try again.');
				document.querySelector('#email').value = '';
				document.querySelector('#password').value = '';
				document.querySelector('#confpassword').value = '';
			});
	}
}

function LoginRedirect() {
	loginPage.classList.remove('hidden');
	usernamePage.classList.add('hidden');
	chatPage.classList.add('hidden');
	registerPage.classList.add('hidden');
}

function RegisterRedirect() {
	loginPage.classList.add('hidden');
	usernamePage.classList.add('hidden');
	chatPage.classList.add('hidden');
	registerPage.classList.remove('hidden');
}


function checkLoginState() {
	if (localStorage.getItem('loggedIn') === 'true') {
		loginPage.classList.add('hidden');
		usernamePage.classList.remove('hidden');
		registerPage.classList.add('hidden');
	} else {
		loginPage.classList.remove('hidden');
		usernamePage.classList.add('hidden');
		chatPage.classList.add('hidden');
		registerPage.classList.add('hidden');
	}
}

function connect(event) {
	username = document.querySelector('#name').value.trim();

	if (username) {
		usernamePage.classList.add('hidden');
		chatPage.classList.remove('hidden');

		var socket = new SockJS('/ws');
		stompClient = Stomp.over(socket);

		stompClient.connect({}, onConnected, onError);
	}
	event.preventDefault();
}

function onConnected() {
	// Subscribe to the Public Topic
	stompClient.subscribe('/topic/public', onMessageReceived);

	// Tell your username to the server
	stompClient.send("/app/chat.addUser",
		{},
		JSON.stringify({ sender: username, type: 'JOIN' })
	)

	connectingElement.classList.add('hidden');
}

function onError(error) {
	connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
	connectingElement.style.color = 'red';
}

function sendMessage(event) {
	var messageContent = messageInput.value.trim();
	if (messageContent && stompClient) {
		var chatMessage = {
			sender: username,
			content: messageInput.value,
			type: 'CHAT'
		};
		stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
		messageInput.value = '';
	}
	event.preventDefault();
}

function onMessageReceived(payload) {
	var message = JSON.parse(payload.body);

	var messageElement = document.createElement('li');

	if (message.type === 'JOIN') {
		messageElement.classList.add('event-message');
		message.content = message.sender + ' joined!';
	} else if (message.type === 'LEAVE') {
		messageElement.classList.add('event-message');
		message.content = message.sender + ' left!';
	} else {
		messageElement.classList.add('chat-message');

		var avatarElement = document.createElement('i');
		var avatarText = document.createTextNode(message.sender[0]);
		avatarElement.appendChild(avatarText);
		avatarElement.style['background-color'] = getAvatarColor(message.sender);

		messageElement.appendChild(avatarElement);

		var usernameElement = document.createElement('span');
		var usernameText = document.createTextNode(message.sender);
		usernameElement.appendChild(usernameText);
		messageElement.appendChild(usernameElement);
	}

	var textElement = document.createElement('p');
	var messageText = document.createTextNode(message.content);
	textElement.appendChild(messageText);

	messageElement.appendChild(textElement);

	messageArea.appendChild(messageElement);
	messageArea.scrollTop = messageArea.scrollHeight;
}

function getAvatarColor(messageSender) {
	var hash = 0;
	for (var i = 0; i < messageSender.length; i++) {
		hash = 31 * hash + messageSender.charCodeAt(i);
	}
	var index = Math.abs(hash % colors.length);
	return colors[index];
}

function logout() {

	if (stompClient) {
		stompClient.disconnect();
	}

	localStorage.removeItem('loggedIn');
	loginPage.classList.remove('hidden');
	usernamePage.classList.add('hidden');
	chatPage.classList.add('hidden');
	registerPage.classList.add('hidden');
	document.querySelector('#email').value = '';
	document.querySelector('#password').value = '';
	username = null;
	email = null;
	password = null;
}

document.addEventListener('DOMContentLoaded', checkLoginState);

loginForm.addEventListener('submit', login, true);
registerForm.addEventListener('submit', register, true);
usernameForm.addEventListener('submit', connect, true);
messageForm.addEventListener('submit', sendMessage, true);
logoutButtons.forEach(button => button.addEventListener('click', logout, true)); // Add event listener to all logout buttons
LoginRedirectButton.forEach(button => button.addEventListener('click', LoginRedirect, true));
RegisterRedirectButton.forEach(button => button.addEventListener('click', RegisterRedirect, true));