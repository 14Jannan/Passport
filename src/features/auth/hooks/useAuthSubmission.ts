import { useRef, useState } from 'react';
import { authErrorMessage } from '../api/authApi';
import { SessionWriteError } from '../services/authStorage';

export function useAuthSubmission(operation: 'login' | 'register') {
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function run(request: () => Promise<void>) {
    if (lock.current) {
      return;
    }
    lock.current = true;
    setPending(true);
    setError('');
    try {
      await request();
    } catch (failure) {
      setError(
        failure instanceof SessionWriteError
          ? failure.message
          : authErrorMessage(failure, operation),
      );
    } finally {
      lock.current = false;
      setPending(false);
    }
  }

  return { pending, error, run };
}
