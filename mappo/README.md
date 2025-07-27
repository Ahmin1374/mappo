# 🗺️ Real Estate Map Drawing Module

A modern Angular 17+ application for real estate brokers to draw custom regions on interactive maps and generate GeoJSON output.

## 🎯 Features

- **Interactive Map**: OpenStreetMap integration with Leaflet
- **Drawing Tools**: Polygon and rectangle drawing capabilities
- **GeoJSON Output**: Automatic conversion of drawn shapes to GeoJSON format
- **Modern UI**: Clean, responsive design with status indicators
- **Test-Driven Development**: Comprehensive unit tests with Jest
- **TypeScript**: Full type safety and modern development experience

## 🧱 Tech Stack

- **Framework**: Angular 17+
- **Map Library**: Leaflet + leaflet-draw
- **Language**: TypeScript
- **Testing**: Jest (unit tests)
- **Styling**: CSS3 with responsive design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- Angular CLI 16+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mappo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## 📁 Project Structure

```
src/app/features/map/
├── map.component.ts          # Main map component
├── map.component.html        # Map template
├── map.component.css         # Map styles
├── map.component.spec.ts     # Component tests
├── map.service.ts           # Map service with Leaflet logic
├── map.service.spec.ts      # Service tests
├── map.module.ts            # Feature module
└── map-routing.module.ts    # Routing configuration
```

## 🎮 Usage

### Drawing Shapes

1. **Polygon Tool**: Click the polygon icon in the drawing toolbar
   - Click on the map to add points
   - Double-click to finish drawing

2. **Rectangle Tool**: Click the rectangle icon in the drawing toolbar
   - Click and drag to create a rectangle

3. **Edit Tools**: Use the edit toolbar to modify or delete existing shapes

### GeoJSON Output

All drawn shapes are automatically converted to GeoJSON format and:
- Logged to the browser console
- Available through component events
- Stored in component memory

### Example GeoJSON Output

```json
{
  "type": "Feature",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[13.4050, 52.5200], [13.4150, 52.5200], [13.4150, 52.5300], [13.4050, 52.5300], [13.4050, 52.5200]]]
  },
  "properties": {
    "id": "shape_1703123456789_abc123def",
    "createdAt": "2023-12-21T10:30:45.123Z"
  }
}
```

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

### Test Coverage

The project includes comprehensive tests for:
- Map service functionality
- Component lifecycle and events
- GeoJSON conversion
- Error handling
- User interactions

### Test Structure

- **MapService Tests**: Leaflet integration, shape management, GeoJSON conversion
- **MapComponent Tests**: Component lifecycle, event handling, UI interactions

## 🎨 Customization

### Map Configuration

Modify the default map settings in `map.service.ts`:

```typescript
private defaultConfig: MapConfig = {
  center: [51.1657, 10.4515], // Center of Germany
  zoom: 6,
  minZoom: 4,
  maxZoom: 18
};
```

### Styling

Customize the map appearance by modifying:
- `map.component.css` - Component styles
- Leaflet CSS variables in the component styles

### Drawing Options

Configure drawing tools in `map.service.ts`:

```typescript
const drawOptions: L.Control.DrawConstructorOptions = {
  draw: {
    polygon: {
      allowIntersection: false,
      shapeOptions: {
        color: '#3388ff',
        fillColor: '#3388ff',
        fillOpacity: 0.2
      }
    },
    // ... other options
  }
};
```

## 🔧 Development

### Adding New Features

1. **Follow TDD**: Write tests first
2. **Use TypeScript**: Maintain type safety
3. **Follow Angular conventions**: Use proper decorators and lifecycle hooks
4. **Document code**: Add JSDoc comments for public methods

### Code Quality

- **Linting**: ESLint configuration included
- **Formatting**: Prettier configuration for consistent code style
- **Type Safety**: Strict TypeScript configuration

## 🚧 Future Enhancements

### Phase 2 Features (Planned)
- **Backend Integration**: Spring Boot + PostGIS
- **Authentication**: JWT-based user management
- **Data Persistence**: Save/load regions from database
- **Advanced Analytics**: Region analysis and reporting
- **Role-based Access**: User permissions and ownership

### Technical Improvements
- **E2E Testing**: Cypress integration tests
- **Performance**: Lazy loading and optimization
- **Accessibility**: WCAG compliance improvements
- **Mobile**: Enhanced mobile experience

## 📝 API Reference

### MapService

#### Methods
- `initializeMap(containerId: string, config?: Partial<MapConfig>): L.Map`
- `getAllShapes(): GeoJSONFeature[]`
- `clearAllShapes(): void`
- `getMap(): L.Map | null`
- `destroyMap(): void`

#### Events
- `onShapeCreated: EventEmitter<GeoJSONFeature>`
- `onShapeDeleted: EventEmitter<string>`
- `onMapInitialized: EventEmitter<void>`

### MapComponent

#### Properties
- `drawnShapes: GeoJSONFeature[]`
- `shapeCreated: EventEmitter<GeoJSONFeature>`
- `shapeDeleted: EventEmitter<string>`
- `mapInitialized: EventEmitter<void>`

#### Methods
- `clearAllShapes(): void`
- `getAllShapes(): GeoJSONFeature[]`
- `isMapInitialized(): boolean`
- `getShapeCount(): number`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test files for usage examples

---

**Built with ❤️ using Angular 17+ and Leaflet**
