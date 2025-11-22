// Silent toast wrapper - disables all toast notifications globally
// To re-enable toasts, change the imports below to import from 'sonner'

const noop = () => {};

// Silent toast object that does nothing
export const toast = {
  success: noop,
  error: noop,
  info: noop,
  warning: noop,
  loading: noop,
  promise: noop,
  custom: noop,
  message: noop,
  dismiss: noop,
};

export default toast;

// To re-enable toasts, replace the above with:
// export { toast } from 'sonner';
// export { default } from 'sonner';
