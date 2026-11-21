import { demoProvider } from './demo';
import type { DataProvider } from './types';

/** Fase 2: devolver aquí el proveedor real (vía fetch a /api/*) según configuración. */
export function getProvider(): DataProvider {
  return demoProvider;
}
