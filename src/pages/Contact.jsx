import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Instagram, Facebook, Send, Check } from 'lucide-react';

function ContactStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&display=swap');

      .ct-label {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #8a8378;
        margin-bottom: 6px;
        display: block;
      }
      .ct-input {
        width: 100%;
        border: none;
        border-bottom: 1px solid rgba(26,26,26,0.14);
        background: transparent;
        padding: 10px 2px;
        font-size: 14.5px;
        color: #1a1a1a;
        transition: border-color 0.25s ease;
      }
      .ct-input::placeholder { color: #b8b2a8; }
      .ct-input:focus {
        outline: none;
        border-bottom-color: #d9788a;
      }
      textarea.ct-input {
        resize: none;
        line-height: 1.6;
      }

      .ct-submit {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 999px;
        background: #1a1a1a;
        color: #fdfbf8;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.04em;
        padding: 13px 30px;
        border: none;
        cursor: pointer;
        transition: background 0.25s ease, transform 0.15s ease;
      }
      .ct-submit:hover:not(:disabled) { background: #d9788a; }
      .ct-submit:active:not(:disabled) { transform: scale(0.98); }
      .ct-submit:disabled { opacity: 0.55; cursor: not-allowed; }

      .ct-info-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(217,120,138,0.08);
        color: #d9788a;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .ct-social {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid rgba(26,26,26,0.12);
        color: #4a4642;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
      }
      .ct-social:hover {
        background: #1a1a1a;
        border-color: #1a1a1a;
        color: #fff;
      }

      .ct-price, .ct-serif { font-family: 'Cormorant Garamond', serif; }
    `}</style>
  );
}

const CONTACT_DETAILS = [
  {
    icon: Mail,
    label: 'Email us',
    value: 'hello@lumiere.pk',
    href: 'mailto:hello@lumiere.pk',
  },
  {
    icon: Phone,
    label: 'Call us',
    value: '+92 300 1234567',
    href: 'tel:+923001234567',
  },
  {
    icon: MapPin,
    label: 'Visit us',
    value: 'Faisalabad, Punjab, Pakistan',
    href: null,
  },
  {
    icon: Clock,
    label: 'Working hours',
    value: 'Mon – Sat, 10:00 AM – 7:00 PM',
    href: null,
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setStatus('sending');
    setError('');
    try {
      // TODO: wire this up to your backend, e.g.
      // await contactApi.send(form);
      await new Promise((resolve) => setTimeout(resolve, 900));
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-cream-50 min-h-screen">
      <ContactStyles />

      {/* ── Title strip ── */}
      <div className="border-b border-charcoal-800/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-9 sm:pt-14 pb-6 sm:pb-8">
          <p className="text-[10px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal-400 mb-2">
            Home <span className="mx-1 text-charcoal-300">/</span> Contact
          </p>
          <h1 className="font-serif text-[28px] sm:text-4xl text-charcoal-800">Get in Touch</h1>
          <p className="text-xs sm:text-sm text-charcoal-400 mt-2 max-w-md">
            Questions about an order, a product, or just want to say hello — we'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16">

          {/* ── Form ── */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-charcoal-400 mb-2">
              Send a message
            </p>
            <h2 className="ct-serif text-2xl sm:text-3xl font-semibold text-charcoal-800 mb-8">
              We usually reply within a day
            </h2>

            {status === 'sent' ? (
              <div className="flex items-start gap-3.5 rounded-2xl border border-charcoal-800/[0.08] bg-white/60 p-5 sm:p-6">
                <span className="h-9 w-9 rounded-full bg-blush-500 text-white flex items-center justify-center shrink-0">
                  <Check size={16} strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-sm font-medium text-charcoal-800">Message sent</p>
                  <p className="text-sm text-charcoal-400 mt-1">
                    Thank you for reaching out — we'll get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="text-xs text-blush-500 hover:text-blush-600 font-medium mt-3 underline underline-offset-2"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="ct-label" htmlFor="ct-name">Name</label>
                    <input
                      id="ct-name"
                      type="text"
                      required
                      placeholder="Your full name"
                      value={form.name}
                      onChange={update('name')}
                      className="ct-input"
                    />
                  </div>
                  <div>
                    <label className="ct-label" htmlFor="ct-email">Email</label>
                    <input
                      id="ct-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={update('email')}
                      className="ct-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="ct-label" htmlFor="ct-subject">Subject</label>
                  <input
                    id="ct-subject"
                    type="text"
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={update('subject')}
                    className="ct-input"
                  />
                </div>

                <div>
                  <label className="ct-label" htmlFor="ct-message">Message</label>
                  <textarea
                    id="ct-message"
                    required
                    rows={5}
                    placeholder="Tell us a little more…"
                    value={form.message}
                    onChange={update('message')}
                    className="ct-input"
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs text-red-500">{error}</p>
                )}

                <button type="submit" disabled={status === 'sending'} className="ct-submit">
                  {status === 'sending' ? (
                    'Sending…'
                  ) : (
                    <>
                      Send Message <Send size={14} strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* ── Contact info ── */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-charcoal-400 mb-2">
              Reach us directly
            </p>
            <h2 className="ct-serif text-2xl sm:text-3xl font-semibold text-charcoal-800 mb-8">
              Other ways to connect
            </h2>

            <div className="space-y-6">
              {CONTACT_DETAILS.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <span className="ct-info-icon">
                    <Icon size={17} strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-charcoal-400 mb-0.5">
                      {label}
                    </p>
                    {href ? (
                      <a href={href} className="text-[15px] text-charcoal-800 hover:text-blush-500 transition-colors">
                        {value}
                      </a>
                    ) : (
                      <p className="text-[15px] text-charcoal-800">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-charcoal-800/[0.08] my-8" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-charcoal-400 mb-3">
              Follow along
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="ct-social">
                <Instagram size={16} strokeWidth={1.8} />
              </a>
              <a href="#" aria-label="Facebook" className="ct-social">
                <Facebook size={16} strokeWidth={1.8} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}