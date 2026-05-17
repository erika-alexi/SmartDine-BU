export const ASAP_PICKUP_VALUE = 'ASAP';
export const ASAP_PRIORITY_FEE = 20;

export interface PickupValidationResult {
  isValid: boolean;
  warning?: string;
  error?: string;
}

export function getPickupOptions() {
  const options = [{ value: ASAP_PICKUP_VALUE, label: 'ASAP (10-15 mins) + ₱20 Priority Fee' }];

  for (let hour = 11; hour <= 17; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 17 && minute === 30) continue;
      const date = new Date();
      date.setHours(hour, minute, 0, 0);
      options.push({
        value: formatPickupTime(date),
        label: formatPickupTime(date)
      });
    }
  }

  return options;
}

export function formatPickupTime(date: Date) {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export function getPriorityFee(pickupTime: string) {
  return pickupTime === ASAP_PICKUP_VALUE ? ASAP_PRIORITY_FEE : 0;
}

export function getDisplayPickupTime(pickupTime: string) {
  return pickupTime === ASAP_PICKUP_VALUE ? 'ASAP (10-15 mins)' : pickupTime;
}

export function validatePickupTime(pickupTime: string, now = new Date()): PickupValidationResult {
  if (!pickupTime) {
    return { isValid: false, error: 'Please select a pickup time.' };
  }

  if (pickupTime === ASAP_PICKUP_VALUE) {
    return { isValid: true };
  }

  const match = pickupTime.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) {
    return { isValid: false, error: 'Invalid pickup time.' };
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (meridiem === 'PM' && hour !== 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  const selected = new Date(now);
  selected.setHours(hour, minute, 0, 0);

  if (selected.getTime() < now.getTime()) {
    return {
      isValid: true,
      warning: 'This pickup time has already passed today. Your order will be prepared for tomorrow.'
    };
  }

  const minimumRegularPickup = new Date(now.getTime() + 30 * 60 * 1000);
  if (selected.getTime() < minimumRegularPickup.getTime()) {
    return {
      isValid: false,
      error: 'Pickup time must be at least 30 minutes from now. Please select ASAP (₱20 priority fee) or a later time.'
    };
  }

  return { isValid: true };
}
