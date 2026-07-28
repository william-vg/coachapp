import { useState, useCallback } from 'react';

export function useForm(initialValues, validators = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback(
    (fieldValues = values) => {
      const errs = {};
      Object.entries(validators).forEach(([field, rules]) => {
        const val = fieldValues[field];
        for (const rule of rules) {
          const err = rule(val, fieldValues);
          if (err) { errs[field] = err; break; }
        }
      });
      return errs;
    },
    [validators, values]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const errs = validate({ ...values, [name]: values[name] });
      setErrors((prev) => ({ ...prev, [name]: errs[name] }));
    },
    [validate, values]
  );

  const handleSubmit = useCallback(
    (onSubmit) => (e) => {
      e.preventDefault();
      const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
      setTouched(allTouched);
      const errs = validate();
      setErrors(errs);
      if (Object.keys(errs).length === 0) onSubmit(values);
    },
    [validate, values]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, reset };
}
