import { useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';

const EMAIL = 'beenishlatif1026@gmail.com';
const PHONE_DISPLAY = '0301 0861481';
const PHONE_WHATSAPP = '923010861481';

const contactDetails = [
  {
    label: 'Email',
    value: EMAIL,
    href: `mailto:${EMAIL}`,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="5" width="18" height="14" rx="2" strokeLinejoin="round" />
        <path d="M3 7 L12 13 L21 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    value: PHONE_DISPLAY,
    href: `https://wa.me/${PHONE_WHATSAPP}`,
    external: true,
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M20 12a8 8 0 1 1-3.4-6.55" strokeLinecap="round" />
        <path d="M20 4l-5 5" strokeLinecap="round" />
        <path
          d="M8.5 9.5c.3 2.7 2.3 4.7 5 5l1-1.4c.1-.2.4-.3.6-.2l2 .8c.2.1.4.3.4.6v1.6c0 .6-.5 1.1-1.1 1.1C11.9 17 7 12.1 6.6 7.6c0-.6.4-1.1 1-1.1H9.2c.3 0 .5.2.6.4l.8 2c.1.2 0 .5-.2.6L9.5 9"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    label: 'Hours',
    value: 'Mon – Sat, 9:00 AM – 6:00 PM',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7 L12 12 L15.5 14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Studio',
    value: 'Faisalabad, Punjab, Pakistan',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path
          d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="9.5" r="2.3" />
      </svg>
    ),
  },
];

const faqs = [
  {
    q: 'How long does shipping take?',
    a: 'Orders within Pakistan typically arrive in 3–5 business days. You\'ll receive a tracking link once it ships.',
  },
  {
    q: 'What\'s your return policy?',
    a: 'Unworn items in original packaging can be returned within 14 days for a full refund.',
  },
  {
    q: 'Do you take custom or bulk orders?',
    a: 'Yes — message us on WhatsApp or email with details and we\'ll get back to you within a day.',
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    const subject = encodeURIComponent(`Website inquiry from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    setStatus('sent');
  };

  return (
    <div className="bg-[#FDFBF7]">
      <PageHeader title="Contact Us" subtitle="We'd love to hear from you." />

      <section className="section-padding pb-0">
        <div className="max-w-3xl mx-auto text-center">
          <h1
            className="text-charcoal-800 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 500 }}
          >
            Let's talk
          </h1>
          <p className="text-charcoal-600 leading-relaxed">
            Questions about an order, a product, or just want to say hello? Send us a
            message below, or reach out directly by email or WhatsApp — we usually
            reply within a few hours.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div className="bg-white border border-charcoal-800/10 p-8">
            <h2
              className="text-charcoal-800 mb-6"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.6rem', fontWeight: 500 }}
            >
              Send a message
            </h2>

            {status === 'sent' ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-[#E8D5D0]/60 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#6E2439]" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-charcoal-800 font-medium mb-1">Almost done</p>
                <p className="text-charcoal-600 text-sm mb-6">
                  Your email app should have opened with your message ready to send.
                </p>
                <button
                  type="button"
                  onClick={() => { setStatus('idle'); setForm({ name: '', email: '', message: '' }); }}
                  className="text-sm text-[#6E2439] underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs tracking-wide text-charcoal-600 mb-1.5">
                    Your Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Jane Doe"
                    className="w-full border border-charcoal-800/15 bg-[#FDFBF7] px-4 py-3 text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-[#6E2439] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wide text-charcoal-600 mb-1.5">
                    Your Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="jane@example.com"
                    className="w-full border border-charcoal-800/15 bg-[#FDFBF7] px-4 py-3 text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-[#6E2439] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wide text-charcoal-600 mb-1.5">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="How can we help?"
                    className="w-full border border-charcoal-800/15 bg-[#FDFBF7] px-4 py-3 text-sm text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-[#6E2439] transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#2B2230] text-white px-6 py-3.5 text-sm tracking-wide hover:bg-[#6E2439] transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-[#2B2230] text-[#FDFBF7] p-8">
              <h2
                className="mb-6"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.6rem', fontWeight: 500 }}
              >
                Get in touch directly
              </h2>
              <div className="space-y-5">
                {contactDetails.map((item) => {
                  const content = (
                    <div className="flex items-start gap-4">
                      <div className="text-[#C9A9A6] mt-0.5">{item.icon}</div>
                      <div>
                        <div className="text-xs tracking-wide text-white/50 mb-0.5">{item.label}</div>
                        <div className="text-sm text-white/90">{item.value}</div>
                      </div>
                    </div>
                  );
                  return item.href ? (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className="block hover:opacity-75 transition-opacity"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={item.label}>{content}</div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <a
                href={`https://wa.me/${PHONE_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-2 border border-charcoal-800/10 bg-white py-5 text-center hover:border-[#6E2439] transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#6E2439]" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M20 12a8 8 0 1 1-3.4-6.55" strokeLinecap="round" />
                  <path d="M20 4l-5 5" strokeLinecap="round" />
                </svg>
                <span className="text-xs tracking-wide text-charcoal-800">WhatsApp Us</span>
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className="flex flex-col items-center justify-center gap-2 border border-charcoal-800/10 bg-white py-5 text-center hover:border-[#6E2439] transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#6E2439]" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="5" width="18" height="14" rx="2" strokeLinejoin="round" />
                  <path d="M3 7 L12 13 L21 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs tracking-wide text-charcoal-800">Email Us</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-charcoal-800 mb-8 text-center"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '2rem', fontWeight: 500 }}
          >
            Frequently asked
          </h2>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="border-b border-charcoal-800/10 pb-6">
                <h3 className="text-charcoal-800 font-medium mb-2">{f.q}</h3>
                <p className="text-charcoal-600 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}