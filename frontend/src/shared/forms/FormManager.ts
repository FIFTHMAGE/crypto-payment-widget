/**
 * @title FormManager
 * @description Proper form management architecture
 */

import { useState, useCallback } from 'react';

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
}

export const useFormManager = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void>
) => {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
  });

  const setValue = useCallback((field: keyof T, value: any) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      touched: { ...prev.touched, [field]: true },
    }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    try {
      await onSubmit(formState.values);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.values, onSubmit]);

  return { formState, setValue, setError, handleSubmit };
};

