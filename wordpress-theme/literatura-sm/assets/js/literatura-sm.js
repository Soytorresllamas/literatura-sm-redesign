/**
 * Interacciones del tema Literatura SM.
 *
 * Vanilla JS sin dependencias ni build. Cada módulo se activa solo si su
 * marcado está presente, y todo el sitio funciona también sin JavaScript:
 * aquí solo vive la mejora progresiva (menú móvil, carrusel, compartir,
 * teatro de booktrailers y auto-envío de filtros).
 */
(function () {
	'use strict';

	function listo(funcion) {
		if (document.readyState !== 'loading') {
			funcion();
		} else {
			document.addEventListener('DOMContentLoaded', funcion);
		}
	}

	/* ------------------------------------------------------------------
	 * Menú móvil (≤850 px): abre y cierra la navegación desplegable.
	 * ------------------------------------------------------------------ */
	function menuMovil() {
		var boton = document.querySelector('[data-menu-movil]');
		if (!boton) {
			return;
		}
		var navegacion = document.getElementById(boton.getAttribute('aria-controls'));
		if (!navegacion) {
			return;
		}
		var icono = boton.querySelector('span');

		function cerrar() {
			navegacion.setAttribute('hidden', '');
			boton.setAttribute('aria-expanded', 'false');
			if (icono) {
				icono.textContent = '＋';
			}
		}

		boton.addEventListener('click', function () {
			var abrir = navegacion.hasAttribute('hidden');
			if (abrir) {
				navegacion.removeAttribute('hidden');
				boton.setAttribute('aria-expanded', 'true');
				if (icono) {
					icono.textContent = '×';
				}
			} else {
				cerrar();
			}
		});

		navegacion.addEventListener('click', function (evento) {
			if (evento.target.closest('a')) {
				cerrar();
			}
		});
	}

	/* ------------------------------------------------------------------
	 * Carrusel de novedades: misma lógica circular que el rediseño.
	 * Las diapositivas son enlaces a la ficha; si la diapositiva no es la
	 * activa, el clic solo la trae al centro.
	 * ------------------------------------------------------------------ */
	function carruselNovedades() {
		var carrusel = document.querySelector('[data-carrusel-novedades]');
		if (!carrusel) {
			return;
		}
		var diapositivas = Array.prototype.slice.call(carrusel.querySelectorAll('.novelty-slide'));
		var puntos = Array.prototype.slice.call(carrusel.querySelectorAll('[data-punto]'));
		var total = diapositivas.length;
		if (!total) {
			return;
		}

		var copia = carrusel.querySelector('[data-copia]');
		var contador = carrusel.querySelector('[data-contador]');
		var tituloEnlace = carrusel.querySelector('[data-titulo-enlace]');
		var autorActivo = carrusel.querySelector('[data-autor-activo]');
		var notaActiva = carrusel.querySelector('[data-nota-activa]');
		var enlaceActivo = carrusel.querySelector('[data-enlace-activo]');
		var activo = 0;
		var inicioTacto = null;

		function rellenar(numero) {
			return String(numero).padStart(2, '0');
		}

		function clasePosicion(distancia) {
			if (distancia === 0) {
				return 'is-active';
			}
			if (distancia === -1) {
				return 'is-previous';
			}
			if (distancia === 1) {
				return 'is-next';
			}
			if (distancia === -2) {
				return 'is-far-previous';
			}
			if (distancia === 2) {
				return 'is-far-next';
			}
			return 'is-hidden';
		}

		function pintar() {
			diapositivas.forEach(function (diapositiva, indice) {
				var distancia = indice - activo;
				if (distancia > total / 2) {
					distancia -= total;
				}
				if (distancia < -total / 2) {
					distancia += total;
				}
				diapositiva.className = 'novelty-slide ' + clasePosicion(distancia);
				if (distancia === 0) {
					diapositiva.setAttribute('aria-current', 'true');
					diapositiva.removeAttribute('tabindex');
				} else {
					diapositiva.removeAttribute('aria-current');
					diapositiva.setAttribute('tabindex', '-1');
				}
			});

			puntos.forEach(function (punto, indice) {
				punto.classList.toggle('is-active', indice === activo);
				if (indice === activo) {
					punto.setAttribute('aria-current', 'true');
				} else {
					punto.removeAttribute('aria-current');
				}
			});

			var actual = diapositivas[activo];
			if (contador) {
				contador.textContent = rellenar(activo + 1) + ' / ' + rellenar(total);
			}
			if (tituloEnlace) {
				tituloEnlace.textContent = actual.getAttribute('data-titulo') || '';
				tituloEnlace.href = actual.href;
			}
			if (autorActivo) {
				autorActivo.textContent = actual.getAttribute('data-autor') || '';
			}
			if (notaActiva) {
				notaActiva.textContent = actual.getAttribute('data-nota') || '';
			}
			if (enlaceActivo) {
				enlaceActivo.href = actual.href;
			}
			if (copia) {
				// Reinicia la animación de entrada del texto.
				copia.style.animation = 'none';
				void copia.offsetWidth;
				copia.style.animation = '';
			}
		}

		function mover(direccion) {
			activo = (activo + direccion + total) % total;
			pintar();
		}

		diapositivas.forEach(function (diapositiva, indice) {
			diapositiva.addEventListener('click', function (evento) {
				if (indice !== activo) {
					evento.preventDefault();
					activo = indice;
					pintar();
				}
			});
		});

		puntos.forEach(function (punto, indice) {
			punto.addEventListener('click', function () {
				activo = indice;
				pintar();
			});
		});

		carrusel.querySelectorAll('[data-anterior]').forEach(function (boton) {
			boton.addEventListener('click', function () {
				mover(-1);
			});
		});
		carrusel.querySelectorAll('[data-siguiente]').forEach(function (boton) {
			boton.addEventListener('click', function () {
				mover(1);
			});
		});

		carrusel.addEventListener('keydown', function (evento) {
			if (evento.key === 'ArrowLeft') {
				mover(-1);
			}
			if (evento.key === 'ArrowRight') {
				mover(1);
			}
		});

		carrusel.addEventListener('touchstart', function (evento) {
			inicioTacto = evento.touches[0] ? evento.touches[0].clientX : null;
		}, { passive: true });
		carrusel.addEventListener('touchend', function (evento) {
			if (inicioTacto === null) {
				return;
			}
			var distancia = (evento.changedTouches[0] ? evento.changedTouches[0].clientX : 0) - inicioTacto;
			if (Math.abs(distancia) > 45) {
				mover(distancia > 0 ? -1 : 1);
			}
			inicioTacto = null;
		});
	}

	/* ------------------------------------------------------------------
	 * Compartir: WhatsApp, Facebook y correo son enlaces normales.
	 * Instagram usa la hoja nativa (navigator.share) o copia el enlace;
	 * «Copiar enlace» confirma con un aviso temporal.
	 * ------------------------------------------------------------------ */
	function compartir() {
		document.querySelectorAll('[data-compartir]').forEach(function (menu) {
			var aviso = menu.querySelector('[data-aviso]');
			var temporizador = null;
			var url = menu.getAttribute('data-url') || window.location.href;

			function avisar(mensaje) {
				if (!aviso) {
					return;
				}
				aviso.textContent = mensaje;
				window.clearTimeout(temporizador);
				temporizador = window.setTimeout(function () {
					aviso.textContent = '';
				}, 3200);
			}

			function copiarEnlace(mensaje) {
				if (navigator.clipboard && navigator.clipboard.writeText) {
					navigator.clipboard.writeText(url).then(
						function () {
							avisar(mensaje);
						},
						function () {
							avisar('No se pudo copiar el enlace');
						}
					);
				} else {
					avisar('No se pudo copiar el enlace');
				}
			}

			var botonCopiar = menu.querySelector('[data-copiar]');
			if (botonCopiar) {
				botonCopiar.addEventListener('click', function () {
					copiarEnlace('Enlace copiado ✓');
				});
			}

			var botonInstagram = menu.querySelector('[data-instagram]');
			if (botonInstagram) {
				botonInstagram.addEventListener('click', function () {
					if (navigator.share) {
						navigator.share({
							title: menu.getAttribute('data-titulo') || document.title,
							text: menu.getAttribute('data-texto') || '',
							url: url
						}).catch(function () {
							// La persona cerró la hoja de compartir: no es un error.
						});
						return;
					}
					copiarEnlace('Enlace copiado — pégalo en tu historia o mensaje');
				});
			}
		});
	}

	/* ------------------------------------------------------------------
	 * Teatro de booktrailers: nada de YouTube se carga hasta el clic.
	 * El póster se sustituye por el iframe youtube-nocookie y las
	 * tarjetas cambian el trailer activo (sin JS, llevan a la ficha).
	 * ------------------------------------------------------------------ */
	function teatroTrailers() {
		var teatro = document.querySelector('[data-teatro]');
		if (!teatro) {
			return;
		}
		var escenario = teatro.querySelector('[data-escenario]');
		var metaEdad = teatro.querySelector('[data-meta-edad]');
		var metaTitulo = teatro.querySelector('[data-meta-titulo]');
		var metaAutor = teatro.querySelector('[data-meta-autor]');
		var metaEnlace = teatro.querySelector('[data-meta-enlace]');
		var tarjetas = Array.prototype.slice.call(teatro.querySelectorAll('[data-trailer]'));
		if (!escenario) {
			return;
		}

		function reproducir(video, titulo) {
			var iframe = document.createElement('iframe');
			iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(video) + '?autoplay=1&rel=0';
			iframe.title = 'Booktrailer de ' + titulo;
			iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
			iframe.setAttribute('allowfullscreen', '');
			escenario.innerHTML = '';
			escenario.appendChild(iframe);
		}

		var poster = teatro.querySelector('[data-poster]');
		if (poster) {
			poster.addEventListener('click', function (evento) {
				evento.preventDefault();
				reproducir(poster.getAttribute('data-video'), metaTitulo ? metaTitulo.textContent : '');
			});
		}

		tarjetas.forEach(function (tarjeta) {
			tarjeta.addEventListener('click', function (evento) {
				evento.preventDefault();
				tarjetas.forEach(function (otra) {
					otra.classList.remove('is-active');
				});
				tarjeta.classList.add('is-active');
				if (metaEdad) {
					metaEdad.textContent = (tarjeta.getAttribute('data-edad') || '') + ' · Booktrailer';
				}
				if (metaTitulo) {
					metaTitulo.textContent = tarjeta.getAttribute('data-titulo') || '';
				}
				if (metaAutor) {
					metaAutor.textContent = tarjeta.getAttribute('data-autor') || '';
				}
				if (metaEnlace) {
					metaEnlace.href = tarjeta.href;
				}
				reproducir(tarjeta.getAttribute('data-video'), tarjeta.getAttribute('data-titulo') || '');
				escenario.scrollIntoView({ behavior: 'smooth', block: 'center' });
			});
		});
	}

	/* ------------------------------------------------------------------
	 * Filtros del catálogo: con JS, cambiar un radio o un select envía el
	 * formulario al instante; sin JS queda el botón «Aplicar filtros».
	 * ------------------------------------------------------------------ */
	function filtrosAutomaticos() {
		document.querySelectorAll('[data-filtros-auto]').forEach(function (formulario) {
			formulario.addEventListener('change', function (evento) {
				if (evento.target.matches('select, input[type="radio"]')) {
					formulario.submit();
				}
			});
		});
	}

	listo(function () {
		menuMovil();
		carruselNovedades();
		compartir();
		teatroTrailers();
		filtrosAutomaticos();
	});
})();
