# Property Loaders

Este directorio contiene los componentes de loader para las operaciones de propiedades.

## Componentes

### PropertyCreationLoader

Loader que se muestra durante la creación de una nueva propiedad.

**Características:**

- Indicador visual de progreso con animaciones
- Muestra los pasos del proceso:
  1. Validando datos
  2. Subiendo archivos
  3. Validando cuenta de servicios con OCR
- Barra de progreso animada con efecto shimmer
- Overlay con blur backdrop

**Uso:**

```tsx
import { PropertyCreationLoader } from "@/components/landlord/PropertyCreationLoader";

// En el componente
{
  isCreating && <PropertyCreationLoader />;
}
```

### PropertyUpdateLoader

Loader que se muestra durante la actualización de una propiedad existente.

**Características:**

- Indicador visual de progreso con animaciones
- Muestra los pasos del proceso:
  1. Validando cambios
  2. Actualizando datos
  3. Procesando imágenes
- Barra de progreso animada con efecto shimmer
- Overlay con blur backdrop

**Uso:**

```tsx
import { PropertyUpdateLoader } from "@/components/landlord/PropertyUpdateLoader";

// En el componente
{
  isUpdating && <PropertyUpdateLoader />;
}
```

## Animaciones

Los loaders utilizan animaciones personalizadas definidas en `tailwind.config.ts`:

- **shimmer**: Efecto de brillo que se desplaza horizontalmente
- **pulse-slow**: Pulsación suave y lenta
- **spin**: Rotación continua (incorporada en Tailwind)
- **ping**: Efecto de ondas expansivas (incorporada en Tailwind)

## Estados de Carga

Los estados de carga se manejan en los hooks personalizados:

### usePropertyForm

```typescript
const { isCreating, createProperty } = usePropertyForm();
```

### usePropertyEdit

```typescript
const { isUpdating, updateProperty } = usePropertyEdit(property);
```

## Estilos

Los loaders utilizan el esquema de colores de la aplicación:

- **sage**: Color principal de la marca (#8b6f47)
- **sage-dark**: Variante oscura (#6b5536)
- Colores semánticos: verde para éxito, azul para procesando, púrpura para validación

## Accesibilidad

- Overlay con `z-50` para estar sobre todo el contenido
- Backdrop blur para mejor contraste
- Textos descriptivos para cada paso del proceso
- Indicadores visuales claros del progreso
