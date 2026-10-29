import type { Session } from '../mock/types';

export const MIN = 60_000;
export const IDLE_MS = 30 * MIN;
export const WARN_AFTER_MS = 28 * MIN;
export const LEAD_MS = 2 * MIN;
export const ABS_MS = 8 * 60 * MIN;
export const ORDER_SESSION_MS = 25 * MIN;
export const ORDER_EXPIRY_MS = 30 * MIN;

export type WarningVariant = 'idle' | 'absolute';

export interface WarningInfo {
  variant: WarningVariant | null;
  idleExpiry: number;
  absoluteExpiry: number;
  idleWarnPoint: number;
  absWarnPoint: number;
  /** True when the 8-hour limit falls before or within 2 minutes after the idle warning point. */
  absoluteFirst: boolean;
  shownAt: number;
}

/**
 * AC-13.15, 13.23, 13.24: all times derive from the (mock) server-held expiry times,
 * not from a browser-only timer.
 */
export function warningInfo(s: Session, now: number): WarningInfo {
  const idleExpiry = s.lastActivity + IDLE_MS;
  const idleWarnPoint = s.lastActivity + WARN_AFTER_MS;
  const absWarnPoint = s.absoluteExpiry - LEAD_MS;
  const absoluteFirst = s.absoluteExpiry <= idleWarnPoint + LEAD_MS;
  const shownAt = absoluteFirst ? Math.min(idleWarnPoint, absWarnPoint) : idleWarnPoint;
  let variant: WarningVariant | null = null;
  if (s.signedIn) {
    if (absoluteFirst) {
      // absoluteExpiry <= idleExpiry here, so the 8-hour limit is the end of the session.
      if (now >= shownAt && now < s.absoluteExpiry) variant = 'absolute';
    } else if (now >= idleWarnPoint && now < idleExpiry) {
      variant = 'idle';
    }
  }
  return {
    variant,
    idleExpiry,
    absoluteExpiry: s.absoluteExpiry,
    idleWarnPoint,
    absWarnPoint,
    absoluteFirst,
    shownAt,
  };
}
