import type { AuditItem } from '../types/audit';

/**
 * Resultado de la última auditoría VW Retail (Cluetec) realizada en Salta.
 * Fuente: 2026-09-10_16-26-40_Retailaudit_AUTOSOLS.R.L.pdf (auditor Angel Vicente, 14 ago 2026).
 * Se usa solo como referencia para preparar la próxima auditoría; no modifica el estado de los puntos.
 */
export const LAST_BRAND_AUDIT = {
  label: 'Auditoría VW Retail · Salta · ago 2026',
  auditor: 'Angel Vicente (VW Argentina)',
  date: '2026-08-14',
};

export interface BrandAuditReference {
  result: string;
  note?: string;
  scope?: string;
}

const REFERENCE_BY_ITEM_ID: Record<string, BrandAuditReference> = {
  "item-1": {
    "result": "Cumplido",
    "note": "Se evidencia gestión del plan de negocios a través de Salesforce.",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-2": {
    "result": "Cumplido",
    "note": "- MP: OK - FP: OK - PI: OK - Riesgos: PV 32 riesgos. Ok se monitorea la efectividad de las medidas. - REUNION QM: OK Cada 3 meses - AUDIT INTERNA: OK 14/06/26 en GAMS - GESTIÓN DOCUMENTAL: OK",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-3": {
    "result": "Cumplido",
    "note": "Se evidencia control del proceso a través del sistema AUTOSOL Intelligence. - control operativo - gestión de KPIs - Facturación",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-4": {
    "result": "Cumplido",
    "note": "Se evidencia control sobre el proceso OK. - CEM: Target 4,80 Realizado 4,81 (JUN26) - Encuesta Interna: Target 75% Realizado 54,07% se evidencia plan de acción para profesionalizar ChatBot.",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-5": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-6": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-7": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-8": {
    "result": "Cumplido",
    "note": "- TDT VWA: Realizado 31/03/2025 // Adm.: 100%/85%. OK // Tec.: 105/90 OK - TDT INTERNO: Realizado 14/95/26 // Adm.: 95%/85%. OK // Tec.: 100/90 OK",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-9": {
    "result": "Cumplido",
    "note": "Se evidencia resultado de auditoria PCGC (JUL26) 91,6%.",
    "scope": "VW Sales"
  },
  "item-10": {
    "result": "Cumplido",
    "note": "- Auditoría VWA: Se evidencia gestión sobre los hallazgos observados.",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-11": {
    "result": "Cumplido"
  },
  "item-12": {
    "result": "Cumplido",
    "note": "Se evidencia actualización en Konviva Se gestiona las cualificaciones en el sistema TalentHub. Índice de cualificación 90.88% JUN26 Se deben finalizar las cualificaciones de las siguientes posiciones: - Asesor de Servicio: Rodrigo Cataño (Abr25) , Alejandra Martínez (JUL26)",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-13": {
    "result": "Cumplido",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-14": {
    "result": "Cumplido",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-15": {
    "result": "Cumplido",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-16": {
    "result": "Cumplido",
    "note": "Se evidencia el puesto de referente de Integridad OK. Actual: Gerente de Legales. Procedimiento Interno: Políticas ABAC de antisoborno y anticorrupción. Manual para el cumplimiento de la política ABAC",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-17": {
    "result": "Cumplido",
    "note": "Se evidencia procedimiento interno en materia de compliance Autosol, y se comunica vía Loyal a todos los colaboradores.",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-18": {
    "result": "Cumplido"
  },
  "item-19": {
    "result": "Cumplido",
    "note": "Se evidencia control sobre el proceso. Lista de proveedores actualizada. OK - Evaluación de proveedores. 1 vez/Año. + en algunos casos cada vez que se utiliza. - Se evidencia control de calidad sobre sub-contratos OK - Contrato Marco: Habitat Ecológico OK",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-20": {
    "result": "Cumplido",
    "note": "Se evidencia control sobre el proceso. OK - Evaluación de proveedores. 1 vez/Año. + en algunos casos cada vez que se utiliza",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-21": {
    "result": "Cumplido",
    "note": "- Leads process: Se evidencia control sobre el proceso a través de Salesforce. - Tasa de Conversión: 5,2% - Tiempo laboral: 25min (target <30min) - Leads sin respuesta: 0",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-22": {
    "result": "Cumplido",
    "note": "- Leads process: Se evidencia control sobre el proceso a través de Salesforce. - Tasa de Contacto: 100%",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-23": {
    "result": "Cumplido",
    "note": "- Leads process: Se evidencia control sobre el proceso a través de Salesforce y sistema reporting venía en PowerBi. Realizan el seguimiento del Market share a través del sistema de Market Intelligence Argentina (Cenoa)",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-24": {
    "result": "Cumplido",
    "note": "No se evidencian Hot Alert.",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-25": {
    "result": "Cumplido",
    "note": "Se evidencia control sobre el proceso a través de Quality. Procedimiento interno: política de quejas y reclamos. - se evidencia tratamiento de reclamos por áreas y tipo de reclamo en detalle, análisis de los mismos e implementación. - Primer contacto Ok (<24hs)",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-26": {
    "result": "Cumplido",
    "note": "Se evidencia control sobre el proceso a través de Next Cooud. Procedimiento: Protocolo de Gestión - De k Quejas y Reclamos. - Contacto de seguimiento: Ok (<48hs)",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-27": {
    "result": "Cumplido",
    "note": "Se evidencia comunicación de acuerdo a estándares de marca",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-28": {
    "result": "Cumplido",
    "note": "Se evidencia campañas de mkt en redes Meta adds, email mkt, CRM Tecnom. Monitoreo de métricas y eficacia de las mismas a través de informes de PowerBi. Tasa de cierre 3,9 Página web de acuerdo a estándares de marca.",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-29": {
    "result": "Cumplido"
  },
  "item-30": {
    "result": "Cumplido",
    "note": "Se evidencia control sobre los procesos de medioambiente de acuerdo a estándares de la marca",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-31": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-32": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-33": {
    "result": "Cumplido",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-34": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-35": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-36": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-37": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-38": {
    "result": "Cumplido"
  },
  "item-39": {
    "result": "Cumplido",
    "scope": "VW After Sales, VW Sales, VWCV After Sales, VWCV Sales"
  },
  "item-40": {
    "result": "Cumplido",
    "note": "Se evidencia control sobre el proceso de agendamiento ok. Las citas ingresan por Mail, WA, y telefónica.",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-41": {
    "result": "Cumplido",
    "note": "Se evidencia ofrecimiento de Taxi-remis.",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-42": {
    "result": "Cumplido",
    "note": "Se evidencian órdenes de reparación completas - OR 5440339 10/06/26 Amarok 2.0 - OR 5440307 10/06/26 Amarok 2.0",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-43": {
    "result": "Cumplido",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-44": {
    "result": "Cumplido",
    "note": "Se evidencian órdenes de reparación con ampliaciones ok - OR 5440400 12/06/26 Amarok 2.0 - OR 5440042 01/06/26 Amarok V6",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-45": {
    "result": "Cumplido",
    "note": "- Se evidencia control sobre el proceso de campañas a través del sistema Tracking OK - Falta de Gestión: sistema recall2 Ok - Se chequean campañas: OK 69HT airbag TKT 697R Saveiro 69EJ Sharan, Passat, Polo (TKT)",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-46": {
    "result": "Cumplido",
    "note": "Se evidencia uso de TM de ELSA - OR 5440518 19/06/26 Amarok V6 - OR 5440677 25/06/26 Amarok 2.0",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-47": {
    "result": "Cumplido",
    "note": "Se evidencia lista de mantenimiento con los chequeos controlados ok - OR 5440064 02/06/26 Taos - OR 5440500 18/06/26 Amarok 2.0",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-48": {
    "result": "Cumplido",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-49": {
    "result": "Cumplido",
    "note": "Se evidencia control final ok - OR 5441760 05/08/26 TCross CYP - OR 5441776 06/08/26 Amarok Hero V6 CYP",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-50": {
    "result": "Cumplido",
    "note": "Se evidencia proceso de vehículo sustituto, bitácora y seguros. - Amarok AE731ST - TCross AE118JM - Polo AE118JH",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-51": {
    "result": "Cumplido",
    "note": "Se evidencia Factura completa y comprensible ok - OR 5441515 29/07/26 Up // Factura # A0033-00035122 05/08/26 ok",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-52": {
    "result": "Cumplido",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-53": {
    "result": "Cumplido",
    "note": "Si bien se observa control de los procesos de almacenamiento y gestión de repueatos Ok. Se debe asegurar que no se vendan productos dañados o en proceso de scrap. No se ha cumplido VW After Sales Se debe asegurar que no se vendan productos dañados o en proceso de scrap. Se evidencia la pieza 2HP845099ENVB dañada y almacenada en la misma locación de las piezas nuevas disponibles para la venta. El socio debe realizar y documentar el análisis de causa raíz (RCA) y definir las acciones correctivas (CA) correspondientes en el portal GAMS después de la auditoría. Definido: RTA-248259 Debido: 5 nov 2026 Descripción: Se debe asegurar que las piezas dañadas o vías de Scrap no estén disponibles para la venta. Creando una ubicación de Scrap en el sistema para dichos efectos. Análisis de Causa Raíz (RCA): Adicionalmente a la acción de contención establecida en la auditoria, se deberá presentar un análisis de causa raíz detallado que demuestre la identificación de la causa que originó el hallazgo y asegure la implementación de acciones eficaces para prevenir su recurrencia, acompañado de las evidencias objetivas correspondientes. Responsable: Gerente de Repuestos",
    "scope": "VWCV After Sales"
  },
  "item-54": {
    "result": "Cumplido",
    "note": "Se evidencia control sobre el proceso ok",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-55": {
    "result": "Cumplido",
    "note": "Se observa control sobre el proceso de almacenamiento de acuerdo a estándares.",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-56": {
    "result": "Cumplido",
    "note": "Se evidencia control del proceso de recambios OK - 000915089E Ubic 1802A06 can’t 10 ok - 1S0121253AN Ubic 2501C01 can’t 2 Ok - 5Q0698451AK UBIC 301E05 can’t 10 ok Se observa una gestión detallada del negocio de repuestos a través de Web AUTOSOL repuestos mayoristas.",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-57": {
    "result": "Cumplido",
    "note": "Se evidencia proceso de control de caducidad ok.",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-58": {
    "result": "Cumplido",
    "note": "Se evidencia control del proceso, objetivo y carga en MSQP Jul25 obj.20 // realizado 25",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-59": {
    "result": "Cumplido",
    "note": "Se evidencia cumplimiento ok, monitoreo de fallas, implementación y seguimiento",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-60": {
    "result": "Cumplido",
    "note": "Se evidencia control del proceso ok",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-61": {
    "result": "Cumplido"
  },
  "item-62": {
    "result": "Cumplido",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-63": {
    "result": "Cumplido",
    "note": "Se evidencian plataformas de trabajo de acuerdo estándares. Y servicio de mantenimiento programado. - elevador 6. Serie VWc16l0004 ene26. Grupo Cenoa. - elevador 4. Serie Vde17b0004 ene26. Grupo Cenoa.",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-64": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-65": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW After Sales"
  },
  "item-66": {
    "result": "Cumplido",
    "note": "Se evidencia equipamiento de taller al 100 % de acuerdo estándares. - alineadora actualizada con cotas de alineación de Taos y Amarok nuevas. - VAS6150 = 6 + 1 PDI",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-67": {
    "result": "Cumplido",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-68": {
    "result": "Cumplido",
    "note": "Se evidencia kit experto completo 100% (99,72% físico y 3 piezas pedidas POC 5148048) y ticket Salesforce 01723442. Las HHEE verificadas se corresponden con las muestras para calibración. - VAS6213 Bomba de vacío. | NS# AS-BV01 / cert# 3297-12-25 (14/11/25) Ubic 12D ok - VAG1783 TorquImetro 2a10nm | NS# 14-054335 / cert# 1804-07-25 (25/07/25) Ubic 13C01 ok - VAS5187 Manómetro | NS# 543117897 / cert# 0567-03-26 (05/03/26) Ubic 11D ok",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-69": {
    "result": "Cumplido",
    "note": "Se evidencia control sobre proceso ok",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-70": {
    "result": "Cumplido",
    "note": "Se evidencia que todas las HHEE están calibradas de acuerdo a los estándares. - VAS6213 Bomba de vacío. | NS# AS-BV01 / cert# 3297-12-25 (14/11/25) Ubic 12D ok - VAG1783 TorquImetro 2a10nm | NS# 14-054335 / cert# 1804-07-25 (25/07/25) Ubic 13C01 ok - VAS5187 Manómetro | NS# 543117897 / cert# 0567-03-26 (05/03/26) Ubic 11D ok",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-71": {
    "result": "Cumplido",
    "note": "Se evidencia Sotweae actualizado Versión 2.56.8 y 2.38.7",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-72": {
    "result": "Cumplido",
    "scope": "VW After Sales, VWCV After Sales"
  },
  "item-73": {
    "result": "Cumplido",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-74": {
    "result": "Cumplido",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-75": {
    "result": "Cumplido",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-76": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-77": {
    "result": "Cumplido",
    "note": "Se evidencian diseño y uso de acuerdo a estándares",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-78": {
    "result": "Cumplido",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-79": {
    "result": "Cumplido"
  },
  "item-80": {
    "result": "Cumplido",
    "note": "Se evidencian programas de mantenimiento de acuerdo a estándares de marca - Amarok trendline VINTA013850 - Virtus Exluaive VIN T4013636 - Polo High VIN TT632112",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-81": {
    "result": "Cumplido",
    "note": "Se evidencian vehículos demo. LISTADO - PLAN DEMO Concesionario: AUTOSOL SRL Punto de Venta: 3087 Fecha: 01/11/2025 A continuación, se detallan las unidades afectadas al Programa Plan Demo: Modelo Serie Color Patente Fecha Pat. Taos Haighline 250 TSI AT Deep Black AG030MM 28/07/2023 T-CROSS Comfortline 200 TSI AT Blue Norwat Metal AE866WB 21/07/2021 Nueva Amarok V6 Highline V6 AT 4x4 G2 Pyrite Silver Metal AG855QH 27/09/2024 Nuevo Polo Track 25 MSI MT MY25 Plata Sirius AG849NU 26/09/2024 NIVUS Haighline 200 TSI AT G1 Azul Turbo AH098FV 28/02/2025 TERA High 170 SI AT MY 26 Rojo Hypernova AH671WJ 09/09/2025",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-82": {
    "result": "Cumplido",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-83": {
    "result": "Cumplido",
    "note": "Se evidencia registros de uso de test drive Ok Se implementa la trazabilidad de uso a través de Google Drive",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-84": {
    "result": "Cumplido",
    "note": "Se evidencian datos de conduccion ok",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-85": {
    "result": "Cumplido",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-86": {
    "result": "Cumplido",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-87": {
    "result": "Cumplido",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-88": {
    "result": "Cumplido",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-89": {
    "result": "Cumplido",
    "scope": "VW Sales, VWCV Sales"
  },
  "item-90": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW Sales"
  },
  "item-91": {
    "result": "Cumplido",
    "note": "No aplicable en mercado argentino",
    "scope": "VW Sales"
  }
};

export const getLastBrandAuditReference = (item: Pick<AuditItem, 'id'>): BrandAuditReference | undefined =>
  REFERENCE_BY_ITEM_ID[item.id];
