# Compass and compact lobby — 2026-09-14

The old compass was static N/S decoration; only its hover title changed. It now lives with the minimap, reads the camera's actual world-facing direction, shows all eight bearings plus normalized degrees, and rotates its north arrow. The minimap stays north-up and its player arrow still shows the character facing direction (which may differ from the camera).

At widths >=768px (including iPad portrait/landscape), a bounded left column places the compact lobby status and Invite & leave disclosure above the minimap. Desktop reserves the profile footer; touch layouts reserve joystick space. Expanding lobby content scrolls within the available column rather than covering the map. Phone-width layouts keep the room controls inside Menu. Minimap Show/Hide still collapses the map; the redundant mobile-menu map toggle is hidden when permanently docked.

XP notices only move below a lobby when their horizontal bounds overlap. The now-left lobby does not displace centered XP notices.

Verification: cardinal/diagonal/north-wrap compass unit checks; real camera cardinal poses and actual drag change compass; browser mouse and touch contexts, desktop1440/1280/1024/800 and iPad1366/1024/768, phone390 transition and back, compact widths, lobby/map separation, expandable bounds and zero JS errors. Physical iPad hardware not tested. Short desktop windows scroll the map to preserve region-title clearance.
