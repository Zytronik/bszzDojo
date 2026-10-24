export interface Feedback {
  status: 'success' | 'error';
  text: string;
}

export function success(text: string): Feedback {
  return { status: 'success', text };
}

export function failure(text: string): Feedback {
  return { status: 'error', text };
}
