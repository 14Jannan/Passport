import { useEffect, useState } from 'react';

export function useDebouncedSearch(delay = 300) {
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setQuery(text.trim()), delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  function change(value: string) {
    setText(value);
    if (!value.trim()) {
      setQuery('');
    }
  }

  return { text, query, change };
}
