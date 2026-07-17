# Diseño del sistema local de favoritos

Fecha: 2026-07-16  
Estado: diseño aprobado; especificación pendiente de revisión final

## Contexto

El sistema de favoritos aparece en el home, el catálogo, la ficha de libro, el header y la página `/lista`. Cada superficie mantiene actualmente su propio estado, sus propias suscripciones al almacenamiento y su propia lógica de actualización.

El fallo fue reproducido en producción: el botón de una tarjeta puede activarse con teclado, mientras que el clic con puntero no siempre cambia el estado ni el contador. La sucesión de correcciones visuales recientes también indica que el problema ya rebasa la representación del corazón y alcanza interacción, sincronización e hidratación.

## Objetivo

Crear un sistema de favoritos estable y accesible que:

- guarde los libros únicamente en el dispositivo mediante `localStorage`;
- mantenga una sola fuente de estado para todas las pantallas;
- responda de forma inmediata y consistente a puntero, teclado y tacto;
- sincronice cambios entre pestañas del mismo navegador;
- conserve los favoritos existentes cuando sea posible;
- elimine destellos y cambios visuales incorrectos durante la carga.

## Fuera de alcance

- cuentas de usuario;
- sincronización con WordPress, WooCommerce o servicios externos;
- favoritos compartidos entre dispositivos;
- analítica de favoritos;
- animaciones Lottie.

## Arquitectura

### Fuente única de estado

`FavoritesProvider` será un componente cliente colocado en el layout raíz. Será el único módulo autorizado para leer, normalizar y escribir la clave de favoritos.

El proveedor expondrá mediante `useFavorites()`:

- `favoriteIds`: conjunto normalizado de identificadores;
- `count`: cantidad de favoritos únicos;
- `ready`: indica que el estado local ya fue hidratado;
- `isFavorite(book)`: consulta el estado de un libro;
- `toggleFavorite(book)`: agrega o elimina un libro;
- `removeFavorite(book)`: elimina un libro de forma explícita.

Los componentes consumidores dejarán de mantener copias locales del mismo estado y dejarán de suscribirse directamente a eventos de almacenamiento.

### Persistencia

La clave seguirá siendo `sm-literatura:saved-books` para conservar la información existente.

Durante la primera lectura:

1. se aceptarán entradas guardadas por `slug` o por título;
2. los títulos que correspondan al catálogo se convertirán a su `slug` actual;
3. se eliminarán valores vacíos, desconocidos y duplicados;
4. el resultado normalizado se guardará una sola vez si difiere del original.

Cada actualización calculará primero el siguiente conjunto, actualizará React y después persistirá el resultado. La escritura quedará fuera de los actualizadores funcionales de React para evitar eventos anidados.

### Sincronización

El proveedor escuchará el evento nativo `storage` para cambios provenientes de otras pestañas. Los cambios dentro de la pestaña actual ya estarán cubiertos por el estado compartido y no requerirán un evento personalizado.

El evento `sm-literatura:storage` podrá conservarse para otras áreas del sitio, aunque el sistema de favoritos dejará de depender de él.

## Componentes

### `FavoriteButton`

Componente reutilizable para tarjetas y ficha de libro.

Propiedades previstas:

- `book`;
- `variant`: `card` o `detail`;
- `className` opcional.

Comportamiento:

- consulta y modifica el estado mediante `useFavorites()`;
- usa un elemento `button` real con `type="button"`;
- tiene un área interactiva mínima de 48 por 48 píxeles;
- usa un SVG estático: contorno para disponible y relleno para guardado;
- expone `aria-pressed` y una etiqueta accesible completa;
- evita que el clic active el enlace de la tarjeta;
- conserva foco visible y estados claros de hover, pressed y focus-visible;
- utiliza una transición CSS breve, desactivada cuando el usuario prefiere movimiento reducido.

En tarjetas, el botón permanecerá como hermano del enlace principal, con capa y área pulsable independientes. Ningún enlace cubrirá el botón.

### `FavoritesIndicator`

