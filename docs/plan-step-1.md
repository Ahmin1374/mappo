\# 🗺️ Real Estate Map Drawing Module - AI Agent Brief



\## 🎯 Goal

Build the core frontend module of a real estate web app where users (real estate brokers) can:

\- View an interactive map (OpenStreetMap)

\- Draw custom regions (polygons or rectangles)

\- Get the region's geometry as \*\*GeoJSON\*\*

\- \[Later] These regions will be saved to a backend system with geospatial support (PostGIS)



This is \*\*Phase 1\*\* of the project, focusing only on the \*\*frontend map integration\*\*.



---



\## 🧱 Stack



\### Frontend

\- \*\*Framework\*\*: Angular 17+

\- \*\*Map Library\*\*: Leaflet

\- \*\*Drawing Tools\*\*: leaflet-draw

\- \*\*Language\*\*: TypeScript

\- \*\*Test Framework\*\*: Jest (unit tests), Cypress (E2E — optional for now)



---



\## 🧪 Test-Driven Development (TDD)



\### TDD Goals

\- Write tests before or alongside implementation.

\- Unit test each component or service.

\- Avoid hardcoded map logic — make Leaflet usage abstractable and testable.

\- Structure code to support future test coverage of:

&nbsp; - Geometry validation

&nbsp; - UI interaction (e.g., button clicks, draw tools)

&nbsp; - Output format (GeoJSON correctness)



\### Example Test Cases (Jest)

\- ✅ "Map should initialize correctly"

\- ✅ "Drawing control should be visible"

\- ✅ "Drawn polygon should emit valid GeoJSON"

\- ✅ "GeoJSON output should include coordinates and type"



---



\## 📁 Folder Structure



/src/app/features/map/

├── map.component.ts

├── map.component.html

├── map.component.css

├── map.service.ts ← Optional (for encapsulating Leaflet logic)

├── map.module.ts

└── map.component.spec.ts ← Tests (Jest)





---



\## 🧭 Functional Requirements



| ID | Description |

|----|-------------|

| F1 | Load interactive map centered over Germany |

| F2 | Allow drawing polygons or rectangles using toolbar |

| F3 | Store each drawn shape in memory for now |

| F4 | Log (or emit) GeoJSON on shape creation |



---



\## 🧱 Technical Requirements



\- Use \*\*Leaflet + leaflet-draw\*\*.

\- No backend calls yet — local-only storage.

\- Map should initialize in a component (`<app-map>`) and fill its parent container.

\- Shapes should be drawn on the map and converted to GeoJSON.

\- Support only:

&nbsp; - Polygon

&nbsp; - Rectangle



---



\## 🔐 Auth (Next Phase)

This version does \*\*not\*\* require login or roles.

In the next phase, we will implement:

\- JWT-based auth

\- Role-based UI control

\- Region ownership by user



---



\## 🚧 Future Integration



\- ✅ Backend with Spring Boot + PostGIS

\- ✅ Region saving/loading via REST API

\- ✅ Role/permission management

\- ✅ Analytics/reporting



---



\## 🚀 Ready Tasks (For AI Dev Agent)



| Task | Description |

|------|-------------|

| `T1` | Scaffold Angular app with map module |

| `T2` | Install and configure Leaflet and leaflet-draw |

| `T3` | Create `MapComponent` with map initialization |

| `T4` | Add draw controls and capture GeoJSON |

| `T5` | Emit GeoJSON to console (later to service) |

| `T6` | Write unit tests for map behavior |

| `T7` | Document code clearly for future team use |



---



\## ✅ Deliverables



\- `map.component.ts/html/css` with Leaflet + drawing

\- Test file: `map.component.spec.ts` with basic test cases

\- Working local demo: open map, draw polygon/rectangle, output GeoJSON

\- README or usage notes if custom commands/tools are used



---

