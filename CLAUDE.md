# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server (port 9090)
npm run dev

# Production build
npm run build

# Preview production build (port 5000)
npm run preview

# Lint and auto-fix code
npm run lint

# Format code with Prettier
npm run format

# Docker development
docker-compose up --build
```

## Architecture Overview

**KVB Access** is a Vue 3 application that displays real-time public transport accessibility data for Cologne (KVB) on an interactive map. The app shows station accessibility issues including broken elevators and escalators.

### Core Architecture

- **Vue 3** with Composition API
- **Leaflet** for interactive mapping with marker clustering
- **Vite** as build tool with development proxy
- **Environment-based API configuration** (development vs production)

### Data Flow

1. **API Integration**: App fetches from 6 KVB OpenData endpoints:
   - Station areas, station locations
   - Broken/working escalators and elevators
   
2. **Data Processing**: The `joinStationWithStairsAndElevators` composable merges:
   - Station location data with accessibility issues
   - Stairs and elevator disorder data
   - Creates unified marker data with disorder flags

3. **Map Rendering**: The `setupMap` composable handles:
   - Leaflet map initialization with smooth zoom
   - Marker clustering for performance
   - Dynamic marker visibility based on zoom level
   - Custom marker types (station/stairs/elevators)

### Key Components

- **MapView**: Main view containing map and all UI elements
- **SearchBar**: Station search with autocomplete
- **InfoModal**: Detailed station/disorder information display
- **AnalyticsChart**: Statistics visualization with circular progress charts
- **LoadingView**: Loading states and error handling

### CSS Architecture

CSS is organized with a variables-first approach:
- `src/assets/css/variables.scss`: All design tokens (colors, spacing, typography, etc.)
- `src/assets/css/base.css`: Foundation styles importing variables
- `src/assets/css/main.css`: Application-wide styles
- Component styles use CSS custom properties from variables.scss

### Environment Configuration

- **Development**: Uses proxy to KVB OpenData API (`VITE_API_BASE_URL=http://localhost:3001/api`)
- **Production**: Direct API calls (`VITE_API_BASE_URL=https://api.kvb-access.de/api`)
- Vite proxy rewrites `/api/*` calls to external KVB API in development

### Map Implementation Details

- **Zoom-based visibility**: Stairs/elevator markers only show at zoom level 16+
- **Marker clustering**: Automatically groups nearby markers for performance
- **Disorder highlighting**: Red borders and shadows for accessibility issues
- **Smooth animations**: Custom zoom and transition animations for better UX

### State Management

Uses Vue's reactivity system without external state management:
- MapView manages all application state
- Modal state controls which UI elements are visible
- Loading states handle async data fetching and error scenarios