El header consumirá directamente `count`. El indicador mostrará el corazón estático y el número de favoritos. Su etiqueta accesible será `Lista de deseos, N libro(s)`.

Durante la hidratación mostrará un espacio reservado con dimensiones constantes para impedir saltos de layout.

### Página `/lista`

La página consumirá `favoriteIds` y `ready` del proveedor.

- Antes de `ready`, mostrará el skeleton existente.
- Después de `ready`, mostrará una lista estable o el estado vacío.
- Al eliminar un libro, la tarjeta desaparecerá en la misma actualización.
- Las tarjetas usarán el mismo `FavoriteButton` que el resto del sitio.

### Superficies consumidoras

Home, catálogo, novedades, ficha de libro, header y lista de deseos compartirán exactamente la misma API. Se eliminarán `initiallySaved`, los efectos de sincronización duplicados y las lecturas directas de `localStorage` asociadas a favoritos.

## Flujo de datos

1. El layout monta `FavoritesProvider`.
2. El proveedor lee y normaliza el almacenamiento una vez.
3. Los consumidores renderizan con un estado compartido.
4. `FavoriteButton` solicita `toggleFavorite(book)`.
5. El proveedor actualiza inmediatamente el conjunto y el contador.
6. El proveedor persiste el nuevo arreglo de `slug`.
7. Otra pestaña recibe `storage`, normaliza el valor y actualiza su proveedor.

## Manejo de errores

- Si `localStorage` está bloqueado o contiene JSON inválido, el proveedor inicia con una lista vacía y la interfaz permanece operativa durante la sesión.
- Una escritura fallida no revierte la interacción actual; el siguiente montaje puede comenzar vacío si el navegador impide persistir.
- Los valores desconocidos se descartan durante la normalización.
- Un libro sin `slug` no se incorporará a favoritos y deberá detectarse durante pruebas de datos.

## Accesibilidad e interacción

- Puntero, tacto, Enter y barra espaciadora producen el mismo resultado.
- El botón cumple el objetivo táctil mínimo de 48 por 48 píxeles.
- `aria-pressed` representa el estado real.
- El texto accesible cambia entre `Guardar <título>` y `Quitar <título>`.
- El foco visible no depende del color del relleno.
- El SVG es decorativo y queda oculto a tecnologías de asistencia.
- La interacción con el corazón no navega a la ficha; el resto de la tarjeta sí.

## Pruebas

### Unitarias

- normalización de títulos antiguos a `slug`;
- eliminación de duplicados y valores desconocidos;
- agregar y quitar un favorito;
- conteo de identificadores únicos;
- tolerancia ante JSON inválido.

### Integración de componentes

- clic en una tarjeta actualiza botón y contador;
- Enter y barra espaciadora producen el mismo cambio;
- el clic en el corazón no activa el enlace del libro;
- ficha y header reflejan el mismo estado;
- eliminar desde `/lista` actualiza la lista y el contador;
- el estado de hidratación reserva espacio y evita destellos.

### Navegador

- guardar en catálogo, recargar y confirmar persistencia;
- abrir una segunda pestaña y confirmar sincronización;
- guardar y quitar desde home, catálogo, ficha y `/lista`;
- verificar tamaños móvil y escritorio;
- comprobar que no existen errores de consola durante el flujo.

## Criterios de aceptación

1. Un clic o toque sobre cualquier corazón cambia el estado una sola vez.
2. El contador del header se actualiza en la misma interacción.
3. La acción del corazón nunca abre la ficha del libro.
4. El estado se conserva después de recargar.
5. Dos pestañas abiertas convergen al mismo estado.
6. La página de favoritos no parpadea entre lista, vacío y skeleton.
7. Todos los corazones usan el mismo componente visual y conductual.
8. Los favoritos existentes reconocibles se conservan mediante migración.
9. Las pruebas, lint y build terminan correctamente.

## Publicación

La implementación se validará primero en desarrollo, después en el build de producción y finalmente en Vercel. La verificación publicada repetirá los flujos de puntero, teclado, recarga y navegación entre catálogo, ficha y lista.
