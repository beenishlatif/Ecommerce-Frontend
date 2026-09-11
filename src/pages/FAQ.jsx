import PageHeader from '../components/PageHeader.jsx';

export default function FAQ() {
  return (
    <div>
      <PageHeader title="Frequently Asked Questions" subtitle="Answers to common questions." />
      <div className="section-padding max-w-2xl mx-auto space-y-4">
        {[
          ['How long does shipping take?', 'Orders typically arrive within 3-5 business days.'],
          ['What is your return policy?', 'We accept returns within 7 days of delivery.'],
          ['Do you ship internationally?', 'Currently we ship within Pakistan only.'],
        ].map(([q, a]) => (
          <div key={q} className="card p-5">
            <p className="font-medium text-charcoal-800 mb-1">{q}</p>
            <p className="text-sm text-charcoal-500">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
