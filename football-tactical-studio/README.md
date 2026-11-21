# Football Tactical Studio

Estudio táctico de fútbol: alineaciones sobre cancha interactiva, formaciones, plantillas y (próximamente) estadísticas, comparadores y exportación.

## Estado actual

| Fase | Contenido | Estado |
|------|-----------|--------|
| 1 | Interfaz, tema oscuro, navegación | Listo |
| 2 | Buscador y datos reales (API-Football) | Pendiente |
| 3 | Editor táctico, formaciones, banquillo | Listo |
| 4 | Estadísticas de jugadores | Pendiente |
| 5 | Comparadores | Pendiente |
| 6 | Exportación PNG y guardado | Pendiente |
| 7 | Pruebas | Pendiente |

> **Datos de demostración:** mientras no se conecte API-Football, el editor usa dos equipos **ficticios**
> (`src/lib/demo-data.ts`), sin fotos, nacionalidades ni edades. La interfaz muestra "No disponible" y un avatar
> predeterminado. Nada se presenta como dato real.

## Instalación

Requisitos: Node.js 18.18 o superior.

```bash
npm install
npm run dev        # http://localhost:3000  → abre /editor
```

Otros comandos: `npm run build`, `npm run start`, `npm run typecheck`, `npm run lint`.

No se necesitan credenciales para esta etapa. El archivo `.env.example` anticipa las de la Fase 2
(`API_FOOTBALL_KEY`, solo en servidor).

## Qué hace el editor táctico

- **Arrastre libre** con Pointer Events (ratón, táctil y lápiz): cualquier tarjeta a cualquier punto, sin posiciones predefinidas.
- **Intercambios:** soltar una tarjeta sobre otra las intercambia (cancha↔cancha, cancha↔banquillo, plantilla→titular, que pasa al banquillo).
- **Banquillo:** arrastra titulares hacia la zona de suplentes y suplentes hacia la cancha.
- **Plantilla:** buscar, filtrar por posición, ordenar y arrastrar (con el asa) o usar los botones Campo / Banca / Quitar.
- **Formaciones predeterminadas:** 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 3-4-3, 5-3-2, 4-1-4-1, 4-5-1, 3-4-2-1, 4-2-2-2. Cambiar de formación reubica a los jugadores actuales respetando su grupo (POR/DEF/MED/DEL) y su lado; **no quita a nadie ni reinicia dorsales, capitán o nombres.**
- **Formaciones personalizadas:** guardar la disposición actual con nombre, aplicar, renombrar, duplicar, sobrescribir y eliminar. Solo guardan coordenadas, así que se reutilizan con cualquier equipo. El botón + de cada formación predeterminada guarda una copia editable.
- **Edición de tarjetas:** dorsal, nombre mostrado, capitán y portero.
- **Orientación** vertical u horizontal; las coordenadas se guardan siempre en formato vertical y se rotan al mostrar, así que cambiar de orientación no altera nada.
- **Advertencia** si hay más de 11 titulares (se permite la configuración).
- **Persistencia:** la alineación, el equipo, los ajustes y tus formaciones se guardan en el navegador (`localStorage`) y se conservan al cambiar de pantalla o cerrar la app.

## Estructura

```
src/
  app/                      Rutas (App Router). Solo /editor está implementada; las demás indican su fase.
  components/
    layout/                 AppShell, Sidebar, navegación
    editor/                 TacticalEditor, Pitch (SVG), PlayerCard, Bench, SquadList,
                            PlayerPanel, FormationPicker, use-card-drag (arrastre)
    ui/                     Componentes genéricos
  lib/
    types.ts                Modelo de dominio (Player, Team, Formation…)
    formations.ts           Formaciones y algoritmo de reparto sin perder jugadores
    lineup.ts               Alineación inicial automática
    geometry.ts             Coordenadas y rotación de orientación
    demo-data.ts            Equipos ficticios de demostración
  providers/
    types.ts                Interfaz DataProvider (contrato para cualquier API)
    demo.ts / index.ts      Proveedor demo y selector
  store/
    editor-store.ts         Estado global (zustand) con persistencia
```

## Preparado para la Fase 2 (datos reales)

1. Implementar `ApiFootballProvider` que cumpla `DataProvider` (`searchTeams`, `getTeam`).
2. Hacer las llamadas **solo en el servidor** (Route Handlers `src/app/api/...`) con `API_FOOTBALL_KEY`, guardando resultados en caché (PostgreSQL/Supabase) con `fetchedAt`. El navegador consulta tus rutas `/api`, nunca al proveedor.
3. Devolver `Player` con `photoUrl`, `nationality`, `age`, `heightCm`, `rating` desde el proveedor; los campos que falten se dejan en `null` y la interfaz ya muestra "No disponible".
4. Cambiar `getProvider()` en `src/providers/index.ts` según `DATA_PROVIDER`.
5. Si usas `next/image`, añade el dominio de las fotos en `next.config.mjs`. Revisa las condiciones de uso de imágenes del proveedor.

Las posiciones del editor se guardan por `playerId`, así que seguirán funcionando con los ids reales.

## Limitaciones conocidas

- Los módulos de las Fases 2, 4, 5 y 6 (buscador, estadísticas, comparadores, exportación PNG, guardado en la nube) **no están implementados**; el buscador y el selector de temporada del encabezado están deshabilitados a propósito.
- Las alineaciones se guardan solo en este navegador hasta la Fase 6.
- Si cambias de equipo, la alineación se regenera (tus formaciones guardadas se conservan).
