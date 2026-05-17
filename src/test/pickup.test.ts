import { describe, expect, it } from 'vitest';
import { ASAP_PICKUP_VALUE, getPriorityFee, validatePickupTime } from '../app/utils/pickup';

describe('pickup validation', () => {
  it('adds priority fee for ASAP pickup', () => {
    expect(getPriorityFee(ASAP_PICKUP_VALUE)).toBe(20);
    expect(getPriorityFee('12:30 PM')).toBe(0);
  });

  it('allows ASAP regardless of current time', () => {
    expect(validatePickupTime(ASAP_PICKUP_VALUE, new Date('2026-05-16T12:00:00')).isValid).toBe(true);
  });

  it('rejects regular pickup times under the 30-minute buffer', () => {
    const result = validatePickupTime('12:15 PM', new Date('2026-05-16T12:00:00'));

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least 30 minutes');
  });

  it('warns when selected pickup time already passed today', () => {
    const result = validatePickupTime('11:00 AM', new Date('2026-05-16T14:00:00'));

    expect(result.isValid).toBe(true);
    expect(result.warning).toContain('tomorrow');
  });
});
