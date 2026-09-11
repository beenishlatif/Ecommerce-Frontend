import { RotateCcw, PackageCheck, BadgeCheck, Clock, Sparkles, Leaf, Package, Handshake } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';

const VALUES = [
  {
    icon: Leaf,
    title: 'Considered materials',
    desc: "Every piece is chosen for how it feels, wears, and lasts — not just how it photographs.",
  },
  {
    icon: Package,
    title: 'Small, careful batches',
    desc: "As a new business, we'd rather grow slowly with people we trust than rush production.",
  },
  {
    icon: Handshake,
    title: 'Direct to you',
    desc: 'No middlemen, no markup games — just honest pricing on things worth keeping.',
  },
];

const POLICY_STEPS = [
  {
    icon: Clock,
    title: '7-day return window',
    desc: "You can request a return within 7 days of receiving your order. Requests made after this window can't be accepted.",
  },
  {
    icon: PackageCheck,
    title: 'Item condition',
    desc: "The item must be unused, unworn, and in its original packaging with tags attached. We're a small team, so items that arrive damaged or altered can't be accepted for return.",
  },
  {
    icon: RotateCcw,
    title: 'Send it back safely',
    desc: "Pack the item securely and ship it to the return address we provide. We recommend a tracked courier — Lumière isn't responsible for items lost or damaged in transit back to us.",
  },
  {
    icon: BadgeCheck,
    title: 'Refund on safe arrival',
    desc: "Once the item reaches us safely and passes a quick quality check to confirm it's unused and in its original condition, we'll process your refund to the original payment method. Refunds are usually reflected within 5–7 business days after approval.",
  },
];

export default function About() {
  return (
    <div>
      <PageHeader title="About Us" subtitle="The story behind Lumière." />

      {/* Story + side image */}
      <div className="max-w-5xl mx-auto px-5 sm:px-6 md:px-8 py-14 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="order-2 md:order-1">
            <p className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase text-blush-500 font-semibold mb-4">
              <Sparkles size={12} /> Est. 2026
            </p>
            <h2 className=" text-3xl sm:text-4xl md:text-[2.6rem] text-charcoal-900 italic leading-[1.15] mb-6">
              Quiet luxury, made honestly.
            </h2>
            <p className="text-charcoal-600 leading-relaxed text-[15px] sm:text-base">
              Lumière was founded on a simple idea: everyday essentials deserve
              thoughtful design. We're a young brand — launched in 2026 — built by
              people who'd rather do a few things properly than many things fast.
              We work with makers who care about quality, sustainability, and
              timeless style, bringing soft luxury into your daily life without
              excess or noise.
            </p>
          </div>

          <div className="order-1 md:order-2">
            <div className="relative">
              <div className="w-full h-[280px] sm:h-[360px] md:h-[440px] rounded-[1.75rem] overflow-hidden shadow-soft">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop"
                  alt="Softly lit still life of curated everyday essentials"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* subtle decorative accent behind the image for depth */}
              <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-[1.75rem] bg-blush-100/60 hidden sm:block" />
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-charcoal-50/50 border-t border-b border-charcoal-100">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 md:px-8 py-14 sm:py-20">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[11px] tracking-[0.2em] uppercase text-blush-500 font-semibold mb-3">
              What we stand for
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl text-charcoal-900">Our values</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-7">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-cream-50 rounded-2xl p-7 shadow-sm hover:shadow-soft transition-shadow"
              >
                <div className="h-11 w-11 rounded-full bg-lilac-50 flex items-center justify-center text-lilac-500 mb-5">
                  <Icon size={18} />
                </div>
                <h4 className="font-serif text-lg text-charcoal-900 mb-2.5">{title}</h4>
                <p className="text-charcoal-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Return & Refund Policy */}
      <div className="max-w-3xl mx-auto px-5 sm:px-6 md:px-0 py-16 sm:py-24">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[11px] tracking-[0.2em] uppercase text-blush-500 font-semibold mb-3">
            Peace of mind
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-charcoal-900 mb-4">
            Returns &amp; refunds
          </h2>
          <p className="text-charcoal-600 leading-relaxed text-[15px] sm:text-base max-w-lg mx-auto">
            We want you to be genuinely happy with what you buy. If something
            isn't right, here's exactly how returns work.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-5">
          {POLICY_STEPS.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="flex gap-4 sm:gap-5 bg-cream-50 rounded-2xl p-5 sm:p-6 shadow-sm"
            >
              <div className="flex-shrink-0 relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-charcoal-800 flex items-center justify-center">
                  <Icon size={17} className="text-cream-50" />
                </div>
                {i < POLICY_STEPS.length - 1 && (
                  <div className="hidden sm:block absolute left-1/2 top-11 w-px h-[calc(100%+1.25rem)] -translate-x-1/2 bg-charcoal-800/10" />
                )}
              </div>
              <div className="pt-1.5">
                <h3 className="text-charcoal-900 font-medium mb-1.5 text-[15px] sm:text-base">{title}</h3>
                <p className="text-charcoal-600 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 p-5 sm:p-6 bg-charcoal-800 rounded-2xl text-center">
          <p className="text-cream-100/90 text-sm leading-relaxed">
            Questions about a return? Reach out to us at{' '}
            <a href="mailto:support@lumiere.com" className="text-cream-50 underline underline-offset-2 font-medium">
              support@lumiere.com
            </a>{' '}
            and we'll help you sort it out.
          </p>
        </div>
      </div>
    </div>
  );
}