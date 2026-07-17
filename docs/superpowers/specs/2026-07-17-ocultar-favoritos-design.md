# Diseño para ocultar temporalmente favoritos

Fecha: 2026-07-17  
Estado: diseño aprobado

## Contexto

El sistema local de favoritos ya está implementado y conserva la selección de libros en el dispositivo. Por ahora, la interfaz pública debe omitir todos sus puntos de entrada sin eliminar la implementación ni alterar los datos guardados.

## Objetivo

Desactivar de forma centralizada y reversible la presentación del módulo de favoritos en todas las pantallas.

La desactivación comprende:

- botones de corazón en home, catálogo, novedades y ficha de libro;
- contador e indicador del header;
- enlaces y tarjetas de “Mi lista” en la cuenta;
- acceso directo a `/lista`.

## Conservación

Se mantendrán intactos:

- `FavoritesProvider` y `useFavorites()`;
- la clave `sm-literatura:saved-books` y su contenido en `localStorage`;
- normalización, persistencia y sincronización entre pestañas;
- componentes, estilos y pruebas funcionales del sistema;
- integración de los consumidores, lista para reactivarse.

## Arquitectura

### Bandera central

Un módulo de configuración exportará una bandera booleana para favoritos. Este valor será la única decisión de disponibilidad visual.

Los componentes compartidos `FavoriteButton` y `FavoritesIndicator` conservarán su código y devolverán una salida vacía cuando la bandera esté desactivada. De esta forma, todas las superficies actuales y futuras que reutilicen esos componentes respetarán la misma configuración.

### Página `/lista`

La ruta se conservará dentro del proyecto. Cuando favoritos esté desactivado, una visita directa redirigirá a `/seccion`.

La interfaz actual de la lista quedará encapsulada en un componente cliente independiente. El archivo de ruta actuará como envoltura del servidor y decidirá entre la redirección y la interfaz preservada.

### Página de cuenta

La navegación y la tarjeta que conducen a `/lista` se renderizarán únicamente cuando la bandera esté activa. El resto de la página conservará su estructura actual.

### Proveedor y almacenamiento

`FavoritesProvider` continuará montado en el layout raíz. La desactivación visual no borrará ni migrará el almacenamiento local. Si el módulo se reactiva, el usuario recuperará los favoritos guardados en el mismo dispositivo.

## Accesibilidad

Los controles desactivados dejarán de formar parte del árbol HTML y del orden de foco. La redirección de `/lista` evitará presentar una pantalla inaccesible o incompleta.

## Pruebas

Se añadirán comprobaciones para confirmar que, con la bandera desactivada:

- los componentes compartidos no producen controles visibles;
- el HTML renderizado no contiene botones ni indicadores de favoritos;
- la cuenta no incluye enlaces hacia `/lista`;
- `/lista` redirige a `/seccion`;
- la clave de almacenamiento y el proveedor permanecen en el código;
- las pruebas existentes del motor de favoritos continúan pasando.

## Criterios de aceptación

1. Ninguna pantalla pública muestra corazones, contador o enlaces de favoritos.
2. La ruta `/lista` redirige a `/seccion`.
3. El teclado y las tecnologías de asistencia no encuentran controles ocultos.
4. Los favoritos almacenados en el dispositivo no se eliminan ni modifican.
5. La reactivación requiere cambiar una sola bandera.
6. Lint, pruebas y build terminan correctamente.

## Publicación

La implementación se verificará localmente y en el build de producción. Después del push y el despliegue, se comprobarán home, catálogo, ficha, cuenta y la redirección de `/lista` en Vercel.
