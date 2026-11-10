import { useState } from 'react';
import { FiCheckCircle } from 'react-icons/fi';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

const validate = (v) => {
  const e = {};
  if (!v.name.trim()) e.name = 'Name is required';
  else if (v.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
  if (!v.email.trim()) e.email = 'Email is required';
  else if (!EMAIL_RE.test(v.email)) e.email = 'Enter a valid email address';
  if (v.phone && !/^[0-9+\-\s()]{7,15}$/.test(v.phone)) e.phone = 'Enter a valid phone number';
  if (!v.subject.trim()) e.subject = 'Subject is required';
  if (!v.message.trim()) e.message = 'Message is required';
  else if (v.message.trim().length < 10) e.message = 'Message must be at least 10 characters';
  return e;
};

const INITIAL = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
  const [values, setValues] = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [sent, setSent] = useState(false);

  const errors = validate(values);
  const show = (f) => touched[f] && errors[f];

  const onChange = (e) => setValues({ ...values, [e.target.name]: e.target.value });
  const onBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const onSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, subject: true, message: true });
    if (Object.keys(errors).length) return;
    // No backend endpoint is required for this form: the submission is simulated.
    setSent(true);
    setValues(INITIAL);
    setTouched({});
  };

  const Field = ({ name, label, type = 'text', required = true, area = false }) => {
    const props = {
      id: name, name, value: values[name], onChange, onBlur,
      className: `input ${show(name) ? 'input-error' : ''}`,
      'aria-invalid': Boolean(show(name)),
    };
    return (
      <div>
        <label htmlFor={name} className="mb-1 block text-sm font-medium">{label}{required && ' *'}</label>
        {area ? <textarea rows={5} {...props} /> : <input type={type} {...props} />}
        {show(name) && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Contact us</h1>
      <p className="mb-6 text-slate-500">Questions about an order or a product? Send us a message.</p>

      {sent && (
        <div role="status" className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
          <FiCheckCircle /> Thanks! Your message has been sent. We'll get back to you soon.
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="card space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {Field({ name: 'name', label: 'Name' })}
          {Field({ name: 'email', label: 'Email', type: 'email' })}
        </div>
        {Field({ name: 'phone', label: 'Phone (optional)', type: 'tel', required: false })}
        {Field({ name: 'subject', label: 'Subject' })}
        {Field({ name: 'message', label: 'Message', area: true })}
        <button type="submit" className="btn btn-primary w-full sm:w-auto">Send message</button>
      </form>
    </div>
  );
}
