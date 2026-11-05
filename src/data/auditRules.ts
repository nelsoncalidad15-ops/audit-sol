import type { AuditItem } from '../types/audit';

/**
 * Reglas de negocio e identificación de puntos de auditoría.
 *
 * - Mandatorios (MH): requisitos marcados "(MH)" en la matriz. Tienen fondo ámbar/dorado y badge ★ MH.
 * - Autos Eléctricos / Otra Auditoría: puntos que corresponden a movilidad eléctrica o no aplican
 *   al concesionario tradicional (son de otra auditoría / estándar corporativo).
 *   Tienen fondo violeta/púrpura diferenciado y un badge claro, pero el auditor puede asignarles
 *   libremente cualquier estado (Cumple, No aplica, Pendiente, etc.) sin que el sistema lo sobreescriba.
 */

export type MarketExemptionReason = 'electric' | 'market';

const MARKET_EXEMPT_ITEMS: Record<string, MarketExemptionReason> = {
  // 1.1.4 Satisfacción de cliente · Car Advisor (no implementado en red local)
  'item-5': 'market',
  'item-6': 'market',
  'item-7': 'market',
  // 2.1.3 Estación de carga
  'item-31': 'electric',
  'item-32': 'electric',
  // 2.1.5 Zona de cuarentena para vehículos eléctricos
  'item-34': 'electric',
  'item-35': 'electric',
  'item-36': 'electric',
  'item-37': 'electric',
  // 3.4.6 Estaciones de trabajo y plataformas E-mobility (alto voltaje)
  'item-64': 'electric',
  'item-65': 'electric',
  // 4.1.1 Elemento de sala de exposición E-mobility
  'item-76': 'electric',
  // 4.5.2 Equipo de carga del área de entrega
  'item-90': 'electric',
  'item-91': 'electric',
};

export const MARKET_EXEMPTION_LABELS: Record<MarketExemptionReason, { short: string; long: string }> = {
  electric: {
    short: '⚡ Autos Eléctricos (Otra auditoría)',
    long: 'Requisito específico para movilidad eléctrica (otra auditoría). Podés calificarlo como válido o según corresponda.',
  },
  market: {
    short: '🌐 Exento mercado (Otra auditoría)',
    long: 'Punto no exigido en el mercado local según auditoría de marca. Podés calificarlo libremente.',
  },
};

export const isMandatoryItem = (item: Pick<AuditItem, 'requirement'>): boolean =>
  /\(\s*MH\s*\)/i.test(item.requirement || '');

export const getMarketExemption = (item: Pick<AuditItem, 'id'>): MarketExemptionReason | null =>
  MARKET_EXEMPT_ITEMS[item.id] || null;

export const isMarketExempt = (item: Pick<AuditItem, 'id'>): boolean => Boolean(getMarketExemption(item));
