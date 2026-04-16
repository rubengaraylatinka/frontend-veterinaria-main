
const API_URL = 'https://backend-veterinaria-ruben-garay-506160926608.europe-west1.run.app';

// Elementos
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const dashboard = document.getElementById('dashboard');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const serviceForm = document.getElementById('service-form');
const attentionForm = document.getElementById('attention-form');
const serviceSelect = document.getElementById('service-select');
const historyList = document.getElementById('history-list');

// Utilidades de cookies
function setCookie(name, value, days) {
	let expires = '';
	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}
function getCookie(name) {
	const v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
	return v ? decodeURIComponent(v[2]) : null;
}
function eraseCookie(name) {
	document.cookie = name + '=; Max-Age=0; path=/';
}

function mostrarDashboard() {
	loginForm.classList.add('hidden');
	registerForm.classList.add('hidden');
	dashboard.classList.remove('hidden');
	cargarServicios();
	limpiarDashboard();
}
function mostrarLogin() {
	dashboard.classList.add('hidden');
	registerForm.classList.add('hidden');
	loginForm.classList.remove('hidden');
	limpiarDashboard();
}
function mostrarRegistro() {
	dashboard.classList.add('hidden');
	loginForm.classList.add('hidden');
	registerForm.classList.remove('hidden');
	limpiarDashboard();
}

// Mostrar/Ocultar formularios
showRegister.addEventListener('click', (e) => {
	e.preventDefault();
	mostrarRegistro();
});
showLogin.addEventListener('click', (e) => {
	e.preventDefault();
	mostrarLogin();
});

// Registro
registerForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const correo = document.getElementById('register-email').value.trim();
	const contrasena = document.getElementById('register-password').value;
	const msg = document.getElementById('register-message');
	msg.textContent = '';
	try {
		const res = await fetch(`${API_URL}/usuarios/registro`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ correo, contrasena })
		});
		if (res.ok) {
			msg.style.color = '#27ae60';
			msg.textContent = '¡Registro exitoso! Ahora inicia sesión.';
			setTimeout(() => {
				mostrarLogin();
				msg.textContent = '';
			}, 1200);
		} else {
			const data = await res.json();
			msg.style.color = '#e74c3c';
			msg.textContent = data.detail || 'Error en el registro.';
		}
	} catch {
		msg.style.color = '#e74c3c';
		msg.textContent = 'Error de conexión.';
	}
});

// Login
loginForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const correo = document.getElementById('login-email').value.trim();
	const contrasena = document.getElementById('login-password').value;
	const msg = document.getElementById('login-message');
	msg.textContent = '';
	try {
		const res = await fetch(`${API_URL}/usuarios/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ correo, contrasena })
		});
		const data = await res.json();
		if (data.ok) {
			setCookie('userEmail', correo, 2);
			mostrarDashboard();
		} else {
			msg.style.color = '#e74c3c';
			msg.textContent = data.error || 'Credenciales incorrectas.';
		}
	} catch {
		msg.style.color = '#e74c3c';
		msg.textContent = 'Error de conexión.';
	}
});

// Logout
logoutBtn.addEventListener('click', () => {
	eraseCookie('userEmail');
	mostrarLogin();
});

// Agregar Servicio
serviceForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const nombre = document.getElementById('service-name').value.trim();
	const costo = parseFloat(document.getElementById('service-cost').value);
	const msg = document.getElementById('service-message');
	msg.textContent = '';
	const userEmail = getCookie('userEmail');
	if (!userEmail) {
		mostrarLogin();
		return;
	}
	if (!nombre || isNaN(costo)) {
		msg.textContent = 'Completa todos los campos.';
		return;
	}
	try {
		const res = await fetch(`${API_URL}/servicios`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ nombre, costo })
		});
		if (res.ok) {
			msg.style.color = '#27ae60';
			msg.textContent = 'Servicio agregado.';
			document.getElementById('service-name').value = '';
			document.getElementById('service-cost').value = '';
			cargarServicios();
		} else {
			msg.style.color = '#e74c3c';
			msg.textContent = 'Error al agregar servicio.';
		}
	} catch {
		msg.style.color = '#e74c3c';
		msg.textContent = 'Error de conexión.';
	}
});

// Cargar servicios en el select
async function cargarServicios() {
	try {
		const res = await fetch(`${API_URL}/servicios`);
		const servicios = await res.json();
		serviceSelect.innerHTML = '<option value="">Selecciona un servicio</option>';
		servicios.forEach(s => {
			const opt = document.createElement('option');
			opt.value = s.nombre;
			opt.textContent = `${s.nombre} ($${s.costo})`;
			serviceSelect.appendChild(opt);
		});
	} catch {
		serviceSelect.innerHTML = '<option value="">Error al cargar servicios</option>';
	}
}

// Agregar Atención
attentionForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const duenio = document.getElementById('owner-name').value.trim();
	const mascota = document.getElementById('pet-name').value.trim();
	const servicio = serviceSelect.value;
	const fecha = document.getElementById('attention-date').value;
	const msg = document.getElementById('attention-message');
	msg.textContent = '';
	const userEmail = getCookie('userEmail');
	if (!userEmail) {
		mostrarLogin();
		return;
	}
	if (!duenio || !mascota || !servicio || !fecha) {
		msg.textContent = 'Completa todos los campos.';
		return;
	}
	try {
		const res = await fetch(`${API_URL}/atenciones`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ correo: userEmail, duenio, mascota, servicio, fecha })
		});
		if (res.ok) {
			msg.style.color = '#27ae60';
			msg.textContent = 'Atención registrada.';
			document.getElementById('owner-name').value = '';
			document.getElementById('pet-name').value = '';
			document.getElementById('attention-date').value = '';
			cargarHistorial(duenio);
		} else {
			const data = await res.json();
			msg.style.color = '#e74c3c';
			msg.textContent = data.detail || 'Error al registrar atención.';
		}
	} catch {
		msg.style.color = '#e74c3c';
		msg.textContent = 'Error de conexión.';
	}
});

// Cargar historial de atenciones
async function cargarHistorial(duenio) {
	historyList.innerHTML = '<div>Cargando...</div>';
	try {
		const res = await fetch(`${API_URL}/atenciones/por-duenio/${encodeURIComponent(duenio)}`);
		if (!res.ok) throw new Error();
		const data = await res.json();
		if (data.atenciones.length === 0) {
			historyList.innerHTML = '<div>No hay atenciones registradas.</div>';
		} else {
			historyList.innerHTML = '';
			data.atenciones.forEach(a => {
				const div = document.createElement('div');
				div.className = 'history-item';
				div.innerHTML = `<span class="history-info">${a.fecha} - ${a.mascota} (${a.servicio})</span> <span class="history-cost">$${a.costo}</span>`;
				historyList.appendChild(div);
			});
			const totalDiv = document.createElement('div');
			totalDiv.className = 'history-item';
			totalDiv.innerHTML = `<span class="history-info"><b>Total</b></span> <span class="history-cost"><b>$${data.costo_total}</b></span>`;
			historyList.appendChild(totalDiv);
		}
	} catch {
		historyList.innerHTML = '<div>Error al cargar historial.</div>';
	}
}

// Limpiar dashboard al entrar/salir
function limpiarDashboard() {
	document.getElementById('service-message').textContent = '';
	document.getElementById('attention-message').textContent = '';
	historyList.innerHTML = '';
	document.getElementById('owner-name').value = '';
	document.getElementById('pet-name').value = '';
	document.getElementById('attention-date').value = '';
	document.getElementById('service-name').value = '';
	document.getElementById('service-cost').value = '';
	serviceSelect.innerHTML = '<option value="">Selecciona un servicio</option>';
}

// Al cargar la página, mostrar el panel correcto según la cookie
window.addEventListener('DOMContentLoaded', () => {
	const userEmail = getCookie('userEmail');
	if (userEmail) {
		mostrarDashboard();
	} else {
		mostrarLogin();
	}
});

// Cargar historial automáticamente al escribir dueño
const ownerNameInput = document.getElementById('owner-name');
ownerNameInput.addEventListener('blur', () => {
	const duenio = ownerNameInput.value.trim();
	if (duenio) cargarHistorial(duenio);
});
